const { parseTelegramText } = require('./src/services/parser.ts');
require('ts-node').register();
const parser = require('./src/services/parser');

const text = "Завершение активной фазы войны возможно до конца года, — Буданов. Шанс есть, и весной он был очень хорошим. Сейчас ситуация немного обострилась. Чтобы выйти из этой эскалации, обычно требуется довести её до предела, а затем возобновление диалога. Если стороны в этом заинтересованы. Украина заинтересована. Таким образом, глава ОП подтверждает нашу";

console.log(parser.parseTelegramText(text));
