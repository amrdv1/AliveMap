import prisma from '../db';
import { ReportType, ReportStatus, ThreatObject } from '@prisma/client';
import { Server } from 'socket.io';

export async function processExternalThreat(
  externalId: string | null,
  threatType: ReportType | string,
  lat: number,
  lng: number,
  time: Date,
  sourceId: string | null,
  speed?: number | null,
  course?: number | null,
  confidence: number = 1.0,
  quantity: number = 1,
  targetName: string | null = null,
  targetLat: number | null = null,
  targetLng: number | null = null,
  trailLocations?: Array<{lat: number, lng: number, time: Date, sourceId: string | null}>
): Promise<ThreatObject | null> {
  // If it's a PPO event (Shot down / Destroyed)
  if (threatType === 'PPO') {
    // Find closest ACTIVE threat
    const activeThreats = await prisma.threatObject.findMany({
      where: { status: 'ACTIVE' },
      include: { locations: { orderBy: { time: 'desc' }, take: 1 } }
    });
    
    let closestThreat = null;
    let minDistance = 150; // Max radius to consider (150km)
    
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
      return await updateThreat(existing, lat, lng, time, sourceId, speed, course, trailLocations, confidence, quantity, targetName, targetLat, targetLng);
    }
  }

  // 2. Fuzzy match via distance and type (Deduplication)
  const recentThreats = await prisma.threatObject.findMany({
    where: { 
      status: ReportStatus.ACTIVE,
      ...(threatType !== 'UNKNOWN' ? {
        OR: [
          { type: threatType as ReportType },
          { type: 'UNKNOWN' }
        ]
      } : {})
    },
    include: { locations: { orderBy: { time: 'desc' }, take: 1 } }
  });

  let matchedThreat = null;
  for (const t of recentThreats) {
    if (t.locations.length > 0) {
      const loc = t.locations[0];
      const dist = getDistanceFromLatLonInKm(lat, lng, loc.lat, loc.lng);
      
      // Merge radius depends on speed/type
      let mergeRadius = 120; // Increased for DRONEs to prevent duplicates
      if (['MISSILE', 'CRUISE_MISSILE', 'BALLISTIC_MISSILE', 'ZIRCON', 'AIRCRAFT', 'KH101', 'ISKANDER', 'KINZHAL', 'KALIBR'].includes(t.type)) {
         mergeRadius = 300;
      } else if (t.type === 'KAB') {
         mergeRadius = 100;
      }

      // Merge if within radius (duplicate removal)
      if (dist < mergeRadius) {
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
        if (finalSpeed == null) {
            finalSpeed = dist / dtHours;
            // Cap calculated speeds to prevent insane values from GPS jumps
            const maxSpeed = matchedThreat.type.includes('BALLISTIC') || matchedThreat.type === 'KINZHAL' || matchedThreat.type === 'ZIRCON' ? 12000 :
                             matchedThreat.type.includes('MISSILE') || matchedThreat.type === 'KALIBR' || matchedThreat.type === 'KH101' ? 1200 : 
                             300; // Drones
            if (finalSpeed > maxSpeed) finalSpeed = maxSpeed;
        }
        if (finalCourse == null) finalCourse = calculateBearing(prevLoc.lat, prevLoc.lng, lat, lng);
      }
    }

    return await updateThreat(matchedThreat, lat, lng, time, sourceId, finalSpeed, finalCourse, trailLocations, confidence, quantity, targetName, targetLat, targetLng);
  }

  // 3. Create new threat
  // Never create a brand new target for UNKNOWN generic movements. 
  // They should ONLY update existing targets.
  if (threatType === 'UNKNOWN') return null;
  
  let defaultSpeed = speed;
  if (defaultSpeed == null) {
      switch (threatType as ReportType) {
          case 'DRONE': defaultSpeed = 150; break;
          case 'MISSILE': 
          case 'CRUISE_MISSILE':
          case 'KH101':
          case 'KALIBR': defaultSpeed = 800; break;
          case 'BALLISTIC_MISSILE':
          case 'ISKANDER': defaultSpeed = 8000; break;
          case 'ZIRCON': 
          case 'KINZHAL': defaultSpeed = 10000; break;
          case 'KAB': defaultSpeed = 900; break;
          case 'AIRCRAFT': defaultSpeed = 900; break;
          case 'RECON': defaultSpeed = 100; break;
      }
  }

  let finalCourse = course;
  if (finalCourse == null && targetLat != null && targetLng != null) {
      finalCourse = calculateBearing(lat, lng, targetLat, targetLng);
  }

  const initialConfidence = 0.4;

  const newThreat = await prisma.threatObject.create({
    data: {
      externalId,
      type: threatType as ReportType,
      confidence: Math.max(confidence, initialConfidence),
      status: ReportStatus.ACTIVE,
      speed: defaultSpeed,
      course: finalCourse,
      quantity,
      targetName,
      targetLat,
      targetLng,
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
  sourceId: string | null, 
  speed?: number | null, 
  course?: number | null,
  trailLocations?: Array<{lat: number, lng: number, time: Date, sourceId: string | null}>,
  newConfidence: number = 0.4,
  quantity?: number,
  targetName?: string | null,
  targetLat?: number | null,
  targetLng?: number | null
) {
  let newLocations = trailLocations;
  
  if (!newLocations || newLocations.length === 0) {
    newLocations = [{ lat, lng, time, sourceId }];
  }

  // Filter out locations we already have (by timestamp)
  const lastSavedTime = existingThreat.locations[0]?.time.getTime() || 0;
  const pointsToSave = newLocations.filter((t: any) => t.time.getTime() > lastSavedTime);

  // Get unique sourceIds
  const allLocations = await prisma.threatLocation.findMany({ where: { threatObjectId: existingThreat.id }, select: { sourceId: true } });
  const uniqueSources = new Set(allLocations.map((l: any) => l.sourceId).filter(Boolean));
  pointsToSave.forEach((p: any) => { if (p.sourceId) uniqueSources.add(p.sourceId); });
  
  let dynamicConfidence = 0.4;
  if (uniqueSources.size === 2) dynamicConfidence = 0.6;
  else if (uniqueSources.size === 3) dynamicConfidence = 0.8;
  else if (uniqueSources.size >= 4) dynamicConfidence = 1.0;

  let finalTargetLat = targetLat ?? existingThreat.targetLat;
  let finalTargetLng = targetLng ?? existingThreat.targetLng;
  let finalTargetName = targetName ?? existingThreat.targetName;
  
  let finalCourse = course;
  if (finalCourse == null) {
      if (targetLat != null && targetLng != null) {
          // New explicit target destination parsed. Recalculate route!
          finalCourse = calculateBearing(lat, lng, targetLat, targetLng);
      } else {
          finalCourse = existingThreat.course;
      }
  }

  // Preserve highest confidence
  const finalConfidence = Math.max(existingThreat.confidence || 0, dynamicConfidence, newConfidence);

  return await prisma.threatObject.update({
    where: { id: existingThreat.id },
    data: {
      speed: speed ?? existingThreat.speed,
      course: finalCourse,
      quantity: quantity ?? existingThreat.quantity,
      targetName: targetName ?? existingThreat.targetName,
      targetLat: finalTargetLat,
      targetLng: finalTargetLng,
      confidence: finalConfidence,
      updatedAt: new Date(),
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

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}

export async function archiveThreatsNear(lat: number, lng: number, radiusKm: number, io: Server): Promise<void> {
  const activeThreats = await prisma.threatObject.findMany({
    where: { status: 'ACTIVE' },
    include: { locations: { orderBy: { time: 'desc' }, take: 1, include: { source: true } } }
  });

  for (const t of activeThreats) {
    if (t.locations.length > 0) {
      const loc = t.locations[0];
      const dist = getDistanceFromLatLonInKm(lat, lng, loc.lat, loc.lng);
      if (dist <= radiusKm) {
        console.log(`[All-Clear] Archiving threat ${t.id} (${t.type}) due to region all-clear (${dist.toFixed(1)} km away)`);
        const archived = await prisma.threatObject.update({
          where: { id: t.id },
          data: { status: 'ARCHIVED' },
          include: { locations: { orderBy: { time: 'desc' }, include: { source: true } } }
        });
        io.emit('threat:update', archived);
      }
    }
  }
}

function rad2deg(rad: number) { return rad * (180/Math.PI); }
