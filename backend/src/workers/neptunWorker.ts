import axios from 'axios';
import { Server } from 'socket.io';
import prisma from '../db';
import { ReportType, ReportStatus, SourceType } from '@prisma/client';

const NEPTUN_API_URL = 'https://neptun.in.ua/api/v1/threats';

const KIND_MAPPING: Record<string, ReportType> = {
  'uav': ReportType.DRONE,
  'recon': ReportType.RECON,
  'missile': ReportType.CRUISE_MISSILE,
  'ballistic': ReportType.BALLISTIC_MISSILE,
  'kab': ReportType.KAB,
  'mig31k': ReportType.AIRCRAFT,
  'unknown': ReportType.UNKNOWN,
  'default': ReportType.DRONE
};

export async function startNeptunWorker(io: Server) {
  let source = await prisma.source.findFirst({ where: { name: 'NEPTUN API' } });
  if (!source) {
    source = await prisma.source.create({
      data: { name: 'NEPTUN API', type: SourceType.API }
    });
  }

  console.log("NEPTUN API Worker started (Selective Correlation Mode)...");

  const fetchNeptunData = async () => {
    try {
      const { data } = await axios.get(NEPTUN_API_URL, { timeout: 10000 });
      if (!data || !data.threats) return;

      const objects = data.threats;

      for (const obj of objects) {
        if (obj.status !== 'active') continue;

        const threatType = KIND_MAPPING[obj.type] || KIND_MAPPING['default'];
        
        const lon = obj.lon;
        const lat = obj.lat;
        const timestamp = new Date(obj.updatedAt);
        const heading = obj.heading;

        const speed = obj.velocity?.speedKmh || null;
        const course = heading || null;

        // Skip "ghosts" or translucent targets (older than 15 minutes)
        if (Date.now() - timestamp.getTime() > 15 * 60 * 1000) {
           continue;
        }

        // First, try to find the exact threat by externalId
        let matchedThreat: any = await prisma.threatObject.findUnique({
           where: { externalId: String(obj.id) },
           include: { locations: { orderBy: { time: 'desc' }, take: 1 } }
        });

        // If not found by externalId, search for ACTIVE threats of the same type
        if (!matchedThreat) {
           const recentThreats = await prisma.threatObject.findMany({
             where: { status: ReportStatus.ACTIVE, type: threatType },
             include: { locations: { orderBy: { time: 'desc' }, take: 1 } }
           });

           let minDistance = Infinity;
           
           for (const t of recentThreats) {
             let dist = Infinity;
             if (t.locations.length > 0) {
               const loc = t.locations[0];
               dist = getDistanceFromLatLonInKm(lat, lon, loc.lat, loc.lng);
             }

             // Increased radius to 150km because Telegram geocoding can be off by region centers
             if (dist < 150 && dist < minDistance) { 
               matchedThreat = t;
               minDistance = dist;
             }
           }

           // If no location match, but there's a threat of the SAME TYPE with NO locations, link it
           if (!matchedThreat) {
              const locationlessThreat = recentThreats.find((t: any) => t.locations.length === 0);
              if (locationlessThreat) {
                  matchedThreat = locationlessThreat;
              }
           }
        }

        if (matchedThreat) {
          // Check if we already have this exact timestamp from NEPTUN to avoid spamming
          const lastNeptunLoc = await prisma.threatLocation.findFirst({
            where: { threatObjectId: matchedThreat.id, sourceId: source!.id },
            orderBy: { time: 'desc' }
          });

          if (!lastNeptunLoc || lastNeptunLoc.time.getTime() < timestamp.getTime()) {
             const updatedThreat = await prisma.threatObject.update({
                where: { id: matchedThreat.id },
                data: {
                  externalId: String(obj.id),
                  speed: speed ?? matchedThreat.speed,
                  course: course ?? matchedThreat.course,
                  confidence: 1.0, // MAPA is high confidence
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
              
              io.emit('threat:update', updatedThreat);
          }
        } else {
           // We create new threats from NEPTUN directly to match external maps
           const newThreat = await prisma.threatObject.create({
             data: {
               type: threatType,
               status: ReportStatus.ACTIVE,
               externalId: String(obj.id),
               speed: speed,
               course: course,
               confidence: 1.0,
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
           
           io.emit('threat:new', newThreat);
        }
      }
    } catch (error: any) {
      console.error("Error fetching NEPTUN API (can be ignored if down):", error.message);
    }
  };

  fetchNeptunData();
  setInterval(fetchNeptunData, 20000); // Poll every 20 seconds
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
