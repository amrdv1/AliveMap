export interface ParsedThreat {
  type: 'DRONE' | 'MISSILE' | 'AIRCRAFT' | 'ALERT' | 'BALLISTIC_MISSILE' | 'CRUISE_MISSILE' | 'KAB' | 'SUMMARY' | 'INFO' | 'ZIRCON' | 'PPO' | 'FPV' | 'UNKNOWN' | 'RECON';
  lat: number | null;
  lng: number | null;
  confidence: number;
  direction?: number | null;
  quantity?: number;
  targetName?: string | null;
  targetLat?: number | null;
  targetLng?: number | null;
}

// ─── COMPREHENSIVE LOCATION DATABASE ────────────────────────────────────────

const CITY_COORDS: Record<string, {lat: number, lng: number}> = {
  // === Major Cities ===
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
  // === Medium Cities ===
  "крив": { lat: 47.9100, lng: 33.3918 },
  "кременчу": { lat: 49.0667, lng: 33.4167 },
  "павлоград": { lat: 48.5167, lng: 35.8667 },
  "шостк": { lat: 51.8667, lng: 33.4833 },
  "конотоп": { lat: 51.2333, lng: 33.2000 },
  "ніжин": { lat: 51.0333, lng: 31.8833 },
  "умань": { lat: 48.7500, lng: 30.2167 },
  "біл церк": { lat: 49.8000, lng: 30.1167 },
  "мелітопол": { lat: 46.8489, lng: 35.3653 },
  "бердянськ": { lat: 46.7584, lng: 36.7856 },
  "маріуполь": { lat: 47.0958, lng: 37.5536 },
  "краматорськ": { lat: 48.7205, lng: 37.5587 },
  "слов'янськ": { lat: 48.8507, lng: 37.6186 },
  "ізюм": { lat: 49.2105, lng: 37.2558 },
  "куп'янськ": { lat: 49.7144, lng: 37.6161 },
  "нікополь": { lat: 47.5688, lng: 34.3977 },
  "мирг": { lat: 49.9654, lng: 33.6050 },
  "старокост": { lat: 49.7547, lng: 27.2181 },
  "ізмаїл": { lat: 45.3400, lng: 28.8350 },
  "білгород-дн": { lat: 46.1958, lng: 30.3496 },
  "бровар": { lat: 50.5094, lng: 30.7942 },
  "борисп": { lat: 50.3522, lng: 30.9571 },
  "фастів": { lat: 50.0717, lng: 29.9179 },
  "обухів": { lat: 50.1009, lng: 30.6229 },
  "васильків": { lat: 50.1681, lng: 30.3230 },
  "вишгород": { lat: 50.5838, lng: 30.4887 },
  "буч": { lat: 50.5461, lng: 30.2283 },
  "ірпін": { lat: 50.5194, lng: 30.2505 },
  "троєщин": { lat: 50.5158, lng: 30.6167 },
  "оболон": { lat: 50.5028, lng: 30.4988 },
  "позняк": { lat: 50.3979, lng: 30.6328 },
  "березан": { lat: 50.3167, lng: 31.4833 },
  "барвінков": { lat: 48.9001, lng: 37.0196 },
  "краснопіл": { lat: 50.7627, lng: 35.6567 },
  "новомосков": { lat: 48.6333, lng: 35.2333 },
  "синельник": { lat: 48.3167, lng: 35.5167 },
  "первомай": { lat: 48.0500, lng: 30.8500 },
  "южноукраїн": { lat: 47.8167, lng: 31.1667 },
  "вознесен": { lat: 47.5551, lng: 31.3229 },
  "козятин": { lat: 49.7100, lng: 28.8400 },
  "шепетівк": { lat: 50.1800, lng: 27.0600 },
  "стрий": { lat: 49.2600, lng: 23.8500 },
  "дрогобич": { lat: 49.3500, lng: 23.5000 },
  "мукачев": { lat: 48.4400, lng: 22.7200 },
  // === Frontline / Eastern / Southern ===
  "лиман": { lat: 48.9861, lng: 37.8115 },
  "дробишев": { lat: 49.0308, lng: 37.7719 },
  "дробышев": { lat: 49.0308, lng: 37.7719 },
  "маяк": { lat: 48.9567, lng: 37.6253 },
  "святогірськ": { lat: 49.0333, lng: 37.5667 },
  "святогорск": { lat: 49.0333, lng: 37.5667 },
  "крестищ": { lat: 49.0067, lng: 37.5233 },
  "хрестищ": { lat: 49.0067, lng: 37.5233 },
  "курахов": { lat: 47.9867, lng: 37.2831 },
  "покровськ": { lat: 48.2820, lng: 37.1828 },
  "костянтинів": { lat: 48.5277, lng: 37.7069 },
  "дружків": { lat: 48.6214, lng: 37.5278 },
  "бахмут": { lat: 48.5987, lng: 37.9980 },
  "часівяр": { lat: 48.5861, lng: 37.8344 },
  "оріхів": { lat: 47.5667, lng: 35.7833 },
  "гуляйпол": { lat: 47.6667, lng: 36.2667 },
  "вовчанськ": { lat: 50.2833, lng: 36.9333 },
  "липц": { lat: 50.2167, lng: 36.4167 },
  // === Regions ===
  "київщин": { lat: 50.25, lng: 30.5 },
  "сумщин": { lat: 51.0, lng: 34.0 },
  "харківщин": { lat: 49.5, lng: 36.5 },
  "чернігівщин": { lat: 51.5, lng: 32.0 },
  "одещин": { lat: 47.0, lng: 30.0 },
  "миколаївщин": { lat: 47.5, lng: 32.0 },
  "херсонщин": { lat: 46.5, lng: 33.0 },
  "дніпропетровщин": { lat: 48.5, lng: 35.0 },
  "донеччин": { lat: 48.0, lng: 37.5 },
  "луганщин": { lat: 48.5, lng: 39.0 },
  "волин": { lat: 51.0, lng: 25.0 },
  "закарпат": { lat: 48.3, lng: 23.0 },
  "запоріжчин": { lat: 47.5, lng: 35.5 },
  "полтавщин": { lat: 49.5, lng: 34.5 },
  "черкащин": { lat: 49.3, lng: 32.0 },
  "кіровоградщин": { lat: 48.5, lng: 32.0 },
  "вінничин": { lat: 49.0, lng: 28.5 },
  "хмельниччин": { lat: 49.5, lng: 27.0 },
  "тернопільщин": { lat: 49.5, lng: 25.5 },
  "рівненщин": { lat: 51.0, lng: 26.0 },
  "львівщин": { lat: 49.8, lng: 24.0 },
  "івано-франківщин": { lat: 48.9, lng: 24.7 },
  "чернівеччин": { lat: 48.3, lng: 26.0 },
  "житомирщин": { lat: 50.5, lng: 28.5 },
  "східн": { lat: 48.5, lng: 38.0 },
  "південн": { lat: 47.0, lng: 33.0 },
  "північн": { lat: 51.5, lng: 33.0 },
};

