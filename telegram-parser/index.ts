import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { NewMessage, NewMessageEvent } from 'telegram/events';
import axios from 'axios';
import dotenv from 'dotenv';
import { parseTelegramText } from './parser';

dotenv.config();

const CHANNELS = [
  'smolii_ukraine',
  'kyiv_golovne',
  'vanek_nikolaev',
  'kievreal1',
  'war_monitor',
  'monitor_ukraine',
  'radar_ua_top',
  'radartruhakharkiv',
  'radar_odesa',
  'radar_dnipro',
  'radartruhazaporizhzhya',
  'radar_kyiv',
  'radar_lviv',
  'mykolaiv_radar',
  'poltava_radar',
  'sumy_radar',
  'chernihiv_radar',
  'cherkasy_radar',
  'vinnytsia_radar',
  'zhytomyr_radar',
  'kropyvnytskyi_radar',
  'rivne_radar',
  'volyn_radar',
  'ternopil_radar',
  'khmelnytskyi_radar',
  'chernivtsi_radar',
  'ivanofrankivsk_radar',
  'zakarpattia_radar',
  'suspilne_news',
  'tsnua',
  'ukrpravda_news',
  'uniannet',
  'insiderUKR',
  'novyna_ua',
  'operativnoZSU',
  'kievreal1'
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
const backendPort = process.env.PORT || 3001;
const WEBHOOK_URL = process.env.WEBHOOK_URL || `http://127.0.0.1:${backendPort}/api/webhooks/telegram`;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-super-secret-key';

const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});

async function start() {
  console.log("Starting Telegram Parser Microservice...");
  try {
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
        const channelName = isPublicMatch ? username : title;
        
        // 1. Analyze with regex
        const parsed = parseTelegramText(text);
        
        // 2. Extract tags
        const tags = [];
        if (text.toLowerCase().includes('шахед') || text.toLowerCase().includes('бпла')) tags.push('Shahed');
        if (text.toLowerCase().includes('ракет') || text.toLowerCase().includes('х-')) tags.push('Missile');
        if (text.toLowerCase().includes('вибух')) tags.push('Вибух');
        if (text.toLowerCase().includes('тривог')) tags.push('Тривога');
        if (parsed.lat !== null) tags.push('Локація');

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
