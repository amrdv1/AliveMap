import express from 'express';
import prisma from '../db';
import { extractWithAI } from '../services/aiParser';
import { geocodeLocation } from '../services/geocoder';
import { processExternalThreat } from '../services/aggregatorService';

const router = express.Router();

const MOVEMENT_TYPES = new Set([
  'DRONE', 'MISSILE', 'CRUISE_MISSILE', 'BALLISTIC_MISSILE', 
  'AIRCRAFT', 'KAB', 'ZIRCON', 'KH101', 'ISKANDER', 
  'KINZHAL', 'KALIBR', 'FPV', 'RECON', 'UNKNOWN'
]);

router.post('/telegram-message', async (req, res) => {
    try {
        // DEPRECATED: We now use Neptun API directly for both threats and feed messages.
        // This endpoint is disabled to prevent duplicate hallucinated targets.
        return res.json({ success: true, message: "Endpoint disabled, using Neptun API." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

        const io = req.app.get('io');
        const msgTime = new Date(timestamp);
        const threatType = threats[0].type;

        // Message saving moved to the end so we can use geocoded coordinates

        let aiData = null;
        if (threatType !== 'INFO' && threatType !== 'SUMMARY') {
            aiData = await extractWithAI(text);
        }
        
        const finalSpeed = aiData?.speed || null;
        const finalCourse = aiData?.course || null;
        const finalTarget = aiData?.predictedTarget || null;

        let threatsToProcess = threats;
        const hasGeocodedLocs = threats.some((p: any) => p.lat || p.targetLat);

        if (!hasGeocodedLocs && aiData) {
            let overrideParsedThreats: any[] = [];
            if (aiData.targetLat && aiData.targetLng) {
               overrideParsedThreats.push({
                   ...threats[0],
                   confidence: 95,
                   targetLat: aiData.targetLat,
                   targetLng: aiData.targetLng
               });
            } else if (aiData.locationNames && aiData.locationNames.length > 0) {
               const dropIfQuiet = !['FPV', 'KAB', 'AIRCRAFT', 'RECON', 'MISSILE', 'CRUISE_MISSILE', 'BALLISTIC_MISSILE', 'KINZHAL', 'ZIRCON', 'KALIBR', 'ISKANDER', 'KH101', 'PPO', 'INFO', 'SUMMARY'].includes(threatType);
               
               const allSameType = threats.every((t: any) => t.type === threatType);
               
               if (allSameType) {
                   for (const locName of aiData.locationNames) {
                      const coords = await geocodeLocation(locName, dropIfQuiet, channelName);
                      if (coords) {
                         if (coords.isLaunchSite) {
                             const turf = require('@turf/turf');
                             let dir = threats[0].direction;
                             if (dir == null) {
                                 dir = Math.round(turf.bearing(turf.point([coords.lng, coords.lat]), turf.point([31.16, 48.37])));
                                 if (dir < 0) dir += 360;
                             }
                             overrideParsedThreats.push({
                                ...threats[0],
                                confidence: 95,
                                targetName: locName,
                                lat: coords.lat,
                                lng: coords.lng,
                                direction: dir
                             });
                         } else {
                             overrideParsedThreats.push({
                                ...threats[0],
                                confidence: 95,
                                targetName: locName,
                                targetLat: coords.lat,
                                targetLng: coords.lng
                             });
                         }
                      }
                   }
               }
            }
            if (overrideParsedThreats.length > 0) {
                threatsToProcess = overrideParsedThreats;
            }
        }

        let source = await prisma.source.findFirst({ where: { name: 'Telegram Worker' } });
        if (!source) {
            source = await prisma.source.create({ data: { name: 'Telegram Worker', type: 'API' }});
        }
        const sourceId = source.id;

        let bestMessageLat: number | null = null;
        let bestMessageLng: number | null = null;

        for (const parsed of threatsToProcess) {
            // DEPRECATED: We now use Neptun API directly for threats.
            // Threat creation from local Telegram parser is disabled to prevent duplicate/hallucinated targets.
        }
        
        const shouldSaveToFeed = MOVEMENT_TYPES.has(threatType) || ['INFO', 'SUMMARY', 'PPO'].includes(threatType);
        if (shouldSaveToFeed) {
            try {
                const existing = await prisma.monitoringMessage.findFirst({
                    where: { text, timestamp: msgTime }
                });
                if (!existing) {
                    const savedMsg = await prisma.monitoringMessage.create({
                        data: {
                            text,
                            channelName: channelName,
                            timestamp: msgTime,
                            tags: [threatType],
                            lat: bestMessageLat,
                            lng: bestMessageLng
                        }
                    });
                    io.emit('monitoring:new_message', savedMsg);
                }
            } catch (e) {
                console.error("Failed to save monitoring message", e);
            }
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
