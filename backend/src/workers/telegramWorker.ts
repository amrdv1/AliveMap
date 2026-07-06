import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { NewMessage, NewMessageEvent } from 'telegram/events';
import { parseTelegramText } from '../services/parser';
import prisma from '../db';
import { Server } from 'socket.io';
import { processExternalThreat } from '../services/aggregatorService';
import { extractWithAI } from '../services/aiParser';
import { geocodeLocation } from '../services/geocoder';

const CHANNELS = [
  // OLD CHANNELS
  'vanek_nikolaev', 'monitor', 'kievreal1', 'operativnoZSU', 'insiderUKR', 'smolii_ukraine', 
  'kyiv_golovne', 'war_monitor', 'monitor_ukraine', 'radar_ua_top', 'kyiv_vanek', 'nebo_raketa', 
  'sectorv666', 'deraketaua', 'eradarrrua', 'kherson_non_drone', 'rozvidkaneba', 'kudy_letyt', 
  'nablydatel_dozor', 'krolevetsnews', 'place_kharkiv', 'ukraineradar_24_7', 'kievmap', 
  'truexanewsua', 'kpszsu', 'veselyy_pivden', 'mykolaivska_oda', 'kharkivoda', 'odessa_typical', 
  'realwar_ukraine', 'ukraine_now',
  // NEW CHANNELS
  'pivden_varta', 'radar_top_ua', 'povitryanatrivogaaaa', 'odessa_inform', 'monitor1654', 
  'ukrainealarmsignal', 'eyes_everywhere_ua', 'vibuxaviasia', 'renihub', 'odessaveter', 
  'kharkov_media', 'pivden_fpv', 'tlknewsua', 'temporis_odesa', 'kherson_monitoring', 
  'shahedradar', 'operatyvnohlep', 'poltavaranger', 'raketa_trevoga',
  'suspilne_news',
  'ukraine_online',
  'ukraine_radar',
  'pivden_radar',
  // --- Official / OVA Channels ---
  'kpszsu', // Повітряні Сили ЗСУ
  'kyivoda', // Київська ОВА
  'maksymkozytskyy', // Львівська ОВА
  'volynskaODA', // Волинська ОВА
  'rivne_oda', // Рівненська ОВА
  'zhytomyrskaODA', // Житомирська ОВА
  'ternopilskaODA', // Тернопільська ОВА
  'khmelnytskaODA', // Хмельницька ОВА
  'vinnytskaODA', // Вінницька ОВА
  'chernivetskaODA', // Чернівецька ОВА
  'ifoda', // Івано-Франківська ОВА
  'zakarpatskaODA', // Закарпатська ОВА
  'cherkaskaODA', // Черкаська ОВА
  'kirovohradskaODA', // Кіровоградська ОВА
  'poltavskaODA', // Полтавська ОВА
  'sumy_oda', // Сумська ОВА
  'chernihivskaODA', // Чернігівська ОВА
  'synegubov', // Харківська ОВА
  'dnipropetrovskaODA', // Дніпропетровська ОВА
  'zoda_gov_ua', // Запорізька ОВА
  'mykolaivskaODA', // Миколаївська ОВА
  'odeskaODA', // Одеська ОВА
  'khersonskaODA', // Херсонська ОВА
  'pavlokyrylenko_donoda', // Донецька ОВА
  'luhanskaVTSA', // Луганська ОВА
  'VA_Kyiv', // Київська МВА
  
  // --- Monitoring Channels (Requested) ---
  'sectorv666',
  'korabeli', // КОРАБЕЛІ
  'monitor',
  'monitorwar',
  'monitor_ua',
  'monitor_map',
  'war_monitor',
  'monitoring_ukraine'
];

const PRIVATE_TITLES = [
  'НЕПТУН',
  'Труха ⚡️ Радар'
];

// Types that represent actual target movement (shown in monitoring)
const MOVEMENT_TYPES = new Set([
  'DRONE', 'MISSILE', 'CRUISE_MISSILE', 'BALLISTIC_MISSILE', 
  'AIRCRAFT', 'KAB', 'ZIRCON', 'KH101', 'ISKANDER', 
  'KINZHAL', 'KALIBR', 'FPV', 'RECON', 'UNKNOWN'
]);

// Types to exclude from monitoring feed (but still process for map)
const EXCLUDED_FROM_MONITORING = new Set([
  'SUMMARY', 'INFO', 'ALERT', 'PPO'
]);

