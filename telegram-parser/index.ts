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

const apiId = parseInt(process.env.TELEGRAM_API_ID || '0');
const apiHash = process.env.TELEGRAM_API_HASH || '';
const sessionStr = process.env.TELEGRAM_SESSION || '';

if (!apiId || !apiHash || !sessionStr) {
  console.error("==================================================");
  console.error("FATAL: Telegram credentials (TELEGRAM_API_ID, TELEGRAM_API_HASH, TELEGRAM_SESSION) are missing!");
  console.error("The parser cannot start. Please add them to your Railway Variables.");
  console.error("==================================================");
  process.exit(1);
}

const stringSession = new StringSession(sessionStr);
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3001/api/webhooks/telegram';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-super-secret-key';

const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});

async function start() {
  console.log("Starting Telegram Parser Microservice...");
  
  await client.start({
    phoneNumber: async () => {
      console.error("FATAL: Session invalid or expired. Cannot prompt for phone number on Railway!");
      process.exit(1);
      return '';
    },
    password: async () => '',
    phoneCode: async () => '',
    onError: (err) => {
      console.log(err);
      process.exit(1);
    },
  });
  console.log("Connected to Telegram successfully.");

    if (!sessionStr) {
      console.log('SAVE THIS SESSION STRING TO YOUR .env AS TELEGRAM_SESSION:');
      console.log(client.session.save());
      console.log('------------------------------------------------------------');
    }

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
