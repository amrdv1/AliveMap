import os
import asyncio
import logging
import requests
from telethon import TelegramClient, events
from telethon.tl.functions.channels import JoinChannelRequest
from telethon.sessions import StringSession
from parser import parse_telegram_text
from dotenv import load_dotenv
from datetime import datetime

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

api_id = os.environ.get('TELEGRAM_API_ID')
api_hash = os.environ.get('TELEGRAM_API_HASH')
session_string = os.environ.get('TELEGRAM_SESSION')
node_port = os.environ.get('PORT', '3001')

NODE_API_URL = f"http://127.0.0.1:{node_port}/api/internal/telegram-message"

# We no longer hardcode CHANNELS, we read all channels/groups the user is in.
async def main():
    if not api_id or not api_hash or not session_string:
        logger.error("Missing TELEGRAM_API_ID, TELEGRAM_API_HASH, or TELEGRAM_SESSION.")
        return

    # Wait 15 seconds before connecting to avoid AuthKeyDuplicatedError during Railway zero-downtime deployments.
    # Railway sends SIGTERM to the old container and waits 10s before killing it.
    # By waiting 15s here, we ensure the old container has fully disconnected.
    logger.info("Waiting 15 seconds before connecting to Telegram to avoid session conflicts during deployment...")
    await asyncio.sleep(15)

    client = TelegramClient(StringSession(session_string), int(api_id), api_hash)
    await client.connect()
    
    if not await client.is_user_authorized():
        logger.error("Session is invalid or expired. Please run login.py again.")
        return
        
    me = await client.get_me()
    logger.info(f"Logged in as {me.username or me.id}")
    
    RECOMMENDED_CHANNELS = [
        "vanek_nikolaev",
        "nikalert",
        "phantomcha",
        "veselyy_pivden",
        "donetskiy_on",
        "war_monitor",
        "eRadarrua",
        "radarr_ua",
        "kievreal1",
        "tknwwasu",
        "raketa_trevoga",
        "rdaprostir",
        "place_kharkiv",
        "krolevetsnews"
    ]
    
    logger.info("Checking and joining recommended monitoring channels...")
    for ch in RECOMMENDED_CHANNELS:
        try:
            await client(JoinChannelRequest(ch))
            logger.info(f"Successfully joined or already in: @{ch}")
        except Exception as e:
            if "USER_ALREADY_PARTICIPANT" in str(e):
                pass
            else:
                logger.warning(f"Could not join @{ch}: {e}")
                
    await asyncio.sleep(2) # Give Telegram a moment to register new channels
    
    def wait_for_node():
        import time
        logger.info(f"Waiting for Node.js API to start at port {node_port}...")
        for _ in range(30):
            try:
                res = requests.get(f"http://127.0.0.1:{node_port}/api/health")
                if res.status_code == 200:
                    logger.info("Node.js API is ready!")
                    return True
            except:
                pass
            time.sleep(1)
        logger.error("Node.js API did not start in time!")
        return False
        
    if not wait_for_node():
        return
        
    async def poll_history():
        import time
        logger.info("Fetching recent Telegram history (polling top 50 dialogs)...")
        now = time.time()
        
        async for dialog in client.iter_dialogs(limit=150):
            if not dialog.is_channel and not dialog.is_group:
                continue
            channel = dialog.entity
            channel_name = getattr(channel, 'username', getattr(channel, 'title', str(channel.id)))
            try:
                await asyncio.sleep(1.0) # Prevent FloodWait
                messages = await client.get_messages(channel, limit=10)
                for message in reversed(messages):
                    if not message.message or not message.date:
                        continue
                        
                    msg_time = message.date.timestamp()
                    is_fresh = (now - msg_time) < 30 * 60 # Fresh if < 30 min old
                    if not is_fresh:
                        continue
                        
                    text = message.message
                    
                    if message.reply_to_msg_id:
                        try:
                            parent_msg = await client.get_messages(channel, ids=message.reply_to_msg_id)
                            if parent_msg and parent_msg.message:
                                text = parent_msg.message + '\\n---\\n' + text
                        except Exception as e:
                            pass
                            
                    try:
                        threats = parse_telegram_text(text)
                        if not threats:
                            continue
                            
                        payload = {
                            "text": text,
                            "channelName": channel,
                            "timestamp": int(msg_time * 1000),
                            "threats": [t.model_dump() for t in threats]
                        }
                        
                        res = requests.post(NODE_API_URL, json=payload)
                        if res.status_code == 200:
                            logger.info(f"Poll: Forwarded {len(threats)} threats from {channel}")
                        else:
                            logger.error(f"Poll: Failed to forward: {res.status_code} {res.text}")
                    except Exception as e:
                        logger.error(f"Poll Exception: {e}")
                        
            except Exception as e:
                logger.error(f"Failed to fetch history for {channel_name}: {e}")
                
        logger.info("Finished polling history.")
        
    # Start polling in background
    asyncio.create_task(poll_history())
    
    @client.on(events.NewMessage)
    async def handler(event):
        chat = await event.get_chat()
        
        username = getattr(chat, 'username', None)
        title = getattr(chat, 'title', None)
        
        if not event.is_channel and not event.is_group:
            return
            
        text = event.message.message
        if not text:
            return
            
        # Handle replies
        if event.message.reply_to_msg_id:
            try:
                parent_msg = await client.get_messages(event.peer_id, ids=event.message.reply_to_msg_id)
                if parent_msg and parent_msg.message:
                    text = parent_msg.message + '\\n---\\n' + text
            except Exception as e:
                logger.error(f"Failed to fetch reply context: {e}")
                
        try:
            threats = parse_telegram_text(text)
            if not threats:
                return
                
            channel_display = username or title or 'Monitoring'
            
            payload = {
                "text": text,
                "channelName": channel_display,
                "timestamp": int(event.message.date.timestamp() * 1000),
                "threats": [t.model_dump() for t in threats]
            }
            
            try:
                res = requests.post(NODE_API_URL, json=payload)
                if res.status_code == 200:
                    logger.info(f"Forwarded {len(threats)} threats from {channel_display}")
                else:
                    logger.error(f"Failed to forward threats: {res.status_code} {res.text}")
            except Exception as e:
                logger.error(f"Request Error: {e}")
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")

    logger.info("Listening for new messages...")
    await client.run_until_disconnected()

if __name__ == "__main__":
    asyncio.run(main())
