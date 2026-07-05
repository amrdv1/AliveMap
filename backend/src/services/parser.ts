export interface ParsedThreat {
  type: 'DRONE' | 'MISSILE' | 'AIRCRAFT' | 'ALERT' | 'BALLISTIC_MISSILE' | 'CRUISE_MISSILE' | 'KAB';
  lat: number | null;
  lng: number | null;
  confidence: number;
  direction?: number;
}

// Ukrainian Regions & Cities
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
  "волин": { lat: 50.7472, lng: 25.3254 },
  "закарпат": { lat: 48.6208, lng: 22.2879 },
  "ужгород": { lat: 48.6208, lng: 22.2879 },
  "крив": { lat: 47.9100, lng: 33.3918 }, 
  "кременчу": { lat: 49.0667, lng: 33.4167 },
  "білгород": { lat: 46.1958, lng: 30.3496 }, // Bilhorod-Dnistrovskyi
  "ізмаїл": { lat: 45.3400, lng: 28.8350 },
  "мирг": { lat: 49.9654, lng: 33.6050 },
  "старокост": { lat: 49.7547, lng: 27.2181 }, // Starokostiantyniv
};

// Russian & Belarusian Airbases
const AIRBASE_COORDS: Record<string, {lat: number, lng: number}> = {
  "саваслей": { lat: 55.4411, lng: 42.3161 }, // Savasleyka
  "олень": { lat: 68.1517, lng: 33.4617 }, // Olenya
  "енгельс": { lat: 51.4811, lng: 46.2111 }, // Engels
  "моздок": { lat: 43.7850, lng: 44.5936 }, // Mozdok
  "шайков": { lat: 54.2250, lng: 34.3683 }, // Shaykovka
  "дягіл": { lat: 54.6464, lng: 39.5714 }, // Diaghilevo
  "мачулищ": { lat: 53.7719, lng: 27.5772 }, // Machulishchy
  "бельбек": { lat: 44.6853, lng: 33.5614 }, // Belbek
  "ахтубінськ": { lat: 48.3075, lng: 46.2081 }, // Akhtubinsk
  "морозовськ": { lat: 48.3142, lng: 41.7925 }, // Morozovsk
  "курськ": { lat: 51.7373, lng: 36.1950 },
  "воронеж": { lat: 51.6608, lng: 39.2003 },
};

// Generic safe zones to place threats with no exact coordinates
const GENERIC_SPAWN = {
  AIRCRAFT: { lat: 53.0, lng: 39.0 }, // Central Russia (east of Voronezh)
  DRONE: { lat: 45.0, lng: 36.0 }, // Sea of Azov
  MISSILE: { lat: 46.0, lng: 37.0 }, // Sea of Azov / Krasnodar
};

export function parseTelegramText(text: string): ParsedThreat | null {
  const lowerText = text.toLowerCase();
  
  let type: ParsedThreat['type'] | null = null;
  
  // Strict matching to ignore informational messages
  if (lowerText.match(/(шахед|бпла|мопед|безпілотник)/)) {
    type = 'DRONE';
  } else if (lowerText.match(/(балістик|кинджал|іскандер)/)) {
    type = 'BALLISTIC_MISSILE';
  } else if (lowerText.match(/(х-101|х-55|х-59|х-69|калібр|кх-)/)) {
    type = 'CRUISE_MISSILE';
  } else if (lowerText.match(/(ракет|р-68|р-27)/)) {
    type = 'MISSILE';
  } else if (lowerText.match(/(ту-95|міг-31|авіаці|су-34|су-35|су-27|ту-22)/)) {
    type = 'AIRCRAFT';
  } else if (lowerText.match(/(каб|фаб|уаб)/)) {
    type = 'KAB';
  }

  // If no specific threat type is found, or it's a generic "tryvoha" message, ignore.
  if (!type) return null;
  
  // Filter out generic alerts that do not mention movement or takeoffs
  if (lowerText.match(/(увага|повітряна тривога|відбій)/) && !lowerText.match(/(летить|рух|зліт|пуск|напрямок)/)) {
      return null;
  }
  
  let lat = null;
  let lng = null;
  let confidence = 0;
  
  const jitter = () => (Math.random() - 0.5) * 0.3; 
  const direction = Math.floor(Math.random() * 360);
  
  // 1. Check if Airbase is mentioned (highest priority for aircraft)
  if (type === 'AIRCRAFT') {
      for (const [base, coords] of Object.entries(AIRBASE_COORDS)) {
        if (lowerText.includes(base)) {
          lat = coords.lat + jitter();
          lng = coords.lng + jitter();
          confidence = 90;
          break;
        }
      }
  }

  // 2. Check if Ukrainian City/Region is mentioned
  if (lat === null) {
      for (const [cityKey, coords] of Object.entries(CITY_COORDS)) {
        if (lowerText.includes(cityKey)) {
          lat = coords.lat + jitter();
          lng = coords.lng + jitter();
          confidence = 80;
          break;
        }
      }
  }
  
  // 3. Fallback: if Takeoff / Movement is detected but no coordinates, assign default generic coordinates
  if (lat === null) {
      if (type === 'AIRCRAFT' && lowerText.match(/(зліт|в повітрі|активність|на пускових|рубіж)/)) {
          lat = GENERIC_SPAWN.AIRCRAFT.lat + jitter();
          lng = GENERIC_SPAWN.AIRCRAFT.lng + jitter();
          confidence = 50;
      } else if (type === 'DRONE') {
          lat = GENERIC_SPAWN.DRONE.lat + jitter();
          lng = GENERIC_SPAWN.DRONE.lng + jitter();
          confidence = 50;
      } else if (type === 'MISSILE' || type === 'BALLISTIC_MISSILE' || type === 'CRUISE_MISSILE') {
          lat = GENERIC_SPAWN.MISSILE.lat + jitter();
          lng = GENERIC_SPAWN.MISSILE.lng + jitter();
          confidence = 50;
      } else {
          // If we can't map it and it's not a generic takeoff, return null
          return null; 
      }
  }
  
  return { type, lat, lng, confidence, direction };
}
