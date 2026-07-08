import os
import asyncio
import logging
import requests
from telethon import TelegramClient, events
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

CHANNELS = [
  'vanek_nikolaev', 'monitor', 'kievreal1', 'operativnoZSU', 'insiderUKR', 'smolii_ukraine', 
  'kyiv_golovne', 'war_monitor', 'monitor_ukraine', 'kyiv_vanek', 'nebo_raketa', 
  'sectorv666', 'deraketaua', 'kherson_non_drone', 'rozvidkaneba', 'kudy_letyt', 
  'nablydatel_dozor', 'krolevetsnews', 'place_kharkiv', 'ukraineradar_24_7', 'kievmap', 
  'truexanewsua', 'kpszsu', 'veselyy_pivden', 'kharkivoda', 'odessa_typical', 
  'realwar_ukraine', 'ukraine_now',
  'pivden_varta', 'radar_top_ua', 'odessa_inform', 'monitor1654', 
  'ukrainealarmsignal', 'eyes_everywhere_ua', 'vibuxaviasia', 'renihub', 'odessaveter', 
  'kharkov_media', 'pivden_fpv', 'tlknewsua', 'temporis_odesa', 'kherson_monitoring', 
  'shahedradar', 'operatyvnohlep', 'poltavaranger', 'raketa_trevoga',
  'roman_romanchuk', 'kyivoda', 'suspilne_news', 'ukraine_radar',
  'київський купол', 'ринда моніторить', 'повітряний простір', 'єрадар',
  'volynskaODA', 'zhytomyrskaODA', 'ternopilskaODA', 'khmelnytskaODA',
  'vinnytskaODA', 'chernivetskaODA', 'ifoda', 'zakarpatskaODA',
  'cherkaskaODA', 'kirovohradskaODA', 'poltavskaODA', 'sumy_oda',
  'synegubov', 'dnipropetrovskaODA', 'zoda_gov_ua', 'mykolaivskaODA',
  'odeskaODA', 'khersonskaODA', 'pavlokyrylenko_donoda', 'luhanskaVTSA', 'VA_Kyiv',
  'korabeli', 'monitorwar', 'monitoring_ukraine',
  'air_alert_ua', 'zahyst_ua', 'radar_dnepr', 'kharkiv_1654',
  'zsu_insider', 'air_alarm_ua', 'ua_drones', 'mykolaiv_online',
  'poltava_monitoring', 'cherkasy_today', 'sumy_today',
  'uaradar', 'raketna_zagroza'
]

async def main():
    if not api_id or not api_hash or not session_string:
        logger.error("Missing TELEGRAM_API_ID, TELEGRAM_API_HASH, or TELEGRAM_SESSION.")
        return

    client = TelegramClient(StringSession(session_string), int(api_id), api_hash)
    await client.connect()
    
    if not await client.is_user_authorized():
        logger.error("Session is invalid or expired. Please run login.py again.")
        return
        
    me = await client.get_me()
    logger.info(f"Logged in as {me.username or me.id}")
    
    async def poll_history():
        import time
        logger.info("Fetching recent Telegram history (polling top channels)...")
        now = time.time()
        
        for channel in CHANNELS:
            try:
                await asyncio.sleep(1.5) # Prevent FloodWait
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
                logger.error(f"Failed to fetch history for {channel}: {e}")
                
        logger.info("Finished polling history.")
        
    # Start polling in background
    asyncio.create_task(poll_history())
    
    @client.on(events.NewMessage)
    async def handler(event):
        chat = await event.get_chat()
        
        username = getattr(chat, 'username', None)
        title = getattr(chat, 'title', None)
        
        username_lower = username.lower() if username else None
        title_lower = title.lower() if title else None
        
        channels_lower = [c.lower() for c in CHANNELS]
        is_monitored = False
        
        if username_lower and username_lower in channels_lower:
            is_monitored = True
        elif title_lower and any(c in title_lower for c in channels_lower):
            is_monitored = True
            
        if not is_monitored:
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
            
            res = requests.post(NODE_API_URL, json=payload)
            if res.status_code == 200:
                logger.info(f"Forwarded {len(threats)} threats from {channel_display}")
            else:
                logger.error(f"Failed to forward threats: {res.status_code} {res.text}")
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")

    logger.info("Listening for new messages...")
    await client.run_until_disconnected()

if __name__ == "__main__":
    asyncio.run(main())
