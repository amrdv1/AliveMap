const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./public/ukraine-districts.geojson', 'utf8'));
console.log(Object.keys(data.features[0].properties));
console.log(data.features[0].properties);
