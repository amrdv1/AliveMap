import axios from 'axios';
import { Server } from 'socket.io';
import prisma from '../db';
import { ReportType, ReportStatus, SourceType } from '@prisma/client';

const MAPA_API_URL = 'https://mapa.ua/api/v1/current';

// Maps MAPA kind -> our ReportType
const KIND_MAPPING: Record<string, ReportType> = {
  'drone_piston': ReportType.DRONE,
  'drone_jet': ReportType.DRONE,
  'missile_cruise': ReportType.CRUISE_MISSILE,
  'missile_ballistic': ReportType.BALLISTIC_MISSILE,
  'bomb': ReportType.KAB,
  'default': ReportType.DRONE
};

export async function startMapaWorker(io: Server) {
  let source = await prisma.source.findFirst({ where: { name: 'MAPA.UA API' } });
  if (!source) {
    source = await prisma.source.create({
      data: { name: 'MAPA.UA API', type: SourceType.API }
    });
  }

  console.log("MAPA.UA Worker started (Selective Correlation Mode)...");

  const fetchMapaData = async () => {
    try {
      const { data } = await axios.get(MAPA_API_URL, { timeout: 10000 });
      if (!data || !data.objects) return;

      const objects = data.objects;

      for (const obj of objects) {
        if (obj.status !== 'active') continue;

        const threatType = KIND_MAPPING[obj.kind] || KIND_MAPPING['default'];
        
        // Use the last coordinate in the trail as the current, most accurate location
        const trail = obj.trail || [];
        const currentLoc = trail.length > 0 ? trail[trail.length - 1] : [obj.lon, obj.lat, Math.floor(Date.now()/1000), obj.heading];
        const [lon, lat, ts, heading] = currentLoc;
        const timestamp = new Date(ts * 1000);

        const speed = obj.speed_kmh || null;
        const course = heading || obj.heading || null;

        // ONLY search for ACTIVE threats of the same type
        const recentThreats = await prisma.threatObject.findMany({
          where: { status: ReportStatus.ACTIVE, type: threatType },
          include: { locations: { orderBy: { time: 'desc' }, take: 1 } }
        });

        let matchedThreat = null;
        for (const t of recentThreats) {
          if (t.locations.length > 0) {
            const loc = t.locations[0];
            const dist = getDistanceFromLatLonInKm(lat, lon, loc.lat, loc.lng);
            // If within 50km, assume it's the same object being tracked by Telegram
            if (dist < 50) { 
              matchedThreat = t;
              break;
            }
          }
        }

        // ONLY UPDATE if we found a match (Telegram already reported it)
        // DO NOT create new threats blindly!
        if (matchedThreat) {
          // Check if we already have this exact timestamp from MAPA to avoid spamming
          const lastMapaLoc = await prisma.threatLocation.findFirst({
            where: { threatObjectId: matchedThreat.id, sourceId: source!.id },
            orderBy: { time: 'desc' }
          });

          if (!lastMapaLoc || lastMapaLoc.time.getTime() < timestamp.getTime()) {
             const updatedThreat = await prisma.threatObject.update({
                where: { id: matchedThreat.id },
                data: {
                  speed: speed ?? matchedThreat.speed,
                  course: course ?? matchedThreat.course,
                  locations: {
                    create: {
                      lat,
                      lng: lon,
                      time: timestamp,
                      sourceId: source!.id
                    }
                  }
                },
                include: { locations: { orderBy: { time: 'desc' }, include: { source: true } } }
              });
              
              // Broadcast the refined coordinates and speed/course
              io.emit('threat:update', updatedThreat);
          }
        }
      }
    } catch (error: any) {
      console.error("Error fetching MAPA.UA API (can be ignored if down):", error.message);
    }
  };

  fetchMapaData();
  setInterval(fetchMapaData, 15000); // Poll every 15 seconds
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2-lat1);
  const dLon = deg2rad(lon2-lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}
