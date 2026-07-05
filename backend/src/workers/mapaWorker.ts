import axios from 'axios';
import { Server } from 'socket.io';
import prisma from '../db';
import { ReportType, ReportStatus, SourceType } from '@prisma/client';
import { processExternalThreat } from '../services/aggregatorService';

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

  console.log("MAPA.UA Worker started...");

  const fetchMapaData = async () => {
    try {
      const { data } = await axios.get(MAPA_API_URL, { timeout: 10000 });
      if (!data || !data.objects) return;

      const objects = data.objects;
      const updatedThreats = [];

      for (const obj of objects) {
        if (obj.status !== 'active') continue;

        const threatType = KIND_MAPPING[obj.kind] || KIND_MAPPING['default'];
        
        const trail = obj.trail || [];
        // Map trail to our location format
        const trailLocations = trail.map((t: any) => ({
          lat: t[1],
          lng: t[0],
          time: new Date(t[2] * 1000),
          sourceId: source!.id
        }));

        // If trail is empty, fallback to current coordinates
        if (trailLocations.length === 0) {
          trailLocations.push({
            lat: obj.lat,
            lng: obj.lon,
            time: new Date(),
            sourceId: source!.id
          });
        }
        
        // Get the latest location to use for distance matching
        const latestLoc = trailLocations[trailLocations.length - 1];

        const threatData = {
          type: threatType,
          confidence: 1.0, 
          status: ReportStatus.ACTIVE,
          speed: obj.speed_kmh || null,
          course: latestLoc.heading || obj.heading || null,
        };

        const savedThreat = await processExternalThreat(
          obj.id, // externalId
          threatType,
          latestLoc.lat,
          latestLoc.lng,
          latestLoc.time,
          source!.id,
          threatData.speed,
          threatData.course,
          1.0,
          trailLocations
        );

        updatedThreats.push(savedThreat);
      }

      // Mark older threats as ARCHIVED if they weren't matched
      const activeThreats = await prisma.threatObject.findMany({ where: { status: ReportStatus.ACTIVE } });
      const updatedIds = updatedThreats.map(t => t.id);
      
      for (const t of activeThreats) {
        if (!updatedIds.includes(t.id)) {
          // If a threat hasn't been updated in 15 mins, archive it
          if (new Date().getTime() - new Date(t.updatedAt).getTime() > 15 * 60 * 1000) {
            await prisma.threatObject.update({
              where: { id: t.id },
              data: { status: ReportStatus.ARCHIVED }
            });
          }
        }
      }

      // Broadcast all active threats to connected clients
      const allActive = await prisma.threatObject.findMany({
        where: { status: ReportStatus.ACTIVE },
        include: { locations: { orderBy: { time: 'desc' }, include: { source: true } } }
      });

      for (const threat of allActive) {
        io.emit('threat:update', threat);
      }

    } catch (error: any) {
      console.error("Error fetching MAPA.UA API:", error.message);
    }
  };

  fetchMapaData();
  setInterval(fetchMapaData, 15000); // Poll every 15 seconds
}
