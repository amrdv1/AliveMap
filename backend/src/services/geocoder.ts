import fs from 'fs';
import path from 'path';
import { alertsService } from './alertsService';

interface GeocodeResult {
  lat: number;
  lng: number;
  region?: string;
}

let citiesCache: any[] = [];

function loadCities() {
  try {
    const jsonPath = path.join(__dirname, '..', '..', 'cities.json');
    if (fs.existsSync(jsonPath)) {
      citiesCache = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      console.log(`[Geocoder] Loaded ${citiesCache.length} cities into memory.`);
    } else {
      console.warn(`[Geocoder] cities.json not found at ${jsonPath}`);
    }
  } catch (e) {
    console.error('[Geocoder] Failed to load cities.json:', e);
  }
}

// Load on boot
loadCities();

const REGION_CENTERS: Record<string, {lat: number, lng: number, region: string}> = {
  'київщина': { lat: 50.4501, lng: 30.5234, region: 'Київська область' },
  'чернігівщина': { lat: 51.4982, lng: 31.2893, region: 'Чернігівська область' },
  'сумщина': { lat: 50.9077, lng: 34.7981, region: 'Сумська область' },
  'полтавщина': { lat: 49.5883, lng: 34.5514, region: 'Полтавська область' },
  'харківщина': { lat: 49.9935, lng: 36.2304, region: 'Харківська область' },
  'дніпропетровщина': { lat: 48.4647, lng: 35.0462, region: 'Дніпропетровська область' },
  'запоріжжя': { lat: 47.8388, lng: 35.1396, region: 'Запорізька область' },
  'херсонщина': { lat: 46.6354, lng: 32.6169, region: 'Херсонська область' },
  'миколаївщина': { lat: 46.9750, lng: 31.9946, region: 'Миколаївська область' },
  'одещина': { lat: 46.4825, lng: 30.7233, region: 'Одеська область' },
  'кіровоградщина': { lat: 48.5079, lng: 32.2623, region: 'Кіровоградська область' },
  'черкащина': { lat: 49.4444, lng: 32.0598, region: 'Черкаська область' },
  'вінниччина': { lat: 49.2331, lng: 28.4682, region: 'Вінницька область' },
  'житомирщина': { lat: 50.2547, lng: 28.6587, region: 'Житомирська область' },
  'хмельниччина': { lat: 49.4230, lng: 26.9871, region: 'Хмельницька область' },
  'рівненщина': { lat: 50.6199, lng: 26.2516, region: 'Рівненська область' },
  'волинь': { lat: 50.7472, lng: 25.3253, region: 'Волинська область' },
  'львівщина': { lat: 49.8397, lng: 24.0297, region: 'Львівська область' },
  'тернопільщина': { lat: 49.5535, lng: 25.5948, region: 'Тернопільська область' },
  'франківщина': { lat: 48.9226, lng: 24.7111, region: 'Івано-Франківська область' },
  'буковина': { lat: 48.2915, lng: 25.9352, region: 'Чернівецька область' },
  'закарпаття': { lat: 48.6208, lng: 22.2879, region: 'Закарпатська область' },
  'донеччина': { lat: 48.0159, lng: 37.8028, region: 'Донецька область' },
  'луганщина': { lat: 48.5740, lng: 39.3078, region: 'Луганська область' }
};

export async function geocodeLocation(locationName: string, dropIfQuiet: boolean = true): Promise<GeocodeResult | null> {
  if (citiesCache.length === 0) return null;

  const query = locationName.trim().toLowerCase();
  if (query.length < 2) return null;

  let matches = citiesCache.filter(c => c.names.includes(query));

  if (matches.length === 0) {
    // Fallback to region colloquial names
    let matchedRegionKey = Object.keys(REGION_CENTERS).find(key => query.includes(key));
    if (matchedRegionKey) {
        matches = [{
            names: [query],
            lat: REGION_CENTERS[matchedRegionKey].lat,
            lng: REGION_CENTERS[matchedRegionKey].lng,
            region: REGION_CENTERS[matchedRegionKey].region,
            pop: 1000000 // high priority
        }];
    } else {
        console.log(`[Geocoder] Not found: ${query}`);
        return null;
    }
  }

  // Sort matches to prioritize regions with active alerts, but NEVER let a tiny village override a major city
  matches.sort((a, b) => {
    const aActive = alertsService.isRegionActive(a.region) ? 1 : 0;
    const bActive = alertsService.isRegionActive(b.region) ? 1 : 0;
    
    // Give active regions a +500,000 population bonus.
    // This allows active small towns to win over inactive small towns,
    // but ensures huge cities (>500k) always win regardless of alert status.
    const aScore = a.pop + (aActive * 500000);
    const bScore = b.pop + (bActive * 500000);
    
    return bScore - aScore;
  });

  const bestMatch = matches[0];
  
  if (dropIfQuiet) {
    const isActive = alertsService.isRegionActive(bestMatch.region);
    // If the region has no active alert, we drop it to prevent false positives
    if (!isActive && bestMatch.region !== 'Unknown') {
      console.log(`[Geocoder] Dropped ${query} because ${bestMatch.region} has NO active alert.`);
      return null;
    }
  }

  console.log(`[Geocoder] Found: ${query} -> [${bestMatch.lat}, ${bestMatch.lng}] in ${bestMatch.region}`);
  return { lat: bestMatch.lat, lng: bestMatch.lng, region: bestMatch.region };
}

export async function searchCities(query: string, limit: number = 10) {
  if (citiesCache.length === 0) return [];
  
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const matches = citiesCache.filter(c => c.names.some((n: string) => n.includes(q)));
  
  matches.sort((a, b) => {
    // Exact match boost
    const aExact = a.names.includes(q) ? 1 : 0;
    const bExact = b.names.includes(q) ? 1 : 0;
    if (aExact !== bExact) return bExact - aExact;
    
    return b.pop - a.pop;
  });

  return matches.slice(0, limit).map(c => ({
    name: c.names.find((n: string) => n.toLowerCase().includes(q)) || c.names[0],
    region: c.region,
    lat: c.lat,
    lng: c.lng,
    pop: c.pop
  }));
}
