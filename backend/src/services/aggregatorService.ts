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
): Promise<ThreatObject | ThreatObject[] | null> {
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
    if (finalCourse == null && matchedThreat.locations.length > 0) {
      const prevLoc = matchedThreat.locations[0];
      const dist = getDistanceFromLatLonInKm(lat, lng, prevLoc.lat, prevLoc.lng);
      if (dist > 1.0) {
          finalCourse = calculateBearing(prevLoc.lat, prevLoc.lng, lat, lng);
      }
    }

    if (finalSpeed == null) {
        finalSpeed = matchedThreat.speed;
    }

    return await updateThreat(matchedThreat, lat, lng, time, sourceId, finalSpeed, finalCourse, trailLocations, confidence, quantity, targetName, targetLat, targetLng);
  }

  // 3. Create new threat
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
  if (targetLat != null && targetLng != null) {
      const distToTarget = getDistanceFromLatLonInKm(lat, lng, targetLat, targetLng);
      if (distToTarget > 1.0) {
          finalCourse = calculateBearing(lat, lng, targetLat, targetLng);
      }
  }

  const initialConfidence = 0.4;
  const createdThreats = [];

  // If quantity > 1, create multiple separate objects with a tiny coordinate offset
  const actualQuantity = Math.min(quantity || 1, 30); // Cap at 30 to avoid DB spam
  for (let i = 0; i < actualQuantity; i++) {
    // Add a small pseudo-random offset (approx 100-300 meters) so they don't overlap perfectly
    const offsetLat = lat + (i > 0 ? (Math.random() - 0.5) * 0.005 : 0);
    const offsetLng = lng + (i > 0 ? (Math.random() - 0.5) * 0.005 : 0);

    const newThreat = await prisma.threatObject.create({
      data: {
        externalId: i === 0 ? externalId : null, // Only bind externalId to the first one
        type: threatType as ReportType,
        confidence: Math.max(confidence, initialConfidence),
        status: ReportStatus.ACTIVE,
        speed: defaultSpeed,
        course: finalCourse,
        quantity: 1, // Since we split them, each one is 1
        targetName,
        targetLat,
        targetLng,
        locations: {
          createMany: {
            data: trailLocations && trailLocations.length > 0 ? trailLocations : [{
              lat: offsetLat,
              lng: offsetLng,
              time,
              sourceId
            }]
          }
        }
      },
      include: { locations: { orderBy: { time: 'desc' }, include: { source: true } } }
    });
    
    createdThreats.push(newThreat);
  }

  return createdThreats;
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
  if (targetLat != null && targetLng != null) {
      // Always recalculate course if we know the exact target destination!
      const distToTarget = getDistanceFromLatLonInKm(lat, lng, targetLat, targetLng);
      if (distToTarget > 1.0) {
          finalCourse = calculateBearing(lat, lng, targetLat, targetLng);
      } else {
          finalCourse = existingThreat.course;
      }
  } else if (finalCourse == null) {
      finalCourse = existingThreat.course;
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
        const { sendSmartAllClear } = require('../workers/botWorker');
        sendSmartAllClear(t.id);
      }
    }
  }
}

export async function archiveThreatsBySource(sourceId: string, io: Server): Promise<void> {
  const activeThreats = await prisma.threatObject.findMany({
    where: { status: 'ACTIVE' },
    include: { locations: { orderBy: { time: 'desc' }, include: { source: true } } }
  });

  for (const t of activeThreats) {
    if (t.locations.length > 0) {
      const uniqueSources = new Set(t.locations.map(l => l.sourceId).filter(Boolean));
      if (uniqueSources.has(sourceId) || t.locations[0].sourceId === sourceId) {
        console.log(`[All-Clear] Archiving threat ${t.id} (${t.type}) because source ${sourceId} reported clear.`);
        const archived = await prisma.threatObject.update({
          where: { id: t.id },
          data: { status: 'ARCHIVED' },
          include: { locations: { orderBy: { time: 'desc' }, include: { source: true } } }
        });
        io.emit('threat:update', archived);
        const { sendSmartAllClear } = require('../workers/botWorker');
        sendSmartAllClear(t.id);
      }
    }
  }
}

function rad2deg(rad: number) { return rad * (180/Math.PI); }
