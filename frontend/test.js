const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/ukraine.geojson'));
console.log(data.features.map(f => f.properties.name));
