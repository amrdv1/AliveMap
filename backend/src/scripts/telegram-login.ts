import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
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
    process.exit(0);
})();
