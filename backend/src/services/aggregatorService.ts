import prisma from '../db';
import { ReportType, ReportStatus, ThreatObject } from '@prisma/client';

export async function processExternalThreat(
  externalId: string | null,
  threatType: ReportType | string,
  lat: number,
  lng: number,
  time: Date,
  sourceId: string,
  speed?: number | null,
  course?: number | null,
  confidence: number = 1.0,
  trailLocations?: Array<{lat: number, lng: number, time: Date, sourceId: string}>
): Promise<ThreatObject | null> {
  // If it's a PPO event (Shot down / Destroyed)
  if (threatType === 'PPO') {
    // Find closest ACTIVE threat
    const activeThreats = await prisma.threatObject.findMany({
      where: { status: 'ACTIVE' },
      include: { locations: { orderBy: { time: 'desc' }, take: 1 } }
    });
    
    let closestThreat = null;
    let minDistance = 50; // Max radius to consider (50km)
    
    for (const t of activeThreats) {
      if (t.locations.length > 0) {
        const d = getDistanceFromLatLonInKm(lat, lng, t.locations[0].lat, t.locations[0].lng);
        if (d < minDistance) {
          minDistance = d;
          closestThreat = t;
        }
      }
    }
    
    if (closestThreat) {
      console.log(`[PPO] Archiving closest threat ${closestThreat.id} (${minDistance.toFixed(1)} km away)`);
      return await prisma.threatObject.update({
        where: { id: closestThreat.id },
        data: { status: 'ARCHIVED' },
        include: { locations: { orderBy: { time: 'desc' }, include: { source: true } } }
      });
    }
    return null; // Nothing to destroy nearby
  }

  // 1. Exact match via externalId
  if (externalId) {
    const existing = await prisma.threatObject.findUnique({
      where: { externalId },
      include: { locations: { orderBy: { time: 'desc' }, take: 1 } }
    });
    if (existing) {
      return await updateThreat(existing, lat, lng, time, sourceId, speed, course, trailLocations, confidence);
    }
  }

  // 2. Fuzzy match via distance and type (Deduplication)
  const recentThreats = await prisma.threatObject.findMany({
    where: { status: ReportStatus.ACTIVE, type: threatType },
    include: { locations: { orderBy: { time: 'desc' }, take: 1 } }
  });

  let matchedThreat = null;
  for (const t of recentThreats) {
    if (t.locations.length > 0) {
      const loc = t.locations[0];
      const dist = getDistanceFromLatLonInKm(lat, lng, loc.lat, loc.lng);
      // Merge if within 30km (duplicate removal)
      if (dist < 30) {
        matchedThreat = t;
        break;
      }
    }
  }

  if (matchedThreat) {
    // If no speed/course provided, try to calculate from previous point
    let finalSpeed = speed;
    let finalCourse = course;
    if ((finalSpeed == null || finalCourse == null) && matchedThreat.locations.length > 0) {
      const prevLoc = matchedThreat.locations[0];
      const dtHours = (time.getTime() - prevLoc.time.getTime()) / (1000 * 60 * 60);
      if (dtHours > 0) {
        const dist = getDistanceFromLatLonInKm(lat, lng, prevLoc.lat, prevLoc.lng);
        if (finalSpeed == null) finalSpeed = dist / dtHours;
        if (finalCourse == null) finalCourse = calculateBearing(prevLoc.lat, prevLoc.lng, lat, lng);
      }
    }

    return await updateThreat(matchedThreat, lat, lng, time, sourceId, finalSpeed, finalCourse, trailLocations, confidence);
  }

  // 3. Create new threat
  const newThreat = await prisma.threatObject.create({
    data: {
      externalId,
      type: threatType,
      confidence,
      status: ReportStatus.ACTIVE,
      speed,
      course,
      locations: {
        createMany: {
          data: trailLocations && trailLocations.length > 0 ? trailLocations : [{
            lat,
            lng,
            time,
            sourceId
          }]
        }
      }
    },
    include: { locations: { orderBy: { time: 'desc' }, include: { source: true } } }
  });

  return newThreat;
}

async function updateThreat(
  existingThreat: any, 
  lat: number, 
  lng: number, 
  time: Date, 
  sourceId: string, 
  speed?: number | null, 
  course?: number | null,
  trailLocations?: Array<{lat: number, lng: number, time: Date, sourceId: string}>,
  newConfidence: number = 1.0
) {
  let newLocations = trailLocations;
  
  if (!newLocations || newLocations.length === 0) {
    newLocations = [{ lat, lng, time, sourceId }];
  }

  // Filter out locations we already have (by timestamp)
  const lastSavedTime = existingThreat.locations[0]?.time.getTime() || 0;
  const pointsToSave = newLocations.filter(t => t.time.getTime() > lastSavedTime);

  // Preserve highest confidence (e.g., if Telegram AI sets 1.0, don't downgrade it to 0.3 from Mapa)
  const finalConfidence = Math.max(existingThreat.confidence || 0, newConfidence);

  return await prisma.threatObject.update({
    where: { id: existingThreat.id },
    data: {
      speed: speed ?? existingThreat.speed,
      course: course ?? existingThreat.course,
      confidence: finalConfidence,
      locations: pointsToSave.length > 0 ? { createMany: { data: pointsToSave } } : undefined
    },
    include: { locations: { orderBy: { time: 'desc' }, include: { source: true } } }
  });
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = deg2rad(lat2-lat1);
  const dLon = deg2rad(lon2-lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number) {
  const y = Math.sin(deg2rad(lon2-lon1)) * Math.cos(deg2rad(lat2));
  const x = Math.cos(deg2rad(lat1))*Math.sin(deg2rad(lat2)) -
            Math.sin(deg2rad(lat1))*Math.cos(deg2rad(lat2))*Math.cos(deg2rad(lon2-lon1));
  const brng = Math.atan2(y, x);
  return (rad2deg(brng) + 360) % 360;
}

function deg2rad(deg: number) { return deg * (Math.PI/180); }
function rad2deg(rad: number) { return rad * (180/Math.PI); }
