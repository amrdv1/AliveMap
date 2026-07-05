"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegram_1 = require("telegram");
const sessions_1 = require("telegram/sessions");
const events_1 = require("telegram/events");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const parser_1 = require("./parser");
dotenv_1.default.config();
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
const stringSession = new sessions_1.StringSession(SESSION_STRING);
const client = new telegram_1.TelegramClient(stringSession, API_ID, API_HASH, {
    connectionRetries: 5,
});
async function start() {
    console.log("Starting Telegram Parser Microservice...");
    try {
        await client.connect();
        console.log("Connected to Telegram successfully.");
        client.addEventHandler(async (event) => {
            const message = event.message;
            if (!message || !message.message)
                return;
            const chat = await message.getChat();
            if (!chat)
                return;
            const username = 'username' in chat && chat.username ? chat.username.toLowerCase() : null;
            const title = 'title' in chat && chat.title ? chat.title : null;
            const isPublicMatch = username && CHANNELS.some(c => c.toLowerCase() === username);
            const isPrivateMatch = title && PRIVATE_CHANNEL_TITLES.includes(title);
            if (isPublicMatch || isPrivateMatch) {
                const text = message.message;
                const channelName = title || username || 'Unknown';
                // 1. Tags Logic
                let tags = [];
                const lowerText = text.toLowerCase();
                if (lowerText.includes('увага') || lowerText.includes('загроза') || lowerText.includes('небезпека')) {
                    tags.push('Загроза');
                }
                else if (lowerText.includes('тривога')) {
                    tags.push('Тривога');
                }
                else {
                    tags.push('Інфо');
                }
                // 2. Parse coordinates if it's a threat
                const parsed = (0, parser_1.parseTelegramText)(text);
                const payload = {
                    text,
                    channelName,
                    timestamp: new Date(message.date * 1000).toISOString(),
                    tags,
                    parsedThreat: (parsed.lat !== null && parsed.lng !== null) ? parsed : null
                };
                // 3. Send Webhook
                try {
                    await axios_1.default.post(WEBHOOK_URL, payload, {
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': WEBHOOK_SECRET
                        }
                    });
                    console.log(`Sent webhook for message from ${channelName}`);
                }
                catch (err) {
                    console.error(`Webhook error: ${err.message}`);
                }
            }
        }, new events_1.NewMessage({}));
        console.log(`Listening for messages from ${CHANNELS.length} public channels and ${PRIVATE_CHANNEL_TITLES.length} private channels.`);
    }
    catch (err) {
        console.error("Fatal Error in Telegram Worker:", err);
    }
}
start();
//# sourceMappingURL=index.js.map