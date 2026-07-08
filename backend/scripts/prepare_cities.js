const axios = require('axios');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const GEONAMES_URL = 'https://download.geonames.org/export/dump/UA.zip';
const ZIP_OUTPUT = path.join(__dirname, '..', 'UA.zip');
const TXT_OUTPUT = path.join(__dirname, '..', 'UA.txt');
const JSON_OUTPUT = path.join(__dirname, '..', 'cities.json');

const admin1ToRegion = {
    '01': 'Черкаська область',
    '02': 'Чернігівська область',
    '03': 'Чернівецька область',
    '05': 'Автономна Республіка Крим',
    '04': 'Дніпропетровська область',
    '06': 'Донецька область',
    '07': 'Івано-Франківська область',
    '08': 'Харківська область',
    '09': 'Херсонська область',
    '10': 'Хмельницька область',
    '11': 'Київська область',
    '12': 'м. Київ',
    '13': 'Кіровоградська область',
    '14': 'Луганська область',
    '15': 'Львівська область',
    '16': 'Миколаївська область',
    '17': 'Одеська область',
    '18': 'Полтавська область',
    '19': 'Рівненська область',
    '20': 'Севастополь',
    '21': 'Сумська область',
    '22': 'Тернопільська область',
    '23': 'Вінницька область',
    '24': 'Волинська область',
    '25': 'Закарпатська область',
    '26': 'Запорізька область',
    '27': 'Житомирська область'
};

async function downloadAndExtract() {
    console.log('Downloading Geonames UA dataset...');
    const AdmZip = require('adm-zip');
    try {
        const response = await axios({
            url: GEONAMES_URL,
            method: 'GET',
            responseType: 'arraybuffer'
        });
        fs.writeFileSync(ZIP_OUTPUT, response.data);
        console.log('Extracting...');
        const zip = new AdmZip(ZIP_OUTPUT);
        zip.extractEntryTo('UA.txt', path.join(__dirname, '..'), false, true);
        fs.unlinkSync(ZIP_OUTPUT);
        console.log('Extraction complete.');
    } catch (e) {
        console.error('Failed to download/extract:', e);
        process.exit(1);
    }
}

async function parseGeonames() {
    console.log('Parsing UA.txt into optimized JSON...');
    const fileStream = fs.createReadStream(TXT_OUTPUT);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    const cities = [];
    for await (const line of rl) {
        const parts = line.split('\t');
        if (parts.length < 15) continue;
        const featureClass = parts[6];
        if (featureClass !== 'P') continue;
        const name = parts[1];
        const alternateNames = parts[3].split(',');
        const lat = parseFloat(parts[4]);
        const lng = parseFloat(parts[5]);
        const admin1 = parts[10];
        const population = parseInt(parts[14], 10) || 0;
        
        const ukNames = new Set();
        if (/[А-Яа-яІіЇїЄєҐґ]/.test(name)) {
            ukNames.add(name.toLowerCase());
        }
        for (const alt of alternateNames) {
            if (/[А-Яа-яІіЇїЄєҐґ]/.test(alt)) {
                ukNames.add(alt.toLowerCase());
            }
        }
        if (ukNames.size === 0) continue;
        const regionName = admin1ToRegion[admin1] || 'Unknown';
        cities.push({
            names: Array.from(ukNames),
            lat,
            lng,
            region: regionName,
            pop: population
        });
    }
    cities.sort((a, b) => b.pop - a.pop);
    fs.writeFileSync(JSON_OUTPUT, JSON.stringify(cities));
    console.log(`Saved ${cities.length} Ukrainian settlements to cities.json!`);
    fs.unlinkSync(TXT_OUTPUT);
}

async function main() {
    await downloadAndExtract();
    await parseGeonames();
}
main();
