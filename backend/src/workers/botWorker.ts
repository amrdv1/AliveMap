import TelegramBot from 'node-telegram-bot-api';
import prisma from '../db';
import { projectTrajectory, willIntersectLocation, TrajectoryProjection } from '../services/trajectoryEngine';
import { isRegionActive } from './alertsWorker';

let bot: TelegramBot | null = null;

const REGIONS = [
  "м. Київ", "Вінницька область", "Волинська область", "Дніпропетровська область",
  "Донецька область", "Житомирська область", "Закарпатська область", "Запорізька область",
  "Івано-Франківська область", "Київська область", "Кіровоградська область",
  "Львівська область", "Миколаївська область", "Одеська область", "Полтавська область",
  "Рівненська область", "Сумська область", "Тернопільська область", "Харківська область",
  "Херсонська область", "Хмельницька область", "Черкаська область", "Чернівецька область",
  "Чернігівська область"
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

    bot!.sendMessage(chatId, "👋 **Привіт!**\n\nОбери регіони нижче для отримання сповіщень про повітряні тривоги.\n\n📍 **Розумні сповіщення:**\nНадішли мені свою геолокацію, і я попереджатиму тебе **ТІЛЬКИ ТОДІ**, коли ракета чи шахед летить у твоєму напрямку в радіусі до 20 км", {
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
        bot!.sendMessage(chatId, `🎯 **РОЗУМНІ СПОВІЩЕННЯ АКТИВОВАНО!**\n\n📍 Ваші координати успішно збережено.\n\nМи відстежуємо вектори всіх загроз на карті. Якщо ракета або шахед летітиме прямо у вашу сторону в радіус до 20 км — ви отримаєте термінове сповіщення!\n\n_Ви також можете обрати регіон для загальних тривог через команду /start._`, { parse_mode: 'Markdown' });
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
        }).catch(() => { });
      } else if (data.startsWith('o_')) {
        const rIndex = parseInt(data.split('_')[1]);
        const subMenu = await getRegionSubMenu(chatId, rIndex);
        bot!.editMessageReplyMarkup({ inline_keyboard: subMenu }, {
          chat_id: chatId,
          message_id: query.message.message_id
        }).catch(() => { });
      } else if (data.startsWith('tr_')) {
        const rIndex = parseInt(data.split('_')[1]);
        const region = REGIONS[rIndex];
        const isSubbed = await toggleSubscription(chatId, region);

        let text = isSubbed ? `✅ Підписано на: ${region}` : `❌ Відписано від: ${region}`;
        bot!.answerCallbackQuery(query.id, { text: `✅ Статус змінено` });

        if (isSubbed) {
          text += isRegionActive(region)
            ? `\n\n⚠️ Увага! У цьому регіоні/районі зараз оголошено повітряну тривогу!`
            : `\n\n🟢 Наразі в цьому регіоні/районі спокійно.`;
          bot!.sendMessage(chatId, text);
        }

        const subMenu = await getRegionSubMenu(chatId, rIndex);
        bot!.editMessageReplyMarkup({ inline_keyboard: subMenu }, {
          chat_id: chatId,
          message_id: query.message.message_id
        }).catch(() => { });
      } else if (data.startsWith('td_')) {
        const parts = data.split('_');
        const rIndex = parseInt(parts[1]);
        const dIndex = parseInt(parts[2]);
        const regionName = REGIONS[rIndex];
        const { DISTRICTS } = require('./districts');
        const district = DISTRICTS[regionName][dIndex];

        const isSubbed = await toggleSubscription(chatId, district);
        let text = isSubbed ? `✅ Підписано на: ${district}` : `❌ Відписано від: ${district}`;
        bot!.answerCallbackQuery(query.id, { text: `✅ Статус змінено` });

        if (isSubbed) {
          text += isRegionActive(district)
            ? `\n\n⚠️ Увага! У цьому регіоні/районі зараз оголошено повітряну тривогу!`
            : `\n\n🟢 Наразі в цьому регіоні/районі спокійно.`;
          bot!.sendMessage(chatId, text);
        }

        const subMenu = await getRegionSubMenu(chatId, rIndex);
        bot!.editMessageReplyMarkup({ inline_keyboard: subMenu }, {
          chat_id: chatId,
          message_id: query.message.message_id
        }).catch(() => { });
      } else if (data.startsWith('region:')) {
        const region = data.split(':')[1];
        const isSubbed = await toggleSubscription(chatId, region);
        let text = isSubbed ? `✅ Підписано на: ${region}` : `❌ Відписано від: ${region}`;
        bot!.answerCallbackQuery(query.id, { text: `✅ Статус змінено` });

        if (isSubbed) {
          text += isRegionActive(region)
            ? `\n\n⚠️ Увага! У цьому регіоні/районі зараз оголошено повітряну тривогу!`
            : `\n\n🟢 Наразі в цьому регіоні/районі спокійно.`;
          bot!.sendMessage(chatId, text);
        }
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
          });
        }
      }
    }
  } catch (e) {
    console.error("Failed to send alert notifications", e);
  }
}

