const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./public/ukraine-districts.geojson', 'utf8'));
const allKeys = new Set();
data.features.forEach(f => {
  Object.keys(f.properties).forEach(k => allKeys.add(k));
});
console.log(Array.from(allKeys));
