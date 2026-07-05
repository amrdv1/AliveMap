export interface ParsedThreat {
  type: 'DRONE' | 'MISSILE' | 'AIRCRAFT' | 'ALERT' | 'BALLISTIC_MISSILE' | 'CRUISE_MISSILE' | 'KAB';
  lat: number | null;
  lng: number | null;
  confidence: number;
  direction?: number | null;
}

// Ukrainian Regions & Cities (Extended)
const CITY_COORDS: Record<string, {lat: number, lng: number}> = {
  // Cities
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
  "крив": { lat: 47.9100, lng: 33.3918 }, 
  "кременчу": { lat: 49.0667, lng: 33.4167 },
  "білгород": { lat: 46.1958, lng: 30.3496 },
  "ізмаїл": { lat: 45.3400, lng: 28.8350 },
  "мирг": { lat: 49.9654, lng: 33.6050 },
  "старокост": { lat: 49.7547, lng: 27.2181 },
  "павлоград": { lat: 48.5167, lng: 35.8667 },
  "шостк": { lat: 51.8667, lng: 33.4833 },
  "конотоп": { lat: 51.2333, lng: 33.2000 },
  "ніжин": { lat: 51.0333, lng: 31.8833 },
  "умань": { lat: 48.7500, lng: 30.2167 },
  "біл церк": { lat: 49.8000, lng: 30.1167 },
  // Regions
  "київщин": { lat: 50.25, lng: 30.5 },
  "сумщин": { lat: 51.0, lng: 34.0 },
  "харківщин": { lat: 49.5, lng: 36.5 },
  "чернігівщин": { lat: 51.5, lng: 32.0 },
  "одещин": { lat: 47.0, lng: 30.0 },
  "миколаївщин": { lat: 47.5, lng: 32.0 },
  "херсонщин": { lat: 46.5, lng: 33.0 },
  "дніпропетровщин": { lat: 48.5, lng: 35.0 },
  "донеччин": { lat: 48.0, lng: 37.5 },
  "волин": { lat: 51.0, lng: 25.0 },
  "закарпат": { lat: 48.3, lng: 23.0 },
};

// Russian & Belarusian Airbases / Launch Sites
const AIRBASE_COORDS: Record<string, {lat: number, lng: number}> = {
  // Strategic Aviation
  "саваслей": { lat: 55.4411, lng: 42.3161 },
  "олень": { lat: 68.1517, lng: 33.4617 },
  "енгельс": { lat: 51.4811, lng: 46.2111 },
  "моздок": { lat: 43.7850, lng: 44.5936 },
  "шайков": { lat: 54.2250, lng: 34.3683 },
  "дягіл": { lat: 54.6464, lng: 39.5714 },
  "мачулищ": { lat: 53.7719, lng: 27.5772 },
  "бельбек": { lat: 44.6853, lng: 33.5614 },
  "ахтубінськ": { lat: 48.3075, lng: 46.2081 },
  "морозовськ": { lat: 48.3142, lng: 41.7925 },
  "шаталов": { lat: 54.3400, lng: 32.4700 }, // Shatalovo
  // Shahed / Tactical Launch Sites
  "приморськ": { lat: 46.0465, lng: 38.1749 }, // Primorsko-Akhtarsk
  "чауд": { lat: 45.0000, lng: 35.8333 }, // Cape Chauda
  "єйськ": { lat: 46.6811, lng: 38.2062 },
  "курськ": { lat: 51.7373, lng: 36.1950 },
  "воронеж": { lat: 51.6608, lng: 39.2003 },
  "білгородс": { lat: 50.6, lng: 36.6 },
  "брянськ": { lat: 53.2435, lng: 34.3634 },
};

// Generic safe zones to place threats with no exact coordinates
const GENERIC_SPAWN = {
  AIRCRAFT: { lat: 53.0, lng: 39.0 }, // Central Russia (east of Voronezh)
  DRONE_SOUTH: { lat: 45.5, lng: 36.5 }, // Sea of Azov
  DRONE_NORTH: { lat: 52.0, lng: 33.0 }, // Bryansk region
  MISSILE: { lat: 46.0, lng: 37.0 }, // Sea of Azov / Krasnodar
  BLACK_SEA: { lat: 44.0, lng: 31.0 }, // Black Sea
};

