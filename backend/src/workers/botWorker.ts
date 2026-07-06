import TelegramBot from 'node-telegram-bot-api';
import prisma from '../db';

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

    bot!.sendMessage(chatId, "Привіт! Оберіть свій регіон для отримання сповіщень про тривоги та відбої:", {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });
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

    const message = isAlert 
      ? `🔴 **Повітряна тривога!**\n\nРегіон: ${region}\nПрямуйте в укриття!`
      : `🟢 **Відбій тривоги!**\n\nРегіон: ${region}`;

    for (const sub of subscribers) {
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
