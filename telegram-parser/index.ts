import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { NewMessage, NewMessageEvent } from 'telegram/events';
import axios from 'axios';
import dotenv from 'dotenv';
import { parseTelegramText } from './parser';

dotenv.config();

const CHANNELS = [
  'vanek_nikolaev', 'monitor', 'kievreal1', 'operativnoZSU',
  'insiderUKR', 'ukraine_pyxx', 'kpszsu', 'war_monitor',
  'kyivske_nebo', 'radar_v', 'air_alert_ua', 'truxaukraine',
  'svoyi_ua', 'real_kiev', 'ukraine_now', 'kharkivlife',
  'odesa_typical', 'dnepr_operativ', 'sumy_now', 'trukha_dnipro',
  'trukha_kharkiv', 'trukha_odesa'
];

const PRIVATE_CHANNEL_TITLES = [
  'Труха⚡️Радар'
];

const API_ID = Number(process.env.TELEGRAM_API_ID);
const API_HASH = process.env.TELEGRAM_API_HASH;
const SESSION_STRING = process.env.TELEGRAM_SESSION;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3001/api/webhooks/telegram';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-super-secret-key';

if (!API_ID || !API_HASH || !SESSION_STRING) {
  console.error("Missing Telegram credentials in .env. Exiting.");
  process.exit(1);
}

const stringSession = new StringSession(SESSION_STRING);
const client = new TelegramClient(stringSession, API_ID, API_HASH, {
  connectionRetries: 5,
});

async function start() {
  console.log("Starting Telegram Parser Microservice...");
  try {
    await client.connect();
    console.log("Connected to Telegram successfully.");

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
        const channelName = title || username || 'Unknown';
        
        // 1. Tags Logic
        let tags: string[] = [];
        const lowerText = text.toLowerCase();
        if (lowerText.includes('увага') || lowerText.includes('загроза') || lowerText.includes('небезпека')) {
          tags.push('Загроза');
        } else if (lowerText.includes('тривога')) {
          tags.push('Тривога');
        } else {
          tags.push('Інфо');
        }

        // 2. Parse coordinates if it's a threat
        const parsed = parseTelegramText(text);

        const payload = {
          text,
          channelName,
          timestamp: new Date(message.date * 1000).toISOString(),
          tags,
          parsedThreat: (parsed.lat !== null && parsed.lng !== null) ? parsed : null
        };

        // 3. Send Webhook
        try {
          await axios.post(WEBHOOK_URL, payload, {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': WEBHOOK_SECRET
            }
          });
          console.log(`Sent webhook for message from ${channelName}`);
        } catch (err: any) {
          console.error(`Webhook error: ${err.message}`);
        }
      }
    }, new NewMessage({}));

    console.log(`Listening for messages from ${CHANNELS.length} public channels and ${PRIVATE_CHANNEL_TITLES.length} private channels.`);
    
  } catch (err) {
    console.error("Fatal Error in Telegram Worker:", err);
  }
}

start();
