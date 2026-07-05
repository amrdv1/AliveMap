const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./frontend/public/ukraine-districts.geojson', 'utf8'));

// Find and replace the existing м. Київ if it exists, or push a new one
const kyivIndex = data.features.findIndex(f => f.properties.rayon === 'м. Київ');

const cx = 30.5234;
const cy = 50.4501;
const r = 0.15; // ~15km in degrees

const points = [];
for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle) * 0.65]);
}
// EXPLICITLY push the first point as the last point to close the ring!
points.push([points[0][0], points[0][1]]);

const kyivFeature = {
    type: "Feature",
    properties: {
        rayon: "м. Київ"
    },
    geometry: {
        type: "Polygon",
        coordinates: [points]
    }
};

if (kyivIndex !== -1) {
    data.features[kyivIndex] = kyivFeature;
} else {
    data.features.push(kyivFeature);
}

fs.writeFileSync('./frontend/public/ukraine-districts.geojson', JSON.stringify(data));
console.log("Kyiv City strictly closed polygon injected!");
