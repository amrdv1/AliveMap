import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { Api } from 'telegram/tl';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const apiId = parseInt(process.env.TELEGRAM_API_ID || '0');
const apiHash = process.env.TELEGRAM_API_HASH || '';
const sessionStr = process.env.TELEGRAM_SESSION || '';

const CHANNELS_TO_JOIN = [
  'pivden_varta',
  'radar_top_ua',
  'povitryanatrivogaaaa',
  'odessa_inform',
  'monitor1654',
  'ukrainealarmsignal',
  'eyes_everywhere_ua',
  'vibuxaviasia',
  'renihub',
  'odessaveter',
  'kharkov_media',
  'pivden_fpv',
  'nablydatel_dozor',
  'tlknewsua',
  'temporis_odesa',
  'kherson_monitoring',
  'shahedradar',
  'operatyvnohlep',
  'veselyy_pivden',
  'poltavaranger',
  'raketa_trevoga'
];

async function run() {
  console.log("Loading session...");
  const stringSession = new StringSession(sessionStr);
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.connect();
  console.log("Connected to Telegram!");

  for (const channel of CHANNELS_TO_JOIN) {
    try {
      console.log(`Joining @${channel}...`);
      await client.invoke(
        new Api.channels.JoinChannel({
          channel: channel
        })
      );
      console.log(`✅ Successfully joined @${channel}`);
      // Wait a bit to avoid flood waits
      await new Promise(r => setTimeout(r, 2000));
    } catch (e: any) {
      if (e.message && e.message.includes('USER_ALREADY_PARTICIPANT')) {
         console.log(`ℹ️ Already a member of @${channel}`);
      } else {
         console.error(`❌ Failed to join @${channel}: ${e.message}`);
      }
    }
  }

  console.log("All done!");
  await client.disconnect();
  process.exit(0);
}

run();
