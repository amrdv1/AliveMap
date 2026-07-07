import { parseTelegramText } from './src/services/parser';

const tests = [
  "Шахед на Полтавщині, курс на Київ",
  "1 шахед на Дніпро, 2 на Запоріжжя",
  "Відбій по областях",
  "Ракета з півдня через Миколаївщину на Кіровоградщину!",
  "2х БПЛА повз Харків на північ",
  "Результати роботи ППО: знищено 10 шахедів"
];

for (const t of tests) {
  console.log('--- TEST ---');
  console.log(t);
  console.log(JSON.stringify(parseTelegramText(t), null, 2));
}
