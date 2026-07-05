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
  'deraketaua'
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

        // Forward raw message to frontend chat panel
        io.emit('monitoring:new_message', { 
            text, channelName: channelDisplay, timestamp: new Date(), tags: [parsedThreats[0].type] 
        });

        // Add all matched targets to map
        for (const parsed of parsedThreats) {
          if (parsed.lat !== null && parsed.lng !== null) {
              let confidence = parsed.confidence || 0.8;
              const savedThreat = await processExternalThreat(
                  null,
                  parsed.type as any,
                  parsed.lat,
                  parsed.lng,
                  new Date(),
                  sourceId,
                  null,
                  parsed.direction,
                  confidence
              );
            if (savedThreat) {
                io.emit('threat:update', savedThreat);
                console.log(`Telegram Threat Detected: ${parsed.type} at [${parsed.lat}, ${parsed.lng}] from ${channelDisplay}`);
            }
          }
        }
      }
    }, new NewMessage({}));

    // Fetch initial history
    try {
        console.log("Fetching recent Telegram history...");
        await prisma.threatObject.deleteMany({
            where: {
                locations: {
                    some: { sourceId }
                }
            }
        });
        const dialogs = await client.getDialogs();
        
        for (const dialog of dialogs) {
            if (!dialog.entity) continue;
            const username = 'username' in dialog.entity && dialog.entity.username ? dialog.entity.username.toLowerCase() : null;
            const title = 'title' in dialog.entity && dialog.entity.title ? dialog.entity.title : null;
            
            const isPublicMatch = username && CHANNELS.some(c => c.toLowerCase() === username);
            const isPrivateMatch = title && PRIVATE_TITLES.some(t => title.includes(t));
            
            if (isPublicMatch || isPrivateMatch) {
                const messages = await client.getMessages(dialog.entity, { limit: 10 });
                for (const message of messages.reverse()) {
                    if (!message || !message.message) continue;
                    const parsedThreats = parseTelegramText(message.message);
                    if (!parsedThreats || parsedThreats.length === 0) continue;
                    
                    for (const parsed of parsedThreats) {
                        if (parsed.lat !== null && parsed.lng !== null) {
                            const savedThreat = await processExternalThreat(
                                null, parsed.type as any, parsed.lat, parsed.lng,
                                new Date((message.date || Math.floor(Date.now()/1000)) * 1000),
                                sourceId, null, parsed.direction, parsed.confidence / 100
                            );
                            if (savedThreat) io.emit('threat:update', savedThreat);
                        }
                    }
                }
            }
        }
        console.log("History fetch complete.");
    } catch (e) {
        console.error("History fetch error:", e);
    }

  } catch (error) {
    console.error("Error starting Telegram worker:", error);
  }
}
