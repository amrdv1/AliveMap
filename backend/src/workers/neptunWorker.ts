import axios from 'axios';
import { Server } from 'socket.io';
import prisma from '../db';
import { ReportType, ReportStatus, SourceType } from '@prisma/client';
import { extractWithAI } from '../services/aiParser';
import { geocodeLocation } from '../services/geocoder';

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
        const quantity = obj.count || 1;

        // Neptun can keep targets "active" (like translucent ghosts) even if they haven't moved in a while.
        // We shouldn't ignore them here, otherwise they get deleted from our map while Neptun still shows them.
        if (Date.now() - timestamp.getTime() > 24 * 60 * 60 * 1000) {
           continue; // Only ignore completely dead targets (>24 hours)
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
             if (t.externalId) continue; // DO NOT steal a threat that is already linked to Neptun!

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
              const locationlessThreat = recentThreats.find((t: any) => t.locations.length === 0 && !t.externalId);
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
                  quantity: quantity,
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
          
          if (speed && course && matchedThreat) {
              const { sendSmartThreatNotification } = require('./botWorker');
              sendSmartThreatNotification(matchedThreat.id, threatType, lat, lon, speed, course);
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
               quantity: quantity,
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
           
           if (speed && course) {
               const { sendSmartThreatNotification } = require('./botWorker');
               sendSmartThreatNotification(newThreat.id, threatType, lat, lon, speed, course);
           }
        }
       }

      // STRICT SYNC: Archive any active targets in our DB that are NO LONGER active in Neptun
      const activeNeptunIds = objects
         .filter((o: any) => o.status === 'active')
         .map((o: any) => String(o.id));

      const staleThreats = await prisma.threatObject.findMany({
          where: {
              status: 'ACTIVE',
              externalId: { not: null, notIn: activeNeptunIds }
          }
      });

      if (staleThreats.length > 0) {
          const staleIds = staleThreats.map((t: any) => t.id);
          await prisma.threatObject.updateMany({
              where: { id: { in: staleIds } },
              data: { status: 'ARCHIVED' }
          });
          
          const { sendSmartAllClear } = require('./botWorker');
          for (const id of staleIds) {
              sendSmartAllClear(id);
          }
          io.emit('threats:refresh');
          console.log(`[Neptun Sync] Auto-archived ${staleIds.length} threats no longer active in Neptun.`);
      }

    } catch (error: any) {
      console.error("Error fetching NEPTUN API (can be ignored if down):", error.message);
    }
  };

  fetchNeptunData();
  setInterval(fetchNeptunData, 20000); // Poll every 20 seconds

  const fetchNeptunMessages = async () => {
    try {
      const { data } = await axios.get('https://neptun.in.ua/api/v1/messages', { timeout: 10000 });
      if (!data || !data.messages) return;

      const newMessages = [];
      // reverse so older ones are processed first
      for (const msg of data.messages.reverse()) {
        const msgTime = new Date(msg.date);
        
        // Skip messages older than 30 minutes
        if (Date.now() - msgTime.getTime() > 30 * 60 * 1000) continue;

        const existing = await prisma.monitoringMessage.findFirst({
           where: { text: msg.text, timestamp: msgTime }
        });

        if (!existing) {
           let type = 'INFO';
           const t = msg.text.toLowerCase();
           if (t.includes('шахед') || t.includes('бпла') || t.includes('дрон') || t.includes('мопед') || t.includes('реактивн')) type = 'DRONE';
           else if (t.includes('каб') || t.includes('авіабомб') || t.includes('фаб')) type = 'KAB';
           else if (t.includes('ракет') || t.includes('балістик') || t.includes('кинджал') || t.includes('іскандер')) type = 'MISSILE';
           else if (t.includes('злет') || t.includes('авіація') || t.includes('міг-') || t.includes('борти') || t.includes('авіа')) type = 'AIRCRAFT';
           else if (t.includes('ppo') || t.includes('ппо') || t.includes('вибух')) type = 'PPO';
           
           let linkedThreatId: string | null = null;
           let linkedLat: number | null = null;
           let linkedLng: number | null = null;

           if (['DRONE', 'KAB', 'MISSILE', 'AIRCRAFT', 'BALLISTIC_MISSILE', 'CRUISE_MISSILE'].includes(type)) {
               try {
                   const aiData = await extractWithAI(msg.text);
                   if (aiData) {
                       let geoLat: number | null = aiData.targetLat;
                       let geoLng: number | null = aiData.targetLng;

                       if (geoLat == null && aiData.locationNames && aiData.locationNames.length > 0) {
                           const coords = await geocodeLocation(aiData.locationNames[0], false, msg.channel);
                           if (coords) {
                               geoLat = coords.lat;
                               geoLng = coords.lng;
                           }
                       }

                       if (geoLat != null && geoLng != null) {
                           const activeThreats = await prisma.threatObject.findMany({
                               where: { status: 'ACTIVE', type: type as ReportType },
                               include: { locations: { orderBy: { time: 'desc' }, take: 1 } }
                           });

                           let minDistance = Infinity;
                           let bestMatch = null;
                           for (const t of activeThreats) {
                               if (t.locations.length > 0) {
                                   const loc = t.locations[0];
                                   const dist = getDistanceFromLatLonInKm(geoLat, geoLng, loc.lat, loc.lng);
                                   if (dist < 150 && dist < minDistance) {
                                       minDistance = dist;
                                       bestMatch = t;
                                   }
                               } else if (t.targetLat != null && t.targetLng != null) {
                                   const dist = getDistanceFromLatLonInKm(geoLat, geoLng, t.targetLat, t.targetLng);
                                   if (dist < 150 && dist < minDistance) {
                                       minDistance = dist;
                                       bestMatch = t;
                                   }
                               }
                           }

                           if (bestMatch) {
                               linkedThreatId = bestMatch.id;
                               if (bestMatch.locations.length > 0) {
                                   linkedLat = bestMatch.locations[0].lat;
                                   linkedLng = bestMatch.locations[0].lng;
                               } else {
                                   linkedLat = bestMatch.targetLat;
                                   linkedLng = bestMatch.targetLng;
                               }
                           }
                       }
                   }
               } catch (e) {
                   console.error("AI linking error:", e);
               }
           }

           const savedMsg = await prisma.monitoringMessage.create({
              data: {
                  text: msg.text,
                  channelName: msg.channel.replace('@', ''),
                  timestamp: msgTime,
                  tags: [type],
                  threatId: linkedThreatId,
                  lat: linkedLat,
                  lng: linkedLng
              }
           });
           newMessages.push(savedMsg);
        }
      }

      if (newMessages.length > 0) {
        for (const msg of newMessages) {
            io.emit('monitoring:new_message', msg);
        }
      }
    } catch (error: any) {
      console.error("Error fetching Neptun messages API:", error.message);
    }
  };

  fetchNeptunMessages();
  setInterval(fetchNeptunMessages, 30000); // Poll every 30 seconds
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
