import os
import asyncio
from telethon.sync import TelegramClient
from telethon.sessions import StringSession
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

api_id = os.environ.get('TELEGRAM_API_ID')
api_hash = os.environ.get('TELEGRAM_API_HASH')

if not api_id or not api_hash:
    print("Error: TELEGRAM_API_ID and TELEGRAM_API_HASH must be set in your .env or environment variables.")
    print("Please add them before running this script.")
    exit(1)

api_id = int(api_id)

async def main():
    print("Starting Telegram Login...")
    client = TelegramClient(StringSession(), api_id, api_hash)
    await client.start()
    
    session_string = client.session.save()
    print("\n" + "="*50)
    print("Login successful! Save the following string as your TELEGRAM_SESSION in your .env file:\n")
    print(session_string)
    print("="*50 + "\n")
    
    await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