const AIRBASE_COORDS: Record<string, {lat: number, lng: number}> = {
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
  "шаталов": { lat: 54.3400, lng: 32.4700 },
  "приморськ": { lat: 46.0465, lng: 38.1749 },
  "чауд": { lat: 45.0000, lng: 35.8333 },
  "єйськ": { lat: 46.6811, lng: 38.2062 },
  "курськ": { lat: 51.7373, lng: 36.1950 },
  "воронеж": { lat: 51.6608, lng: 39.2003 },
  "білгородс": { lat: 50.6, lng: 36.6 },
  "брянськ": { lat: 53.2435, lng: 34.3634 },
  "тамань": { lat: 45.2167, lng: 36.7167 },
  "кримськ": { lat: 44.9267, lng: 37.9883 },
  "джанкой": { lat: 45.7117, lng: 34.3928 },
  "керч": { lat: 45.3567, lng: 36.4750 },
  "севастопол": { lat: 44.6167, lng: 33.5254 },
  "каспій": { lat: 42.8833, lng: 47.6333 },
};

const GENERIC_SPAWN = {
  AIRCRAFT: { lat: 53.0, lng: 39.0 },
  DRONE_SOUTH: { lat: 45.5, lng: 36.5 },
  DRONE_NORTH: { lat: 52.0, lng: 33.0 },
  MISSILE: { lat: 46.0, lng: 37.0 },
  BLACK_SEA: { lat: 44.0, lng: 31.0 },
  CASPIAN_SEA: { lat: 42.5, lng: 50.0 },
};

