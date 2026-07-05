import prisma from '../db';
import { ReportType, ThreatObject } from '@prisma/client';
import { getIO } from '../socket';

/**
 * Calculates distance between two coordinates in kilometers using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Calculates bearing/azimuth between two points
 */
function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const y = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
            Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos((lon2 - lon1) * Math.PI / 180);
  const brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Process a new raw report and either cluster it with an existing active ThreatObject or create a new one.
 */
export async function processNewThreatLocation(
  type: ReportType, 
  lat: number, 
  lng: number, 
  time: Date, 
  sourceId: string | null
) {
  // 1. Find existing active threats of the SAME TYPE in the vicinity
  // Max distance in km to cluster (e.g., 150km for fast objects, 50km for drones)
  const CLUSTER_RADIUS_KM = type === 'DRONE' ? 80 : 250; 
  const TIME_WINDOW_MS = 60 * 60 * 1000; // 1 hour max between points

  const activeThreats = await prisma.threatObject.findMany({
    where: { 
      status: 'ACTIVE',
      type: type,
      updatedAt: {
        gte: new Date(Date.now() - TIME_WINDOW_MS)
      }
    },
    include: {
      locations: {
        orderBy: { time: 'desc' },
        take: 1
      }
    }
  });

  let matchedThreat: ThreatObject | null = null;
  let minDistance = Infinity;

  for (const threat of activeThreats) {
    if (threat.locations.length > 0) {
      const lastLoc = threat.locations[0];
      // Time difference must be strictly positive (new report is newer)
      // Or at least not strictly negative. For simplicity, ignore strict time order for clustering right now.
      const dist = calculateDistance(lastLoc.lat, lastLoc.lng, lat, lng);
      
      if (dist < CLUSTER_RADIUS_KM && dist < minDistance) {
        minDistance = dist;
        matchedThreat = threat;
      }
    }
  }

  let finalThreat: ThreatObject;

  if (matchedThreat) {
    // Attach to existing threat
    await prisma.threatLocation.create({
      data: {
        lat, lng, time, sourceId,
        threatObjectId: matchedThreat.id
      }
    });
    
    // Recalculate course and speed based on last two locations
    const lastLoc = matchedThreat.locations[0];
    const timeDiffHours = (time.getTime() - lastLoc.time.getTime()) / (1000 * 60 * 60);
    
    let speed = matchedThreat.speed;
    let course = matchedThreat.course;
    
    if (timeDiffHours > 0) {
      speed = minDistance / timeDiffHours; // km/h
      course = calculateBearing(lastLoc.lat, lastLoc.lng, lat, lng);
    }
    
    finalThreat = await prisma.threatObject.update({
      where: { id: matchedThreat.id },
      data: { speed, course, updatedAt: new Date() },
      include: { locations: { orderBy: { time: 'desc' } } }
    });

  } else {
    // Create new tracked object
    finalThreat = await prisma.threatObject.create({
      data: {
        type,
        status: 'ACTIVE',
        locations: {
          create: { lat, lng, time, sourceId }
        }
      },
      include: { locations: true }
    });
  }

  // Emit the updated tracked object to clients
  getIO().emit('threat:update', finalThreat);
  return finalThreat;
}