function parseDirection(text: string): number | null {
  if (text.match(/(північно-схід|на північний схід)/)) return 45;
  if (text.match(/(південно-схід|на південний схід)/)) return 135;
  if (text.match(/(південно-захід|на південний захід)/)) return 225;
  if (text.match(/(північно-захід|на північний захід)/)) return 315;
  
  if (text.match(/(північ|на північ)/)) return 0;
  if (text.match(/(схід|на схід)/)) return 90;
  if (text.match(/(південь|на південь)/)) return 180;
  if (text.match(/(захід|на захід)/)) return 270;
  
  return null;
}

export function parseTelegramText(text: string): ParsedThreat[] {
  const lowerText = text.toLowerCase();
  
  let type: ParsedThreat['type'] | null = null;
  
  // Strict matching to ignore informational messages
  if (lowerText.match(/(шахед|бпла|мопед|безпілотник|геран|гербер)/)) {
    type = 'DRONE';
  } else if (lowerText.match(/(балістик|кинджал|іскандер|с-300|с-400)/)) {
    type = 'BALLISTIC_MISSILE';
  } else if (lowerText.match(/(х-101|х-55|х-59|х-69|калібр|кх-|ракетонос)/)) {
    type = 'CRUISE_MISSILE';
  } else if (lowerText.match(/(ракет|р-68|р-27)/)) {
    type = 'MISSILE';
  } else if (lowerText.match(/(ту-95|ту-160|ту-22|міг-31|авіаці|су-34|су-35|су-27|бортів)/)) {
    type = 'AIRCRAFT';
  } else if (lowerText.match(/(каб|фаб|уаб|авіабомб)/)) {
    type = 'KAB';
  }

  // If no specific threat type is found, or it's a generic "tryvoha" message, ignore.
  if (!type) return [];
  
  // Filter out generic alerts that do not mention movement, takeoffs, or specific presence
  if (lowerText.match(/(увага|повітряна тривога|відбій)/) && !lowerText.match(/(летить|рух|зліт|пуск|напрямок|загроза|фіксує|повітрі|пускові|курс)/)) {
      return [];
  }
  
  const matchedLocations: {lat: number, lng: number, conf: number}[] = [];
  
  // 1. Check if Airbase / Launch site is mentioned (collect ALL)
  for (const [base, coords] of Object.entries(AIRBASE_COORDS)) {
    if (lowerText.includes(base)) {
      matchedLocations.push({ lat: coords.lat, lng: coords.lng, conf: 90 });
    }
  }

  // 2. Check if Ukrainian City/Region is mentioned (collect ALL)
  if (matchedLocations.length === 0) {
      for (const [cityKey, coords] of Object.entries(CITY_COORDS)) {
        if (lowerText.includes(cityKey)) {
          matchedLocations.push({ lat: coords.lat, lng: coords.lng, conf: 80 });
        }
      }
  }
  
  // 3. Fallback: Assign default generic coordinates based on context
  if (matchedLocations.length === 0) {
      if (type === 'AIRCRAFT' && lowerText.match(/(зліт|в повітрі|активність|на пускових|рубіж)/)) {
          matchedLocations.push({ lat: GENERIC_SPAWN.AIRCRAFT.lat, lng: GENERIC_SPAWN.AIRCRAFT.lng, conf: 50 });
      } else if (type === 'CRUISE_MISSILE' && lowerText.match(/(морі|море|ракетонос)/)) {
          matchedLocations.push({ lat: GENERIC_SPAWN.BLACK_SEA.lat, lng: GENERIC_SPAWN.BLACK_SEA.lng, conf: 80 });
      } else if (type === 'DRONE') {
          if (lowerText.match(/(північ|курськ|брянськ|суми)/)) {
            matchedLocations.push({ lat: GENERIC_SPAWN.DRONE_NORTH.lat, lng: GENERIC_SPAWN.DRONE_NORTH.lng, conf: 50 });
          } else {
            matchedLocations.push({ lat: GENERIC_SPAWN.DRONE_SOUTH.lat, lng: GENERIC_SPAWN.DRONE_SOUTH.lng, conf: 50 });
          }
      } else if (type === 'MISSILE' || type === 'BALLISTIC_MISSILE' || type === 'CRUISE_MISSILE') {
          matchedLocations.push({ lat: GENERIC_SPAWN.MISSILE.lat, lng: GENERIC_SPAWN.MISSILE.lng, conf: 50 });
      } else {
          return []; 
      }
  }
  
  const jitter = () => (Math.random() - 0.5) * 0.4; 
  let direction = parseDirection(lowerText) ?? Math.floor(Math.random() * 360);

  return matchedLocations.map(loc => ({
      type: type!,
      lat: loc.lat + jitter(),
      lng: loc.lng + jitter(),
      confidence: loc.conf,
      direction
  }));
}