// ─── DIRECTION PARSING ──────────────────────────────────────────────────────

function parseDirection(text: string): number | null {
  if (text.match(/(пн[\.\-]?сх|північно[\s-]?схід|на\s+пн[\.\-]?сх)/i)) return 45;
  if (text.match(/(пд[\.\-]?сх|південно[\s-]?схід|на\s+пд[\.\-]?сх)/i)) return 135;
  if (text.match(/(пд[\.\-]?зх|південно[\s-]?захід|на\s+пд[\.\-]?зх)/i)) return 225;
  if (text.match(/(пн[\.\-]?зх|північно[\s-]?захід|на\s+пн[\.\-]?зх)/i)) return 315;
  if (text.match(/(північ|на\s+пн\b|на\s+північ)/i)) return 0;
  if (text.match(/(схід|на\s+сх\b|на\s+схід)/i)) return 90;
  if (text.match(/(південь|на\s+пд\b|на\s+південь)/i)) return 180;
  if (text.match(/(захід|на\s+зх\b|на\s+захід)/i)) return 270;
  return null;
}

// ─── QUANTITY PARSING ───────────────────────────────────────────────────────

function parseQuantity(text: string): number {
  const numMatch = text.match(/(\d{1,3})\s*[xхXХ]?\s*(?:шахед|бпла|дрон|ракет|ціл|одиниц|штук|шт|мопед|безпілотник|геран|балістик|калібр|крилат|снаряд)/i);
  if (numMatch) return Math.min(parseInt(numMatch[1], 10), 30);
  const reverseMatch = text.match(/(?:ракет|бпла|шахед|калібр|дрон)[^\d]{0,15}(\d{1,3})/i);
  if (reverseMatch) return Math.min(parseInt(reverseMatch[1], 10), 30);
  if (text.match(/\bпар[аи]\b/i)) return 2;
  if (text.match(/\b(кільк|декільк)\b/i)) return 3;
  if (text.match(/\b(груп[аи]|зграя)\b/i)) return 5;
  if (text.match(/\b(масован|масштабн)\b/i)) return 8;
  return 1;
}

// ─── TARGET PARSING ─────────────────────────────────────────────────────────

