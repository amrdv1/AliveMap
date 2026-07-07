const fs = require('fs');
const file = 'src/services/parser.ts';
let content = fs.readFileSync(file, 'utf8');

// Modify IGNORE_WORDS to add more civilian terms
content = content.replace(
  /const IGNORE_WORDS = \/\(наслідок/,
  'const IGNORE_WORDS = /(озер|нафтопродукт|рятувальник|дтп|аварі|пожеж|забруднення|економік|засідання|президент|крадіжк|ремонт|комунальн|клімат|наслідок'
);

// Modify detectThreatType to require military terms for SUMMARY
// Current: if (t.match(/(результат|підсумок|зведення|залишилося|продовжують|по шахедах)/)) return 'SUMMARY';
// New:
content = content.replace(
  /if \(t\.match\(\/\(результат\|підсумок\|зведення\|залишилося\|продовжують\|по шахедах\)\/\)\) return 'SUMMARY';/,
  "if (t.match(/(результат|підсумок|зведення|залишилося|продовжують|по шахедах)/) && t.match(/(атак|напад|бпла|ракет|шахед|дрон|ціл|збит|відбит|перехопл|мопед)/)) return 'SUMMARY';\n  if (t.match(/по шахедах/)) return 'SUMMARY';"
);

fs.writeFileSync(file, content, 'utf8');
console.log('patched parser');
