import fs from 'fs';
import path from 'path';
import { alertsService } from './alertsService';

interface GeocodeResult {
  lat: number;
  lng: number;
  region?: string;
  isLaunchSite?: boolean;
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

const SLANG_MAP: Record<string, string> = {
  // Київ
  'троя': 'троєщина', 'троящина': 'троєщина', 
  'шулявка': 'шулявка', 'кардачі': 'караваєві дачі',
  
  // Custom lemmatization fixes
  'городній': 'городня',
  
  // Харків
  'хтз': 'харків', // fallback for XTZ if not in geonames
  
  // Одеса
  'таїрова': 'таїрове', 'поселок': 'котовського',
  
  // Запоріжжя
  'шевчик': 'шевченківський'
};

const LAUNCH_SITES: Record<string, {lat: number, lng: number, region: string}> = {
  'таганрог': { lat: 47.23, lng: 38.89, region: 'РФ (Таганрог)' },
  'крим': { lat: 45.3, lng: 34.4, region: 'АР Крим' },
  'курськ': { lat: 51.73, lng: 36.19, region: 'РФ (Курськ)' },
  'курська': { lat: 51.73, lng: 36.19, region: 'РФ (Курськ)' },
  'бєлгород': { lat: 50.59, lng: 36.58, region: 'РФ (Бєлгород)' },
  'белгород': { lat: 50.59, lng: 36.58, region: 'РФ (Бєлгород)' },
  'брянськ': { lat: 53.24, lng: 34.37, region: 'РФ (Брянськ)' },
  'брянська': { lat: 53.24, lng: 34.37, region: 'РФ (Брянськ)' },
  'єйськ': { lat: 46.71, lng: 38.27, region: 'РФ (Єйськ)' },
  'приморсько-ахтарськ': { lat: 46.04, lng: 38.17, region: 'РФ (Приморсько-Ахтарськ)' },
  'ахтарськ': { lat: 46.04, lng: 38.17, region: 'РФ (Приморсько-Ахтарськ)' },
  'енгельс': { lat: 51.48, lng: 46.11, region: 'РФ (Енгельс)' },
  'воронеж': { lat: 51.66, lng: 39.20, region: 'РФ (Воронеж)' },
  'морозовськ': { lat: 48.35, lng: 41.82, region: 'РФ (Морозовськ)' },
  'міллєрово': { lat: 48.92, lng: 40.38, region: 'РФ (Міллєрово)' },
  'миллерово': { lat: 48.92, lng: 40.38, region: 'РФ (Міллєрово)' },
  'оленья': { lat: 68.15, lng: 33.45, region: 'РФ (Мурманськ)' },
  'саваслейка': { lat: 55.45, lng: 42.31, region: 'РФ (Саваслейка)' },
  'каспійськ': { lat: 44.30, lng: 47.45, region: 'РФ (Каспійськ)' },
  'рязань': { lat: 54.62, lng: 39.73, region: 'РФ (Рязань)' },
  'тула': { lat: 54.19, lng: 37.61, region: 'РФ (Тула)' },
  'орел': { lat: 52.96, lng: 36.06, region: 'РФ (Орел)' }
};

export async function geocodeLocation(locationName: string, dropIfQuiet: boolean = true, contextChannel?: string): Promise<GeocodeResult | null> {
  if (citiesCache.length === 0) return null;

  let cleanQuery = locationName.trim().toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/\s+(тг|отг|район|обл|область|м\.|село|смт|місто)\b/g, ' ')
    .replace(/^(м\.|село|смт|місто)\s+/g, '')
    .trim();

  if (SLANG_MAP[cleanQuery]) {
      cleanQuery = SLANG_MAP[cleanQuery];
  }

  if (cleanQuery.length < 2) return null;

  // 1. Check Region Fallbacks FIRST to prevent colloquial regions from matching random villages
  let matchedRegionKey = Object.keys(REGION_CENTERS).find(key => cleanQuery.includes(key));
  if (matchedRegionKey) {
      return {
          lat: REGION_CENTERS[matchedRegionKey].lat,
          lng: REGION_CENTERS[matchedRegionKey].lng,
          region: REGION_CENTERS[matchedRegionKey].region
      };
  }

  // 1.5. Check Launch Sites
  let matchedLaunchSite = Object.keys(LAUNCH_SITES).find(key => cleanQuery.includes(key));
  if (matchedLaunchSite) {
      return {
          lat: LAUNCH_SITES[matchedLaunchSite].lat,
          lng: LAUNCH_SITES[matchedLaunchSite].lng,
          region: LAUNCH_SITES[matchedLaunchSite].region,
          isLaunchSite: true
      };
  }

  // 2. Exact matches
  let matches = citiesCache.filter(c => c.names.includes(cleanQuery));

  // 3. Starts-with matches
  if (matches.length === 0) {
      matches = citiesCache.filter(c => c.names.some((n: string) => cleanQuery.startsWith(n + ' ') || cleanQuery === n));
  }

  // Helper to escape regex
  const escapeRegExp = (string: string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  };

  // 4. Substring matches (ensure word boundaries so 'огромный' doesnt match 'ромны')
  if (matches.length === 0 && cleanQuery.length >= 4) {
      matches = citiesCache.filter(c => c.names.some((n: string) => {
          if (n.length < 3) return false; // Prevent tiny 2-letter villages from matching inside sentences
          const regex = new RegExp(`(^|\\s|-)${escapeRegExp(n)}(\\s|-|$)`, 'i');
          return regex.test(cleanQuery) || cleanQuery.includes(n + ' область') || cleanQuery.includes(n + ' район');
      }));
  }
  
  if (contextChannel && contextChannel.toLowerCase().includes('nikalert')) {
      const originalMatchesCount = matches.length;
      matches = matches.filter(m => m.region === 'Дніпропетровська область' || m.region === 'Запорізька область');
      if (matches.length === 0) {
          let nikopol = citiesCache.find(c => c.names.includes('нікополь'));
          if (nikopol) {
              console.log(`[Geocoder] Fallback to Nikopol for query: ${cleanQuery} (dropped ${originalMatchesCount} out of bounds matches) due to @nikalert context`);
              return { lat: nikopol.lat, lng: nikopol.lng, region: nikopol.region };
          }
      }
  }

  if (matches.length === 0) {
      console.log(`[Geocoder] Not found: ${cleanQuery}`);
      return null;
  }

  // Sort matches to prioritize regions with active alerts, but NEVER let a tiny village override a major city
  matches.sort((a, b) => {
    const aActive = alertsService.isRegionActive(a.region);
    const bActive = alertsService.isRegionActive(b.region);
    
    // Use a multiplier instead of a flat bonus. An active region gives a 10x population boost.
    // This allows active small towns to win over inactive small towns,
    // but ensures a 100k+ city will never be beaten by a tiny 100-person village.
    const aScore = a.pop * (aActive ? 10 : 1);
    const bScore = b.pop * (bActive ? 10 : 1);
    
    return bScore - aScore;
  });

  const bestMatch = matches[0];
  
  if (dropIfQuiet) {
    const isActive = alertsService.isRegionActive(bestMatch.region);
    // If the region has no active alert, we drop it to prevent false positives
    if (!isActive && bestMatch.region !== 'Unknown') {
      console.log(`[Geocoder] Dropped ${cleanQuery} because ${bestMatch.region} has NO active alert.`);
      return null;
    }
  }

  console.log(`[Geocoder] Found: ${cleanQuery} -> [${bestMatch.lat}, ${bestMatch.lng}] in ${bestMatch.region}`);
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
