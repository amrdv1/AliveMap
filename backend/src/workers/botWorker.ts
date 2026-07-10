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

  const getRegionsKeyboard = async (chatId: string) => {
    const subs = await prisma.telegramSubscriber.findMany({ where: { chatId } });
    const subscribedRegions = new Set(subs.map(s => s.region));
    const { DISTRICTS } = require('./districts');
    
    const keyboard = [];
    for (let i = 0; i < REGIONS.length; i += 2) {
      const row = [];
      const r1 = REGIONS[i];
      const r1Districts = DISTRICTS[r1] || [];
      const isR1Subbed = subscribedRegions.has(r1) || r1Districts.some((d: string) => subscribedRegions.has(d));
      
      row.push({ text: `${isR1Subbed ? '✅ ' : ''}${r1}`, callback_data: `o_${i}` });
      if (i + 1 < REGIONS.length) {
        const r2 = REGIONS[i + 1];
        const r2Districts = DISTRICTS[r2] || [];
        const isR2Subbed = subscribedRegions.has(r2) || r2Districts.some((d: string) => subscribedRegions.has(d));
        row.push({ text: `${isR2Subbed ? '✅ ' : ''}${r2}`, callback_data: `o_${i + 1}` });
      }
      keyboard.push(row);
    }
    return keyboard;
  };

  const getRegionSubMenu = async (chatId: string, regionIndex: number) => {
    const regionName = REGIONS[regionIndex];
    const { DISTRICTS } = require('./districts');
    const districts = DISTRICTS[regionName] || [];
    
    const subs = await prisma.telegramSubscriber.findMany({ where: { chatId } });
    const subscribedRegions = new Set(subs.map(s => s.region));
    
    const keyboard = [];
    
    // Toggle whole region
    keyboard.push([{ text: `${subscribedRegions.has(regionName) ? '✅ ' : ''}Вся область`, callback_data: `tr_${regionIndex}` }]);
    
    // Toggle districts
    for (let i = 0; i < districts.length; i += 2) {
      const row = [];
      const d1 = districts[i];
      row.push({ text: `${subscribedRegions.has(d1) ? '✅ ' : ''}${d1}`, callback_data: `td_${regionIndex}_${i}` });
      
      if (i + 1 < districts.length) {
         const d2 = districts[i + 1];
         row.push({ text: `${subscribedRegions.has(d2) ? '✅ ' : ''}${d2}`, callback_data: `td_${regionIndex}_${i + 1}` });
      }
      keyboard.push(row);
    }
    
    // Back button
    keyboard.push([{ text: "🔙 Назад до списку областей", callback_data: `b_` }]);
    
    return keyboard;
  };

  async function toggleSubscription(chatId: string, region: string) {
    const existing = await prisma.telegramSubscriber.findUnique({
      where: { chatId_region: { chatId, region } }
    });
    if (existing) {
      await prisma.telegramSubscriber.delete({ where: { id: existing.id } });
      return false;
    } else {
      await prisma.telegramSubscriber.create({ data: { chatId, region } });
      return true;
    }
  }

  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id.toString();
    const keyboard = await getRegionsKeyboard(chatId);

    bot!.sendMessage(chatId, "👋 **Привіт! Я — твій персональний радар-помічник.**\n\nОбери регіони нижче для отримання сповіщень про повітряні тривоги.\n\n📍 **Розумні сповіщення:**\nНадішли мені свою геолокацію (скріпка 📎 -> Розташування), і я попереджатиму тебе **ТІЛЬКИ ТОДІ**, коли ракета чи шахед летить у твоєму напрямку (радіус до 20 км)!", {
      parse_mode: 'Markdown',
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
            bot!.sendMessage(chatId, `🎯 **РОЗУМНІ СПОВІЩЕННЯ АКТИВОВАНО!** 🎯\n\n📍 Ваші координати успішно збережено.\n\n🛡️ Тепер ви під надійним захистом: мій штучний інтелект відстежує вектори всіх загроз на карті. Якщо ракета або шахед летітиме прямо у вашу сторону (радіус до 20 км) — ви отримаєте термінове сповіщення!\n\n_Ви також можете обрати регіон для загальних тривог через команду /start._`, { parse_mode: 'Markdown' });
        } catch (e) {
            bot!.sendMessage(chatId, `❌ **Помилка:** Не вдалося зберегти локацію. Спробуйте ще раз.`);
        }
    }
  });

  bot.on('callback_query', async (query) => {
    if (!query.message) return;
    const chatId = query.message.chat.id.toString();
    const data = query.data;
    if (!data) return;

    try {
        if (data === 'b_') {
            const newKeyboard = await getRegionsKeyboard(chatId);
            bot!.editMessageReplyMarkup({ inline_keyboard: newKeyboard }, {
                chat_id: chatId,
                message_id: query.message.message_id
            }).catch(()=>{});
        } else if (data.startsWith('o_')) {
            const rIndex = parseInt(data.split('_')[1]);
            const subMenu = await getRegionSubMenu(chatId, rIndex);
            bot!.editMessageReplyMarkup({ inline_keyboard: subMenu }, {
                chat_id: chatId,
                message_id: query.message.message_id
            }).catch(()=>{});
        } else if (data.startsWith('tr_')) {
            const rIndex = parseInt(data.split('_')[1]);
            const region = REGIONS[rIndex];
            const isSubbed = await toggleSubscription(chatId, region);
            bot!.answerCallbackQuery(query.id, { text: isSubbed ? `✅ Підписано на: ${region}` : `❌ Відписано від: ${region}` });
            const subMenu = await getRegionSubMenu(chatId, rIndex);
            bot!.editMessageReplyMarkup({ inline_keyboard: subMenu }, {
                chat_id: chatId,
                message_id: query.message.message_id
            }).catch(()=>{});
        } else if (data.startsWith('td_')) {
            const parts = data.split('_');
            const rIndex = parseInt(parts[1]);
            const dIndex = parseInt(parts[2]);
            const regionName = REGIONS[rIndex];
            const { DISTRICTS } = require('./districts');
            const district = DISTRICTS[regionName][dIndex];
            
            const isSubbed = await toggleSubscription(chatId, district);
            bot!.answerCallbackQuery(query.id, { text: isSubbed ? `✅ Підписано на: ${district}` : `❌ Відписано від: ${district}` });
            const subMenu = await getRegionSubMenu(chatId, rIndex);
            bot!.editMessageReplyMarkup({ inline_keyboard: subMenu }, {
                chat_id: chatId,
                message_id: query.message.message_id
            }).catch(()=>{});
        } else if (data.startsWith('region:')) {
            const region = data.split(':')[1];
            const isSubbed = await toggleSubscription(chatId, region);
            bot!.answerCallbackQuery(query.id, { text: isSubbed ? `✅ Підписано на: ${region}` : `❌ Відписано від: ${region}` });
        }
    } catch (e) {
        console.error("Callback error", e);
        bot!.answerCallbackQuery(query.id, { text: "Помилка." });
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
      ? `🚨 **УВАГА! ПОВІТРЯНА ТРИВОГА!** 🚨\n\n📍 **Регіон:** ${region}\n\n⚠️ Негайно прямуйте в укриття! Бережіть себе!`
      : `🟢 **ВІДБІЙ ТРИВОГИ!** 🟢\n\n📍 **Регіон:** ${region}\n\n🕊️ Можна повертатися до звичних справ.`;

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

const activeSmartAlerts = new Map<string, Set<string>>(); // threatId -> chatIds (as string)

/**
 * Sends a smart notification if a threat is heading towards a subscribed user.
 */
export async function sendSmartThreatNotification(
    threatId: string,
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
        const seenSmart = new Set<string>();
        for (const sub of smartSubs) {
            const chatIdStr = sub.chatId.toString();
            if (!seenSmart.has(chatIdStr)) {
                seenSmart.add(chatIdStr);
                uniqueSmartSubs.push({ ...sub, chatIdStr });
            }
        }
        
        const projection = projectTrajectory(lat, lng, speedKmh, courseDegrees, 30); // Project 30 mins
        
        let threatAlerts = activeSmartAlerts.get(threatId);
        if (!threatAlerts) {
            threatAlerts = new Set();
            activeSmartAlerts.set(threatId, threatAlerts);
        }
        
        for (const sub of uniqueSmartSubs) {
            if (!threatAlerts.has(sub.chatIdStr) && willIntersectLocation(projection, sub.lat!, sub.lng!, 20)) {
                // Threat passes within 20km!
                const typeMap: any = {
                    'DRONE': '🛸 ШАХЕД / БПЛА',
                    'FPV': '🚁 FPV ДРОН',
                    'MISSILE': '🚀 РАКЕТА',
                    'CRUISE_MISSILE': '🚀 КРИЛАТА РАКЕТА',
                    'BALLISTIC_MISSILE': '☄️ БАЛІСТИКА',
                    'KAB': '💣 КАБ',
                    'AIRCRAFT': '✈️ ВОРОЖА АВІАЦІЯ',
                    'RECON': '👁️ РОЗВІДНИК'
                };
                const displayType = typeMap[threatType] || `⚠️ ${threatType}`;
                
                const message = `🚨 **ПРЯМА ЗАГРОЗА**\n${displayType} рухається у вашому напрямку! Прямуйте в укриття.`;
                try {
                    await bot.sendMessage(sub.chatIdStr, message, { parse_mode: "Markdown" });
                    threatAlerts.add(sub.chatIdStr);
                } catch (e) {
                    // Ignore send errors
                }
            }
        }
    } catch (e) {
        console.error("Error in sendSmartThreatNotification:", e);
    }
}

/**
 * Sends an All Clear (Відбій) notification to users who received a smart alert for a specific threat.
 */
export async function sendSmartAllClear(threatId: string) {
    if (!bot) return;
    try {
        const chatIds = activeSmartAlerts.get(threatId);
        if (!chatIds || chatIds.size === 0) return;
        
        for (const chatIdStr of chatIds) {
            try {
                const message = `✅ **ВІДБІЙ ЗАГРОЗИ**\nПовітряна ціль, що рухалась у вашому напрямку, перестала фіксуватись (можливо збита або змінила курс).`;
                await bot.sendMessage(chatIdStr, message, { parse_mode: "Markdown" });
            } catch (e) {
                // Ignore send errors
            }
        }
        
        activeSmartAlerts.delete(threatId);
    } catch (e) {
        console.error("Error in sendSmartAllClear:", e);
    }
}
