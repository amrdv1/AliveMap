const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./frontend/public/ukraine-districts.geojson', 'utf8'));

// Check if already added
if (!data.features.some(f => f.properties.rayon === 'м. Київ')) {
    const cx = 30.5234;
    const cy = 50.4501;
    const r = 0.15; // ~15km in degrees

    const points = [];
    for (let i = 0; i <= 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle) * 0.65]);
    }

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

    data.features.push(kyivFeature);
    fs.writeFileSync('./frontend/public/ukraine-districts.geojson', JSON.stringify(data));
    console.log("Kyiv City injected!");
} else {
    console.log("Already exists.");
}