export async function startTelegramWorker(io: Server) {
  const apiId = Number(process.env.TELEGRAM_API_ID);
  const apiHash = process.env.TELEGRAM_API_HASH;
  const sessionString = process.env.TELEGRAM_SESSION;

  if (!apiId || !apiHash || !sessionString) {
    console.error("Telegram credentials missing. Telegram worker disabled.");
    return;
  }

  const stringSession = new StringSession(sessionString);
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  let connected = false;
  let retries = 0;
  while (!connected && retries < 15) {
    try {
      await client.connect();
      connected = true;
    } catch (error: any) {
      console.error(`Error connecting Telegram worker (Attempt ${retries + 1}/15):`, error.message);
      retries++;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  if (!connected) {
    console.error("Failed to start Telegram worker after 15 attempts. Exiting worker.");
    return;
  }

  try {
    console.log("Connected to Telegram using string session.");

    const me = await client.getMe();
    console.log(`Logged in as: ${me.username || me.id}`);

    let source = await prisma.source.findFirst({ where: { name: 'Telegram Worker' } });
    if (!source) {
      source = await prisma.source.create({
        data: {
          name: 'Telegram Worker',
          type: 'API'
        }
      });
    }

    const sourceId = source.id;

    // ─── REALTIME HANDLER ────────────────────────────────────────────────
    client.addEventHandler(async (event: NewMessageEvent) => {
      const message = event.message;
      if (!message || !message.message) return;

      const chat = await message.getChat();
      if (!chat) return;
      
      const username = 'username' in chat && chat.username ? chat.username.toLowerCase() : null;
      const title = 'title' in chat && chat.title ? chat.title : null;
      
      const isPublicMatch = username && CHANNELS.some(c => c.toLowerCase() === username);
      const isPrivateMatch = title && PRIVATE_TITLES.some(t => title.includes(t));
      
      if (isPublicMatch || isPrivateMatch) {
        const text = message.message;
        const parsedThreats = parseTelegramText(text);
        if (!parsedThreats || parsedThreats.length === 0) return;
        
        const channelDisplay = username || title || 'Monitoring';
        const threatType = parsedThreats[0].type;

        // Only save to monitoring feed if it's actual target movement
        if (MOVEMENT_TYPES.has(threatType)) {
          const tags = [threatType];
          try {
            const savedMsg = await prisma.monitoringMessage.create({
              data: {
                text,
                channelName: channelDisplay,
                timestamp: new Date(message.date * 1000),
                tags
              }
            });
            io.emit('monitoring:new_message', savedMsg);
          } catch (e) {
            console.error("Failed to save monitoring message", e);
          }
        }

        // Run AI extraction ONCE per message
        const aiData = await extractWithAI(text);
        const finalSpeed = aiData?.speed || null;
        const finalCourse = aiData?.course || null;
        const finalTarget = aiData?.predictedTarget || null;

        let overrideParsedThreats: any[] = [];
        
        // If AI found specific locations, geocode them!
        if (aiData?.locationNames && aiData.locationNames.length > 0) {
           for (const locName of aiData.locationNames) {
              const coords = await geocodeLocation(locName);
              if (coords) {
                 overrideParsedThreats.push({
                    type: parsedThreats[0].type,
                    lat: coords.lat,
                    lng: coords.lng,
                    confidence: 95,
                    direction: finalCourse ?? parsedThreats[0].direction,
                    quantity: parsedThreats[0].quantity,
                    targetName: finalTarget ?? parsedThreats[0].targetName,
                    targetLat: null,
                    targetLng: null
                 });
              }
           }
        }
        
        const threatsToProcess = overrideParsedThreats.length > 0 ? overrideParsedThreats : parsedThreats;

        // Add all matched targets to map (including PPO)
        for (const parsed of threatsToProcess) {
          if (parsed.lat !== null && parsed.lng !== null) {
              const confidence = (parsed.confidence || 80) / 100;
              const courseToUse = finalCourse ?? parsed.direction;
              const targetToUse = finalTarget ?? parsed.targetName;
              
              console.log(`[Parser] Detected ${parsed.type} at [${parsed.lat?.toFixed(2)}, ${parsed.lng?.toFixed(2)}] conf=${confidence} from ${channelDisplay} AI_Speed=${finalSpeed} AI_Course=${courseToUse}`);
              
              const savedThreat = await processExternalThreat(
                  null,
                  parsed.type as any,
                  parsed.lat,
                  parsed.lng,
                  new Date(),
                  sourceId,
                  finalSpeed,
                  courseToUse,
                  confidence,
                  parsed.quantity ?? 1,
                  targetToUse,
                  parsed.targetLat ?? null,
                  parsed.targetLng ?? null
              );
              
            if (savedThreat) {
                io.emit('threat:update', savedThreat);
                
                // Smart Notification
                if (finalSpeed && courseToUse) {
                    const { sendSmartThreatNotification } = require('./botWorker');
                    sendSmartThreatNotification(parsed.type, parsed.lat, parsed.lng, finalSpeed, courseToUse);
                }
            }
          }
        }
      }
    }, new NewMessage({}));

    // ─── POLLING HISTORY ─────────────────────────────────────────────────
    const pollHistory = async () => {
        try {
            console.log("Fetching recent Telegram history (polling 50 channels)...");
            
            // Fetch directly from top 3 channels to avoid ResolveUsername FloodWait
            // Live events will still capture messages from all 50+ channels.
            const pollChannels = [
                'monitor_ukraine', 'eRadarrua', 'war_monitor', 'monitoring_ukraine', 
                'sectorv666', 'monitor', 'radar_top_ua', 'povitryanatrivogaaaa', 
                'monitor1654', 'ukrainealarmsignal', 'pivden_varta'
            ];
            for (const channel of pollChannels) {
                try {
                    const messages = await client.getMessages(channel, { limit: 10 });
                    
                    for (const message of messages.reverse()) {
                        if (!message || !message.message) continue;
                        const msgTime = message.date * 1000;
                        
                        const parsedThreats = parseTelegramText(message.message);
                        if (!parsedThreats || parsedThreats.length === 0) continue;
                        
                        const channelDisplay = channel;
                        const threatType = parsedThreats[0].type;

                        // Only save to monitoring if it's actual target movement and fresh (<12h)
                        const isFreshMonitoring = (Date.now() - msgTime) < 12 * 60 * 60 * 1000;

                        if (isFreshMonitoring && MOVEMENT_TYPES.has(threatType)) {
                            const tags = [threatType];
                            try {
                                const existing = await prisma.monitoringMessage.findFirst({
                                    where: { 
                                        text: message.message,
                                        timestamp: new Date(message.date * 1000)
                                    }
                                });

                                if (!existing) {
                                    const savedMsg = await prisma.monitoringMessage.create({
                                        data: {
                                            text: message.message,
                                            channelName: channelDisplay,
                                            timestamp: new Date(message.date * 1000),
                                            tags
                                        }
                                    });
                                    io.emit('monitoring:new_message', savedMsg);
                                }
                            } catch (e) {
                                console.error('Failed to save monitoring message:', e);
                            }
                        }

                        // Spawn threats on the map if the message is recent (<2 hours)
                        const isFresh = (Date.now() - msgTime) < 2 * 60 * 60 * 1000;
                        
                        if (isFresh) {
                            for (const parsed of parsedThreats) {
                                if (parsed.lat !== null && parsed.lng !== null) {
                                    const savedThreat = await processExternalThreat(
                                        null, parsed.type as any, parsed.lat, parsed.lng,
                                        new Date(msgTime),
                                        sourceId, null, parsed.direction, parsed.confidence / 100,
                                        parsed.quantity, parsed.targetName ?? null, parsed.targetLat ?? null, parsed.targetLng ?? null
                                    );
                                    if (savedThreat) io.emit('threat:update', savedThreat);
                                }
                            }
                        }
                    }
                } catch (err: any) {
                    console.error(`[PollHistory] Error on ${channel}:`, err.message || err);
                }
            }
            console.log("History fetch complete.");
        } catch (e) {
            console.error("History fetch error:", e);
        }
    };

    // ─── CLEANUP: Delete old messages every minute ────────────────────────
    const cleanupOldMessages = async () => {
        try {
            // Delete messages older than 6 hours
            const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
            const deleted = await prisma.monitoringMessage.deleteMany({
                where: { timestamp: { lt: sixHoursAgo } }
            });
            if (deleted.count > 0) {
                console.log(`[Cleanup] Deleted ${deleted.count} old monitoring messages.`);
            }

            // Also cap total messages to latest 500
            const totalCount = await prisma.monitoringMessage.count();
            if (totalCount > 500) {
                const toDelete = totalCount - 500;
                const oldest = await prisma.monitoringMessage.findMany({
                    orderBy: { timestamp: 'asc' },
                    take: toDelete,
                    select: { id: true }
                });
                await prisma.monitoringMessage.deleteMany({
                    where: { id: { in: oldest.map((m: { id: string }) => m.id) } }
                });
                console.log(`[Cleanup] Capped messages, deleted ${toDelete} excess.`);
            }

            // Delete monitoring messages with non-movement types (cleanup legacy)
            await prisma.monitoringMessage.deleteMany({
                where: {
                    OR: [
                        { tags: { has: 'SUMMARY' } },
                        { tags: { has: 'INFO' } },
                        { tags: { has: 'ALERT' } },
                        { tags: { has: 'PPO' } },
                        { channelName: { in: ['air_alert_ua', 'ukraine_alarm_bot', 'Офіційні Тривоги'] } }
                    ]
                }
            });
        } catch (e) {
            console.error("[Cleanup] Error:", e);
        }
    };

    // Archive only threats older than 2 hours (keep recent ones alive across restarts)
    try {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const archived = await prisma.threatObject.updateMany({
            where: { status: 'ACTIVE', updatedAt: { lt: twoHoursAgo } },
            data: { status: 'ARCHIVED' }
        });
        console.log(`[Startup] Archived ${archived.count} old threats (>2h).`);
    } catch(e) {}

    // Run initial cleanup
    await cleanupOldMessages();

    // Poll history once on startup to catch up on missed messages
    await pollHistory();

    // Run cleanup and polling every minute as a reliable fallback
    setInterval(async () => {
        await cleanupOldMessages();
        await pollHistory();
    }, 60 * 1000);

  } catch (error) {
    console.error("Error starting Telegram worker:", error);
  }
}
