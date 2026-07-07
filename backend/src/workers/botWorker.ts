import TelegramBot from 'node-telegram-bot-api';
import prisma from '../db';
import { projectTrajectory, willIntersectLocation, TrajectoryProjection } from '../services/trajectoryEngine';

let bot: TelegramBot | null = null;

const REGIONS = [
  "м. Київ", "Вінницька область", "Волинська область", "Дніпропетровська область", 
  "Донецька область", "Житомирська область", "Закарпатська область", "Запорізька область", 
  "Івано-Франківська область", "Київська область", "Кіровоградська область", "Луганська область", 
  "Львівська область", "Миколаївська область", "Одеська область", "Полтавська область", 
  "Рівненська область", "Сумська область", "Тернопільська область", "Харківська область", 
  "Херсонська область", "Хмельницька область", "Черкаська область", "Чернівецька область", 
  "Чернігівська область", "Автономна Республіка Крим", "м. Севастополь"
];

export async function startBotWorker() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN is not set. Notification bot will not start.");
    return;
  }

  bot = new TelegramBot(token, { polling: true });

  console.log("Personal Telegram Notification Bot started...");

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Create a keyboard chunked by 2
    const keyboard = [];
    for (let i = 0; i < REGIONS.length; i += 2) {
      const row = [];
      row.push({ text: REGIONS[i], callback_data: `region:${REGIONS[i]}` });
      if (i + 1 < REGIONS.length) {
        row.push({ text: REGIONS[i + 1], callback_data: `region:${REGIONS[i + 1]}` });
      }
      keyboard.push(row);
    }

    bot!.sendMessage(chatId, "Привіт! Оберіть свій регіон для отримання загальних сповіщень. \n\nАБО надішліть боту свою геолокацію (скріпкою 📎 -> Розташування) для активації **Розумних Сповіщень** (бот попередить, якщо загроза летить саме до вас).", {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });
  });

  // Handle location messages
  bot.on('location', async (msg) => {
    const chatId = msg.chat.id.toString();
    const lat = msg.location?.latitude;
    const lng = msg.location?.longitude;
    
    if (lat && lng) {
        try {
            await prisma.telegramSubscriber.upsert({
                where: { chatId_region: { chatId, region: "SMART" } },
                update: { lat, lng, smartPush: true },
                create: { chatId, region: "SMART", lat, lng, smartPush: true }
            });
            bot!.sendMessage(chatId, `✅ **Розумні сповіщення активовано!**\nВаші координати збережено. Бот повідомить вас, якщо ракета чи дрон рухатиметься у вашому напрямку (радіус 20 км).`, { parse_mode: 'Markdown' });
        } catch (e) {
            bot!.sendMessage(chatId, `❌ Помилка збереження локації.`);
        }
    }
  });

  bot.on('callback_query', async (query) => {
    if (!query.message) return;
    const chatId = query.message.chat.id.toString();
    const data = query.data;

    if (data && data.startsWith('region:')) {
      const region = data.split(':')[1];

      try {
        // Upsert subscription
        const existing = await prisma.telegramSubscriber.findUnique({
          where: {
            chatId_region: {
              chatId,
              region
            }
          }
        });

        if (!existing) {
          await prisma.telegramSubscriber.create({
            data: {
              chatId,
              region
            }
          });
        }

        bot!.answerCallbackQuery(query.id, { text: `Ви підписалися на ${region}` });
        bot!.sendMessage(chatId, `✅ Ви успішно підписалися на сповіщення для: **${region}**.\n\nТепер ви будете отримувати повідомлення про початок та відбій тривог у цьому регіоні.`, { parse_mode: "Markdown" });
      } catch (e) {
        console.error("Failed to subscribe user", e);
        bot!.answerCallbackQuery(query.id, { text: "Помилка при підписці." });
      }
    }
  });
}

/**
 * Sends a notification to all users subscribed to the given region.
 * @param region Name of the region (e.g. "Київська область")
 * @param isAlert True if alert started, False if alert cleared
 */
export async function sendAlertNotification(region: string, isAlert: boolean) {
  if (!bot) return;

  try {
    const subscribers = await prisma.telegramSubscriber.findMany({
      where: { region }
    });

    if (subscribers.length === 0) return;
    
    // Deduplicate by chatId to prevent spam if db has duplicates
    const uniqueSubscribers = [];
    const seen = new Set();
    for (const sub of subscribers) {
        if (!seen.has(sub.chatId)) {
            seen.add(sub.chatId);
            uniqueSubscribers.push(sub);
        }
    }

    const message = isAlert 
      ? `🔴 **Повітряна тривога!**\n\nРегіон: ${region}\nПрямуйте в укриття!`
      : `🟢 **Відбій тривоги!**\n\nРегіон: ${region}`;

    for (const sub of uniqueSubscribers) {
      try {
        await bot.sendMessage(sub.chatId, message, { parse_mode: "Markdown" });
      } catch (err: any) {
        console.error(`Failed to send message to ${sub.chatId}: ${err.message}`);
        // If user blocked the bot, we could delete the subscription here
        if (err.response && err.response.statusCode === 403) {
          await prisma.telegramSubscriber.delete({
            where: { id: sub.id }
          }).catch(() => {});
        }
      }
    }
  } catch (error) {
    console.error("Error in sendAlertNotification:", error);
  }
}

/**
 * Sends a smart notification if a threat is heading towards a subscribed user.
 */
export async function sendSmartThreatNotification(
    threatType: string,
    lat: number,
    lng: number,
    speedKmh: number,
    courseDegrees: number
) {
    if (!bot) return;
    
    try {
        const smartSubs = await prisma.telegramSubscriber.findMany({
            where: { smartPush: true, lat: { not: null }, lng: { not: null } }
        });
        
        if (smartSubs.length === 0) return;

        // Deduplicate to prevent spam
        const uniqueSmartSubs = [];
        const seenSmart = new Set();
        for (const sub of smartSubs) {
            if (!seenSmart.has(sub.chatId)) {
                seenSmart.add(sub.chatId);
                uniqueSmartSubs.push(sub);
            }
        }
        
        const projection = projectTrajectory(lat, lng, speedKmh, courseDegrees, 30); // Project 30 mins
        
        for (const sub of uniqueSmartSubs) {
            if (willIntersectLocation(projection, sub.lat!, sub.lng!, 20)) {
                // Threat passes within 20km!
                const message = `⚠️ **УВАГА! РОЗУМНЕ СПОВІЩЕННЯ** ⚠️\n\nОб'єкт **${threatType}** рухається у вашому напрямку! \nРозрахунковий вектор проходить близько до вашої локації. Прямуйте в укриття!`;
                try {
                    await bot.sendMessage(sub.chatId, message, { parse_mode: "Markdown" });
                } catch (e) {
                    // Ignore send errors
                }
            }
        }
    } catch (e) {
        console.error("Error in sendSmartThreatNotification:", e);
    }
}

