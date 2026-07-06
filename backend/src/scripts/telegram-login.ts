import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';
// @ts-ignore
import input from 'input';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const stringSession = new StringSession("");

if (!apiId || !apiHash) {
    console.error("Please set TELEGRAM_API_ID and TELEGRAM_API_HASH in your .env file.");
    process.exit(1);
}

(async () => {
    console.log("Loading interactive telegram login...");
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });
    
    await client.start({
        phoneNumber: async () => await input.text("Please enter your phone number: "),
        password: async () => await input.text("Please enter your password (if any): "),
        phoneCode: async () => await input.text("Please enter the code you received: "),
        onError: (err) => console.log(err),
    });
    
    console.log("You should now be connected.");
    console.log("Save this string in your TELEGRAM_SESSION environment variable:");
    console.log("");
    console.log(client.session.save());
    console.log("");
    
    const joinAns = await input.text("Do you want to automatically join all required monitoring channels? (y/N): ");
    if (joinAns.toLowerCase() === 'y' || joinAns.toLowerCase() === 'yes') {
        const CHANNELS = [
          'vanek_nikolaev', 'monitor', 'kievreal1', 'operativnoZSU',
          'insiderUKR', 'smolii_ukraine', 'kyiv_golovne', 'war_monitor',
          'monitor_ukraine', 'radar_ua_top', 'kyiv_vanek', 'nebo_raketa',
          'sectorv666', 'deraketaua', 'eradarrrua', 'kherson_non_drone',
          'rozvidkaneba', 'kudy_letyt', 'nablydatel_dozor', 'krolevetsnews',
          'place_kharkiv', 'ukraineradar_24_7', 'kievmap', 'truexanewsua',
          'kpszsu', 'veselyy_pivden', 'mykolaivska_oda', 'kharkivoda',
          'odessa_typical', 'realwar_ukraine', 'ukraine_now', 'suspilne_news',
          'ukraine_online', 'ukraine_radar', 'pivden_radar',
          'kyivoda', 'maksymkozytskyy', 'volynskaODA'
        ];
        
        console.log("Starting auto-subscribe with safe delays (to avoid spam blocks)...");
        for (let i = 0; i < CHANNELS.length; i++) {
            const ch = CHANNELS[i];
            try {
                const entity = await client.getInputEntity(ch);
                await client.invoke(new Api.channels.JoinChannel({ channel: entity as any }));
                console.log(`[${i+1}/${CHANNELS.length}] Successfully joined: @${ch}`);
            } catch (e: any) {
                console.log(`[${i+1}/${CHANNELS.length}] Failed to join @${ch}: ${e.message}`);
            }
            // Wait 5-10 seconds between joins to avoid rate limits
            if (i < CHANNELS.length - 1) {
                const delay = Math.floor(Math.random() * 5000) + 5000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        console.log("Auto-subscribe complete!");
    }
    
    process.exit(0);
})();
