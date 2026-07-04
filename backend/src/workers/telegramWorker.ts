import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { NewMessage, NewMessageEvent } from 'telegram/events';
import { parseTelegramText } from '../services/parser';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';

const prisma = new PrismaClient();

const CHANNELS = [
  'vanek_nikolaev', 
  'monitor', 
  'kievreal1', 
  'operativnoZSU',
  'insiderUKR'
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
          type: 'API',
          reliability: 90,
          isActive: true
        }
      });
    }
    const sourceId = source.id;

    client.addEventHandler(async (event: NewMessageEvent) => {
      const message = event.message;
      if (!message || !message.message) return;

      const chat = await message.getChat();
      if (!chat || !('username' in chat) || !chat.username) return;
      
      const username = chat.username.toLowerCase();
      
      if (CHANNELS.some(c => c.toLowerCase() === username)) {
        const text = message.message;
        const parsed = parseTelegramText(text);

        if (parsed.lat !== null && parsed.lng !== null) {
          const report = await prisma.report.create({
            data: {
              type: parsed.type,
              lat: parsed.lat,
              lng: parsed.lng,
              confidence: parsed.confidence,
              sourceId: sourceId
            },
            include: { source: true }
          });

          io.emit('report:new', report);
          console.log(`Telegram Threat Detected: ${parsed.type} at [${parsed.lat}, ${parsed.lng}] from ${username}`);
        }
      }
    }, new NewMessage({}));

  } catch (err) {
    console.error("Failed to start Telegram Worker:", err);
  }
}