function parseTarget(text: string): { targetName: string | null, targetLat: number | null, targetLng: number | null } {
  const patterns = [
    /(?:курс(?:ом)?|вектор|напрямок|напрямку|ціль|у бік|в бік|у напрямку)\s*[\-—:]?\s*(?:на\s+)?([а-яіїєґ'А-ЯІЇЄҐ\s\-]+)/gi,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match && match[1]) {
      const target = match[1].trim().toLowerCase().replace(/[\.\!\?\,]+$/, '');
      for (const [cityKey, coords] of Object.entries(CITY_COORDS)) {
        if (target.includes(cityKey) || cityKey.includes(target.substring(0, Math.min(target.length, 5)))) {
          return { targetName: target, targetLat: coords.lat, targetLng: coords.lng };
        }
      }
    }
  }
  return { targetName: null, targetLat: null, targetLng: null };
}

// ─── THREAT TYPE DETECTION ──────────────────────────────────────────────────

function detectThreatType(text: string): ParsedThreat['type'] | null {
  const t = text.toLowerCase();
  if (t.match(/(збит[оіа]|знищен[оіа]|перехоплен[оіа]|мінус|відбит[оіа]|ліквідован[оіа]|ппо\s*спрацюва|зенітн|вибух|влучанн|приліт|попав)/)) {
    if (!t.match(/(за добу|за ніч|за тиждень|підсумки|загалом|втрати)/)) return 'PPO';
  }
  if (t.match(/(циркон|3м22)/)) return 'ZIRCON';
  if (t.match(/(fpv|фпв|ланцет|молнія|зала|zala|суперкам|supercam)/)) return 'FPV';
  if (t.match(/(шахед|шахід|shahed|бпла|мопед|безпілотник|геран|гербер|дрон|ударний\s*безпілотн)/)) return 'DRONE';
  if (t.match(/(балістик|кинджал|іскандер|с-300|с-400|кн-23|кн-24|точка-у)/)) return 'BALLISTIC_MISSILE';
  if (t.match(/(х-101|х-555|х-55|х-59|х-69|х-35|калібр|кх-|3м14|крилат[аіи]\s*ракет|ракетоносц|ракетонос)/)) return 'CRUISE_MISSILE';
  if (t.match(/(ракет[аиоу]|пуск\s*ракет|ракетн)/)) {
    if (t.match(/(повітрі|летить|рух|курс|напрямок)/)) return 'CRUISE_MISSILE';
    return 'MISSILE';
  }
  if (t.match(/(ту-95|ту-160|ту-22|ту22|міг-31|міг31|авіаці|су-34|су-35|су-27|су-24|су-25|бортів|стратегічн|тактичн\s*авіаці|бомбардувальник|винищувач)/)) return 'AIRCRAFT';
  if (t.match(/(каб|фаб|уаб|авіабомб|кероване?\s*бомб|планер|бомб)/)) return 'KAB';
  if (t.match(/розвід/)) return 'RECON';
  if (t.match(/(ціль|загроз)/)) return 'UNKNOWN';
  
  return null;
}

// ─── MAIN PARSER ────────────────────────────────────────────────────────────

export function parseTelegramText(text: string): ParsedThreat[] {
  const lowerText = text.toLowerCase();

  // Filter out summaries / statistics
  if (lowerText.match(/(за добу|за ніч|за тиждень|підсумки|статистика|загинул[оіа]|постраждал|загалом\s+за|втрати\s+рф|зведення\s+за|наслідки)/)) {
    return [{ type: 'SUMMARY', lat: null, lng: null, confidence: 100, direction: null }];
  }

  // Filter out "all clear"
  if (lowerText.match(/(відбій|чисто\s+по|наразі\s+чисто|немає\s+загроз|спокійно|не\s+зафіксован|загроз\s+немає|поки\s+чисто)/)) {
    return [{ type: 'INFO', lat: null, lng: null, confidence: 100, direction: null }];
  }

  const type = detectThreatType(text);
  if (!type) return [];

  const hasAction = lowerText.match(/(летить|летят|рух|зліт|пуск|запуск|напрямок|курс|фіксує|повітрі|пускові|вибух|атак|йде|небезпека|відмічено|збито|знищено|мінус|перехоплено|відбито|тривога|загроза|увага|старт|виявлен|входить|маршрут|виліт|наближ|обережно|слідкуйте|попереджен|ціль|fpv|фпв|шахед|бпла|дрон|мопед|ракет|каб|фаб|бомб|балістик|циркон|іскандер|кинджал)/);
  if (!hasAction && type !== 'PPO') {
    return [{ type: 'INFO', lat: null, lng: null, confidence: 100, direction: null }];
  }

  // ── LINE-BY-LINE PARSING for multi-region messages ──
  const lines = text.split('\n').filter(l => l.trim().length > 2);
  const results: ParsedThreat[] = [];
  let currentRegionLat: number | null = null;
  let currentRegionLng: number | null = null;

  for (const line of lines) {
    const lineLower = line.toLowerCase().trim();
    
    // Region header: "Київщина:" or "Харківська область:"
    const regionHeaderMatch = lineLower.match(/^([а-яіїєґ'\s\-]+)\s*:/);
    if (regionHeaderMatch) {
      const regionText = regionHeaderMatch[1].trim();
      for (const [key, coords] of Object.entries(CITY_COORDS)) {
        if (regionText.includes(key)) {
          currentRegionLat = coords.lat;
          currentRegionLng = coords.lng;
          break;
        }
      }
    }

    const lineType = detectThreatType(line) || type;
    const lineQty = parseQuantity(lineLower);
    const lineDir = parseDirection(lineLower);
    const lineTarget = parseTarget(lineLower);

    let lineLat: number | null = null;
    let lineLng: number | null = null;
    let lineConf = 80;

    for (const [base, coords] of Object.entries(AIRBASE_COORDS)) {
      if (lineLower.includes(base)) {
        lineLat = coords.lat;
        lineLng = coords.lng;
        lineConf = 90;
        break;
      }
    }
    
    if (lineLat === null && lineType !== 'AIRCRAFT') {
      for (const [cityKey, coords] of Object.entries(CITY_COORDS)) {
        if (lineLower.includes(cityKey)) {
          // Do not use the city as current location if it was explicitly parsed as the target destination!
          if (lineTarget.targetName && lineTarget.targetName.includes(cityKey)) {
            continue;
          }
          lineLat = coords.lat;
          lineLng = coords.lng;
          lineConf = 80;
          break;
        }
      }
    }

    if (lineLat === null && currentRegionLat !== null) {
      lineLat = currentRegionLat;
      lineLng = currentRegionLng;
      lineConf = 60;
    }

    if (lineLat !== null && lineLng !== null) {
      const hasLineMention = lineLower.match(/(бпла|шахед|ракет|балістик|калібр|дрон|крилат|каб|фаб|бомб|авіабомб|х-101|х-55|циркон|курс|напрямок|збито|мінус|летить|рух|пуск|ціль|fpv|фпв)/);
      if (hasLineMention) {
        results.push({
          type: lineType,
          lat: lineLat + jitter(),
          lng: lineLng! + jitter(),
          confidence: lineConf,
          direction: lineDir ?? Math.floor(Math.random() * 360),
          quantity: lineQty,
          targetName: lineTarget.targetName,
          targetLat: lineTarget.targetLat,
          targetLng: lineTarget.targetLng,
        });
      }
    }
  }

  if (results.length > 0) return results;

  // ── FALLBACK: whole message as single threat ──
  const quantity = parseQuantity(lowerText);
  const direction = parseDirection(lowerText) ?? Math.floor(Math.random() * 360);
  const { targetName, targetLat, targetLng } = parseTarget(lowerText);

  const matchedLocations: {lat: number, lng: number, conf: number}[] = [];
  
  for (const [base, coords] of Object.entries(AIRBASE_COORDS)) {
    if (lowerText.includes(base)) {
      matchedLocations.push({ lat: coords.lat, lng: coords.lng, conf: 90 });
    }
  }

  if (matchedLocations.length === 0 && type !== 'AIRCRAFT') {
    for (const [cityKey, coords] of Object.entries(CITY_COORDS)) {
      if (lowerText.includes(cityKey)) {
        matchedLocations.push({ lat: coords.lat, lng: coords.lng, conf: 80 });
        break;
      }
    }
  }

  if (matchedLocations.length === 0) {
    if (type === 'AIRCRAFT') {
      matchedLocations.push({ ...GENERIC_SPAWN.AIRCRAFT, conf: 50 });
    } else if (type === 'CRUISE_MISSILE' && lowerText.match(/(морі|море|ракетонос|каспій|чорн)/)) {
      if (lowerText.match(/каспій/)) matchedLocations.push({ ...GENERIC_SPAWN.CASPIAN_SEA, conf: 70 });
      else matchedLocations.push({ ...GENERIC_SPAWN.BLACK_SEA, conf: 80 });
    } else if (type === 'DRONE') {
      if (lowerText.match(/(північ|курськ|брянськ|сум|чернігів)/)) matchedLocations.push({ ...GENERIC_SPAWN.DRONE_NORTH, conf: 50 });
      else matchedLocations.push({ ...GENERIC_SPAWN.DRONE_SOUTH, conf: 50 });
    } else if (type === 'MISSILE' || type === 'BALLISTIC_MISSILE' || type === 'CRUISE_MISSILE' || type === 'ZIRCON') {
      matchedLocations.push({ ...GENERIC_SPAWN.MISSILE, conf: 50 });
    } else if (type === 'PPO') {
      return [{ type: 'PPO', lat: null, lng: null, confidence: 100, direction: null }];
    } else {
      return [{ type: type, lat: null, lng: null, confidence: 50, direction: direction }];
    }
  }

  return matchedLocations.map(loc => ({
    type: type!,
    lat: loc.lat + jitter(),
    lng: loc.lng + jitter(),
    confidence: loc.conf,
    direction,
    quantity,
    targetName,
    targetLat,
    targetLng,
  }));
}

function jitter(): number {
  return (Math.random() - 0.5) * 0.3;
}
