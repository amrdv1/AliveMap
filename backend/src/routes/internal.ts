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
            let finalLat = parsed.lat;
            let finalLng = parsed.lng;

            if (!parsed.targetLat && !parsed.targetLng && parsed.targetName) {
                const dropIfQuiet = !['FPV', 'KAB', 'AIRCRAFT', 'RECON', 'MISSILE', 'CRUISE_MISSILE', 'BALLISTIC_MISSILE', 'KINZHAL', 'ZIRCON', 'KALIBR', 'ISKANDER', 'KH101', 'PPO', 'INFO', 'SUMMARY'].includes(parsed.type);
                const geoResult = await geocodeLocation(parsed.targetName, dropIfQuiet, channelName);
                if (geoResult) {
                    parsed.targetLat = geoResult.lat;
                    parsed.targetLng = geoResult.lng;
                }
            }

            const isUtility = ['PPO', 'INFO', 'SUMMARY'].includes(parsed.type);

            if (finalLat == null && parsed.targetLat != null && parsed.targetLng != null) {
                if (isUtility) {
                    finalLat = parsed.targetLat;
                    finalLng = parsed.targetLng;
                } else {
                    const turf = require('@turf/turf');
                    const targetPoint = turf.point([parsed.targetLng, parsed.targetLat]);
                    
                    // Spawn in the opposite direction of the threat's course if known.
                    // If course is unknown, spawn in the East/North-East/South/South-East (from Russia direction)
                    let backtrackAngle = 45 + Math.random() * 135;
                    const knownCourse = finalCourse ?? parsed.direction;
                    if (knownCourse != null) {
                        backtrackAngle = (knownCourse + 180) % 360;
                    }
                    
                    let spawnDistKm = 60;
                    if (['BALLISTIC_MISSILE', 'ISKANDER', 'KINZHAL', 'ZIRCON'].includes(parsed.type)) {
                        spawnDistKm = 120; // Ballistics fly very fast, 120km takes ~1 min
                    } else if (parsed.type.includes('MISSILE') || parsed.type === 'KALIBR' || parsed.type === 'KH101') {
                        spawnDistKm = 250; // Cruise missiles fly longer
                    } else if (parsed.type === 'FPV' || parsed.type === 'MOLNIYA') {
                        spawnDistKm = 8; // FPVs are extremely short range
                    }
                    
                    const spawnPoint = turf.destination(targetPoint, spawnDistKm, backtrackAngle, { units: 'kilometers' });
                    finalLat = spawnPoint.geometry.coordinates[1];
                    finalLng = spawnPoint.geometry.coordinates[0];
                }
            } else if (finalLat == null) {
                finalLat = parsed.targetLat;
                finalLng = parsed.targetLng;
            }
            if (finalLat === null || finalLng === null) {
                if ((parsed.type === 'PPO' || parsed.type === 'INFO') && sourceId) {
                    // Source posted a clear/explosion message but provided no coordinates.
                    // Assume it means "clear all threats I previously reported"
                    const { archiveThreatsBySource } = require('../services/aggregatorService');
                    await archiveThreatsBySource(sourceId, io);
                }
            }

            if (finalLat !== null && finalLng !== null) {
                if (bestMessageLat == null) {
                    bestMessageLat = parsed.targetLat ?? finalLat;
                    bestMessageLng = parsed.targetLng ?? finalLng;
                }

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
                                sendSmartThreatNotification(threat.id, threat.type, finalLat, finalLng, threat.speed, threat.course);
                            }
                        });
                    } else {
                        io.emit('threat:update', savedThreat);
                        if (savedThreat.speed && savedThreat.course != null) {
                            const { sendSmartThreatNotification } = require('../workers/botWorker');
                            sendSmartThreatNotification(savedThreat.id, savedThreat.type, finalLat, finalLng, savedThreat.speed, savedThreat.course);
                        }
                    }
                }
            }
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
