import { parseTelegramText } from './src/services/parser';

const text = `❗️⚠️ Харьковская область.
FPV-дроны:
⚠️ над Слатино
⚠️ на Доровковку
⚠️ над Гоптовкой
⚠️ на Боровую
⚠️ на Казачью Лопань
⚠️ на Тищенковку

⚠️ Зала 🔄 над Устиновкой`;

const res = parseTelegramText(text);
console.log("\nResults:");
console.log(JSON.stringify(res, null, 2));