/**
 * Finds the nearest region for a given lat/lng
 */
function getRegionByCoords(lat: number, lng: number): string {
  const REGION_CENTERS: Record<string, {lat: number, lng: number, name: string}> = {
    'Київська область': { lat: 50.45, lng: 30.52, name: 'Київщині' },
    'Чернігівська область': { lat: 51.49, lng: 31.28, name: 'Чернігівщині' },
    'Сумська область': { lat: 50.90, lng: 34.79, name: 'Сумщині' },
    'Полтавська область': { lat: 49.58, lng: 34.55, name: 'Полтавщині' },
    'Харківська область': { lat: 49.99, lng: 36.23, name: 'Харківщині' },
    'Дніпропетровська область': { lat: 48.46, lng: 35.04, name: 'Дніпропетровщині' },
    'Запорізька область': { lat: 47.83, lng: 35.13, name: 'Запоріжжі' },
    'Херсонська область': { lat: 46.63, lng: 32.61, name: 'Херсонщині' },
    'Миколаївська область': { lat: 46.97, lng: 31.99, name: 'Миколаївщині' },
    'Одеська область': { lat: 46.48, lng: 30.72, name: 'Одещині' },
    'Кіровоградська область': { lat: 48.50, lng: 32.26, name: 'Кіровоградщині' },
    'Черкаська область': { lat: 49.44, lng: 32.05, name: 'Черкащині' },
    'Вінницька область': { lat: 49.23, lng: 28.46, name: 'Вінниччині' },
    'Житомирська область': { lat: 50.25, lng: 28.65, name: 'Житомирщині' },
    'Хмельницька область': { lat: 49.42, lng: 26.98, name: 'Хмельниччині' },
    'Рівненська область': { lat: 50.61, lng: 26.25, name: 'Рівненщині' },
    'Волинська область': { lat: 50.74, lng: 25.32, name: 'Волині' },
    'Львівська область': { lat: 49.83, lng: 24.02, name: 'Львівщині' },
    'Тернопільська область': { lat: 49.55, lng: 25.59, name: 'Тернопільщині' },
    'Івано-Франківська область': { lat: 48.92, lng: 24.71, name: 'Івано-Франківщині' },
    'Закарпатська область': { lat: 48.62, lng: 22.28, name: 'Закарпатті' },
    'Чернівецька область': { lat: 48.29, lng: 25.93, name: 'Буковині' },
  };

  let closestRegion = 'в повітряному просторі';
  let minDist = Infinity;

  const deg2rad = (deg: number) => deg * (Math.PI/180);

  for (const [key, center] of Object.entries(REGION_CENTERS)) {
    const R = 6371; 
    const dLat = deg2rad(center.lat - lat);
    const dLon = deg2rad(center.lng - lng); 
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat)) * Math.cos(deg2rad(center.lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const dist = R * c;
    
    if (dist < minDist && dist < 150) { // Max 150km radius
      minDist = dist;
      closestRegion = `на ${center.name}`;
    }
  }

  return closestRegion;
}

