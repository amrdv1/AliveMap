import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { NewMessage, NewMessageEvent } from 'telegram/events';
import { parseTelegramText } from '../services/parser';
import { processNewThreatLocation } from '../services/trackingService';
import { PrismaClient, ReportType } from '@prisma/client';
import { Server } from 'socket.io';

const prisma = new PrismaClient();

const CHANNELS = [
  'vanek_nikolaev', 
  'monitor', 
  'kievreal1', 
  'operativnoZSU',
  'insiderUKR',
  'ukraine_pyxx',
  'kpszsu',
  'war_monitor',
  'kyivske_nebo'
];

const PRIVATE_CHANNEL_TITLES = [
  'Труха⚡️Радар'
];

export async function startTelegramWorker(io: Server) {
  const apiId = Number(process.env.TELEGRAM_API_ID);
  const apiHash = process.env.TELEGRAM_API_HASH;
  const sessionString = process.env.TELEGRAM_SESSION;

  if (!apiId || !apiHash || !sessionString) {
    console.log("Telegram credentials missing in .env. Telegram worker is disabled.");
    return;
  }

  const stringSession = new StringSession(sessionString);
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  try {
    await client.connect();
    console.log("Telegram Userbot connected successfully. Listening to monitoring channels...");

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
      const isPrivateMatch = title && PRIVATE_CHANNEL_TITLES.includes(title);

      if (isPublicMatch || isPrivateMatch) {
        const text = message.message;
        const parsed = parseTelegramText(text);

        if (parsed.lat !== null && parsed.lng !== null) {
          const threat = await processNewThreatLocation(
            parsed.type as ReportType,
            parsed.lat,
            parsed.lng,
            new Date(message.date * 1000),
            sourceId
          );

          console.log(`Telegram Threat Tracked: ${parsed.type} at [${parsed.lat}, ${parsed.lng}] from ${username || title}`);
        }
      }
    }, new NewMessage({}));

    // Fetch history asynchronously
    fetchHistory(client, sourceId, io);

  } catch (err) {
    console.error("Failed to start Telegram Worker:", err);
  }
}

async function fetchHistory(client: TelegramClient, sourceId: string, io: Server) {
  try {
    console.log("Cleaning up old Telegram reports...");
    await prisma.report.deleteMany({ where: { sourceId } });

    console.log("Fetching history for tracked channels...");
    const dialogs = await client.getDialogs();
    
    for (const dialog of dialogs) {
      // For some dialogs, entity might be undefined
      if (!dialog.entity) continue;
      
      const username = ('username' in dialog.entity && dialog.entity.username) 
        ? dialog.entity.username.toLowerCase() 
        : null;
      const title = dialog.title;
      
      const isPublicMatch = username && CHANNELS.some(c => c.toLowerCase() === username);
      const isPrivateMatch = title && PRIVATE_CHANNEL_TITLES.includes(title);
      
      if (isPublicMatch || isPrivateMatch) {
        console.log(`Fetching history for ${title || username}...`);
        const messages = await client.getMessages(dialog.entity, { limit: 20 });
        
        // Reverse to process oldest first
        for (const message of messages.reverse()) {
          if (!message || !message.message) continue;
          
          const text = message.message;
          const parsed = parseTelegramText(text);
          
          if (parsed.lat !== null && parsed.lng !== null) {
            await processNewThreatLocation(
              parsed.type as ReportType,
              parsed.lat,
              parsed.lng,
              new Date(message.date * 1000),
              sourceId
            );
          }
        }
      }
    }
    console.log("History fetch complete.");
  } catch (err) {
    console.error("Error fetching history:", err);
  }
}
