import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { NewMessage, NewMessageEvent } from 'telegram/events';
import { parseTelegramText } from '../services/parser';
import prisma from '../db';
import { Server } from 'socket.io';
import { processExternalThreat } from '../services/aggregatorService';

const CHANNELS = [
  'vanek_nikolaev', 
  'monitor', 
  'kievreal1', 
  'operativnoZSU',
  'insiderUKR',
  'smolii_ukraine',
  'kyiv_golovne',
  'war_monitor',
  'monitor_ukraine',
  'radar_ua_top',
  'kyiv_vanek',
  'nebo_raketa',
  'sectorv666',
  'deraketaua',
  'eradarrrua',
  'kherson_non_drone',
  'rozvidkaneba',
  'kudy_letyt',
  'nablydatel_dozor',
  'krolevetsnews',
  'place_kharkiv',
  'ukraineradar_24_7',
  'kievmap',
  'truexanewsua',
  'kpszsu',
  'veselyy_pivden',
  'mykolaivska_oda',
  'kharkivoda',
  'odessa_typical',
  'realwar_ukraine',
  'ukraine_now',
  'suspilne_news',
  'ukraine_online',
  'ukraine_radar',
  'pivden_radar'
];

const PRIVATE_TITLES = [
  'НЕПТУН',
  'Труха ⚡️ Радар'
];

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

  try {
    await client.connect();
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
        if (!parsedThreats || parsedThreats.length === 0) return; // Ignore generic alerts
        
        const channelDisplay = username || title || 'Monitoring';
        const tags = [parsedThreats[0].type];

        try {
            const savedMsg = await prisma.monitoringMessage.create({
                data: {
                    text,
                    channelName: channelDisplay,
                    timestamp: new Date(message.date * 1000),
                    tags
                }
            });
            // Forward saved message to frontend chat panel
            io.emit('monitoring:new_message', savedMsg);
        } catch (e) {
            console.error("Failed to save monitoring message", e);
        }

        // Add all matched targets to map
        for (const parsed of parsedThreats) {
          if (parsed.lat !== null && parsed.lng !== null) {
              const confidence = (parsed.confidence || 80) / 100;
              console.log(`[Parser] Detected ${parsed.type} qty=${parsed.quantity || 1} at [${parsed.lat?.toFixed(2)}, ${parsed.lng?.toFixed(2)}] conf=${confidence} from ${channelDisplay}`);
              const savedThreat = await processExternalThreat(
                  null,
                  parsed.type as any,
                  parsed.lat,
                  parsed.lng,
                  new Date(),
                  sourceId,
                  null,
                  parsed.direction,
                  confidence,
                  parsed.quantity ?? 1,
                  parsed.targetName ?? null,
                  parsed.targetLat ?? null,
                  parsed.targetLng ?? null
              );
            if (savedThreat) {
                io.emit('threat:update', savedThreat);
            }
          }
        }
      }
    }, new NewMessage({}));

    const pollHistory = async () => {
        try {
            console.log("Fetching recent Telegram history (polling)...");
            
            const dialogs = await client.getDialogs();
            
            for (const dialog of dialogs) {
                if (!dialog.entity) continue;
                const username = 'username' in dialog.entity && dialog.entity.username ? dialog.entity.username.toLowerCase() : null;
                const title = 'title' in dialog.entity && dialog.entity.title ? dialog.entity.title : null;
                
                const isPublicMatch = username && CHANNELS.some(c => c.toLowerCase() === username);
                const isPrivateMatch = title && PRIVATE_TITLES.some(t => title.includes(t));
                
                if (isPublicMatch || isPrivateMatch) {
                    const messages = await client.getMessages(dialog.entity, { limit: 15 }); // 15 is enough for 1 min polling
                    for (const message of messages.reverse()) {
                        if (!message || !message.message) continue;
                        const msgTime = message.date * 1000;
                        
                        const parsedThreats = parseTelegramText(message.message);
                        if (!parsedThreats || parsedThreats.length === 0) continue;
                        
                        const channelDisplay = username || title || 'Monitoring';
                        const tags = [parsedThreats[0].type];

                        // Check if message is fresh enough for monitoring panel (< 12 hours old)
                        const isFreshMonitoring = (Date.now() - msgTime) < 12 * 60 * 60 * 1000;

                        if (isFreshMonitoring) {
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

                        // Spawn threats on the map ONLY if the message is very fresh (< 30 minutes)
                        const isFresh = (Date.now() - msgTime) < 30 * 60 * 1000;
                        
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
                }
            }
            console.log("History fetch complete.");
        } catch (e) {
            console.error("History fetch error:", e);
        }
    };

    // Initial clean slate
    try {
        const archived = await prisma.threatObject.updateMany({
            where: { status: 'ACTIVE' },
            data: { status: 'ARCHIVED' }
        });
        console.log(`[Startup] Archived ${archived.count} old threats. Clean slate.`);
    } catch(e) {}

    await pollHistory();
    setInterval(pollHistory, 60 * 1000); // Poll every minute

  } catch (error) {
    console.error("Error starting Telegram worker:", error);
  }
}