/**
 * Converts a degree course to a human-readable direction
 */
function getCourseDirection(course: number): string {
  const directions = [
    'Північний', 'Північно-Східний', 'Східний', 'Південно-Східний',
    'Південний', 'Південно-Західний', 'Західний', 'Північно-Західний'
  ];
  const index = Math.round(((course %= 360) < 0 ? course + 360 : course) / 45) % 8;
  return directions[index];
}

/**
 * Broadcasts a new threat to a public Telegram channel.
 */
export async function broadcastThreatToChannel(threatType: string, targetName: string | null, quantity: number = 1, lat?: number, lng?: number, course?: number | null) {
  if (!bot) return;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  if (!channelId) return;

  const typeMap: Record<string, string> = {
    'DRONE': '🛸 Шахед',
    'MISSILE': '🚀 Ракета',
    'CRUISE_MISSILE': '🚀 Крилата ракета',
    'BALLISTIC_MISSILE': '🚀 Балістика',
    'AIRCRAFT': '✈️ Авіація',
    'KAB': '💣 КАБ',
    'RECON': '👁️ Розвідник',
    'KH101': '🚀 Х-101',
    'KALIBR': '🚀 Калібр',
    'ISKANDER': '🚀 Іскандер',
    'KINZHAL': '🚀 Кинджал',
    'ZIRCON': '🚀 Циркон',
  };

  const readableType = typeMap[threatType] || '⚠️ Невідома ціль';

  let typePrefix = readableType;
  if (quantity > 1) {
     if (threatType === 'DRONE' || threatType === 'FPV') {
         typePrefix = `🛸 Рій шахедів/БПЛА (${quantity} шт)`;
     } else if (threatType === 'MISSILE' || threatType === 'CRUISE_MISSILE') {
         typePrefix = `🚀 Група ракет (${quantity} шт)`;
     } else {
         typePrefix = `${readableType} (${quantity} шт)`;
     }
  }

  let targetText = "";
  let courseText = "";

  if (lat && lng) {
    const { getNearestCity } = require('../services/geocoder');
    const nearestCity = getNearestCity(lat, lng);
    const regionLocation = getRegionByCoords(lat, lng);
    
    if (nearestCity) {
        const cleanRegion = regionLocation.replace('на ', '').replace('в ', '');
        if (cleanRegion.includes('повітряному просторі')) {
            targetText = `фіксується біля н.п. ${nearestCity}!`;
        } else {
            targetText = `фіксується біля н.п. ${nearestCity} (${cleanRegion})!`;
        }
    } else {
        targetText = `фіксується ${regionLocation}!`;
    }

    if (course != null) {
        const turf = require('@turf/turf');
        const dest = turf.destination(turf.point([lng, lat]), 40, course, {units: 'kilometers'} as any);
        const destCity = getNearestCity(dest.geometry.coordinates[1], dest.geometry.coordinates[0]);
        
        if (destCity && destCity !== nearestCity) {
            courseText = `\n🧭 Вектор руху: на н.п. ${destCity}`;
        } else {
            courseText = `\n🧭 Курс: ${getCourseDirection(course)}`;
        }
    }
  } else if (targetName) {
    targetText = `вектор руху: на ${targetName}!`;
  } else {
    targetText = `в повітряному просторі!`;
  }

  const message = `${typePrefix} ${targetText}${courseText}\n\n[карта цілей](https://t.me/alivemap_bot) | [підписатися](https://t.me/alivemap_channel)`;

  try {
    await bot.sendMessage(channelId, message, { parse_mode: 'Markdown' } as any);
  } catch (err: any) {
    console.error(`Failed to broadcast to channel ${channelId}:`, err.message);
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
