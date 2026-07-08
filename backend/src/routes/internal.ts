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
        const { text, channelName, timestamp, threats } = req.body;
        if (!threats || threats.length === 0) {
            return res.json({ success: true, message: "No threats" });
        }

        const io = req.app.get('io');
        const msgTime = new Date(timestamp);
        const threatType = threats[0].type;

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
                            lat: threats[0].lat ?? null,
                            lng: threats[0].lng ?? null
                        }
                    });
                    io.emit('monitoring:new_message', savedMsg);
                }
            } catch (e) {
                console.error("Failed to save monitoring message", e);
            }
        }

        let aiData = null;
        if (threatType !== 'INFO' && threatType !== 'SUMMARY' && threats.length === 1) {
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
               for (const locName of aiData.locationNames) {
                  const coords = await geocodeLocation(locName, dropIfQuiet);
                  if (coords) {
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
            if (overrideParsedThreats.length > 0) {
                threatsToProcess = overrideParsedThreats;
            }
        }

        let source = await prisma.source.findFirst({ where: { name: 'Telegram Worker' } });
        if (!source) {
            source = await prisma.source.create({ data: { name: 'Telegram Worker', type: 'API' }});
        }
        const sourceId = source.id;

        for (const parsed of threatsToProcess) {
            let finalLat = parsed.lat ?? parsed.targetLat;
            let finalLng = parsed.lng ?? parsed.targetLng;

            if (!parsed.targetLat && !parsed.targetLng && parsed.targetName) {
                const dropIfQuiet = !['FPV', 'KAB', 'AIRCRAFT', 'RECON', 'MISSILE', 'CRUISE_MISSILE', 'BALLISTIC_MISSILE', 'KINZHAL', 'ZIRCON', 'KALIBR', 'ISKANDER', 'KH101', 'PPO', 'INFO', 'SUMMARY'].includes(parsed.type);
                const geoResult = await geocodeLocation(parsed.targetName, dropIfQuiet);
                if (geoResult) {
                    parsed.targetLat = geoResult.lat;
                    parsed.targetLng = geoResult.lng;
                    if (finalLat == null && finalLng == null) {
                        finalLat = geoResult.lat;
                        finalLng = geoResult.lng;
                    }
                }
            }

            if (finalLat !== null && finalLng !== null) {
                if (parsed.type === 'INFO' || parsed.type === 'SUMMARY') {
                    const { archiveThreatsNear } = require('../services/aggregatorService');
                    const radius = parsed.confidence === 50 ? 2000 : 150;
                    await archiveThreatsNear(finalLat, finalLng, radius, io);
                    continue;
                }
                
                if (parsed.type === 'PPO') {
                    io.emit('explosion:new', { id: Math.random().toString(36).substring(7), lat: finalLat, lng: finalLng, timestamp: Date.now() });
                    const { archiveThreatsNear } = require('../services/aggregatorService');
                    await archiveThreatsNear(finalLat, finalLng, 30, io);
                    continue;
                }

                const confidence = (parsed.confidence || 80) / 100;
                const courseToUse = finalCourse ?? parsed.direction;
                const targetToUse = finalTarget ?? parsed.targetName;
                
                const savedThreat = await processExternalThreat(
                    null,
                    parsed.type as any,
                    finalLat as number,
                    finalLng as number,
                    msgTime,
                    sourceId,
                    finalSpeed,
                    courseToUse,
                    confidence,
                    parsed.quantity || 1,
                    targetToUse,
                    parsed.targetLat || null,
                    parsed.targetLng || null
                );
                
                if (savedThreat) {
                    if (Array.isArray(savedThreat)) {
                        savedThreat.forEach(threat => {
                            io.emit('threat:new', threat);
                            if (threat.speed && threat.course != null) {
                                const { sendSmartThreatNotification } = require('../workers/botWorker');
                                sendSmartThreatNotification(threat.type, finalLat, finalLng, threat.speed, threat.course);
                            }
                        });
                    } else {
                        io.emit('threat:update', savedThreat);
                        if (savedThreat.speed && savedThreat.course != null) {
                            const { sendSmartThreatNotification } = require('../workers/botWorker');
                            sendSmartThreatNotification(savedThreat.type, finalLat, finalLng, savedThreat.speed, savedThreat.course);
                        }
                    }
                }
            }
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
