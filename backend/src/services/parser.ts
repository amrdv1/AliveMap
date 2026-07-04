export interface ParsedThreat {
  type: 'DRONE' | 'MISSILE' | 'AIRCRAFT' | 'INFO';
  lat: number | null;
  lng: number | null;
  confidence: number;
}

// Simple Geocoding Dictionary (Roots)
const CITY_COORDS: Record<string, {lat: number, lng: number}> = {
  "київ": { lat: 50.4501, lng: 30.5234 },
  "львів": { lat: 49.8397, lng: 24.0297 },
  "одес": { lat: 46.4825, lng: 30.7233 },
  "харків": { lat: 50.0000, lng: 36.2304 },
  "дніпр": { lat: 48.4647, lng: 35.0462 },
  "миколаїв": { lat: 46.9750, lng: 31.9946 },
  "запоріжж": { lat: 47.8388, lng: 35.1396 },
  "херсон": { lat: 46.6354, lng: 32.6169 },
  "черніг": { lat: 51.4982, lng: 31.2893 },
  "сум": { lat: 50.9077, lng: 34.7981 },
  "полтав": { lat: 49.5883, lng: 34.5514 },
  "черкас": { lat: 49.4444, lng: 32.0598 },
  "вінниц": { lat: 49.2331, lng: 28.4682 },
  "житомир": { lat: 50.2547, lng: 28.6587 },
  "рівн": { lat: 50.6199, lng: 26.2516 },
  "кропивницьк": { lat: 48.5079, lng: 32.2623 },
  "хмельницьк": { lat: 49.4230, lng: 26.9871 },
  "чернівц": { lat: 48.2915, lng: 25.9352 },
  "франківськ": { lat: 48.9226, lng: 24.7111 },
  "тернопіль": { lat: 49.5535, lng: 25.5948 },
  "луцьк": { lat: 50.7472, lng: 25.3254 },
  "ужгород": { lat: 48.6208, lng: 22.2879 },
  "крив": { lat: 47.9100, lng: 33.3918 }, // Kryvyi Rih
};

export function parseTelegramText(text: string): ParsedThreat {
  const lowerText = text.toLowerCase();
  
  let type: ParsedThreat['type'] = 'INFO';
  if (lowerText.match(/(шахед|бпла|мопед|безпілотник)/)) {
    type = 'DRONE';
  } else if (lowerText.match(/(ракет|балістик|кинджал|іскандер|х-101|кх-)/)) {
    type = 'MISSILE';
  } else if (lowerText.match(/(ту-95|міг-31|авіаці|су-34)/)) {
    type = 'AIRCRAFT';
  }
  
  let lat = null;
  let lng = null;
  let confidence = 0;
  
  // Random offset for coordinates so they don't stack exactly on top of each other
  const jitter = () => (Math.random() - 0.5) * 0.3; 
  
  for (const [cityKey, coords] of Object.entries(CITY_COORDS)) {
    if (lowerText.includes(cityKey)) {
      lat = coords.lat + jitter();
      lng = coords.lng + jitter();
      confidence = 80;
      break;
    }
  }
  
  return { type, lat, lng, confidence };
}
