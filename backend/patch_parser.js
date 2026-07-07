const fs = require('fs');
let content = fs.readFileSync('src/services/parser.ts', 'utf8');

// Replace ParsedThreat
content = content.replace(
  /type: 'DRONE'.*?'RECON';/,
  "type: 'DRONE' | 'MISSILE' | 'AIRCRAFT' | 'ALERT' | 'BALLISTIC_MISSILE' | 'CRUISE_MISSILE' | 'KAB' | 'SUMMARY' | 'INFO' | 'ZIRCON' | 'KH101' | 'ISKANDER' | 'KINZHAL' | 'KALIBR' | 'PPO' | 'FPV' | 'UNKNOWN' | 'RECON' | 'MOLNIYA' | 'DECOY';"
);

// Replace detectThreatType
const regexDetect = /function detectThreatType.*?return null;\s*\}/s;
let detectBlock = content.match(regexDetect)[0];

detectBlock = detectBlock.replace(
  /if \(t\.match\(\/\(fpv\|фпв\|фпві\)\/\)\) return 'FPV';/,
  "if (t.match(/(fpv|фпв|фпві)/)) return 'FPV';\n  if (t.match(/(молнія|блискавка|molniya)/)) return 'MOLNIYA';\n  if (t.match(/(гербер|імітатор|пародія|decoy|parodi|gerbera)/)) return 'DECOY';"
);

content = content.replace(regexDetect, detectBlock);

fs.writeFileSync('src/services/parser.ts', content, 'utf8');
console.log('Patched parser.ts');
