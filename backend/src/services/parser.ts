export interface ParsedThreat {
  type: 'DRONE' | 'MISSILE' | 'AIRCRAFT' | 'ALERT' | 'BALLISTIC_MISSILE' | 'CRUISE_MISSILE' | 'KAB' | 'SUMMARY' | 'INFO' | 'ZIRCON' | 'KH101' | 'ISKANDER' | 'KINZHAL' | 'KALIBR' | 'PPO' | 'FPV' | 'UNKNOWN' | 'RECON';
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

export const CITY_COORDS: Record<string, {lat: number, lng: number}> = {
  // ═══ ОБЛАСНІ ЦЕНТРИ ═══
  "київ": { lat: 50.4501, lng: 30.5234 },
  "львів": { lat: 49.8397, lng: 24.0297 },
  "одес": { lat: 46.4825, lng: 30.7233 },
  "харків": { lat: 50.0000, lng: 36.2304 },
  "дніпр": { lat: 48.4647, lng: 35.0462 },
  "миколаїв": { lat: 46.9750, lng: 31.9946 },
  "запоріжж": { lat: 47.8388, lng: 35.1396 },
  "балабин": { lat: 47.747, lng: 35.215 },
  "балабине": { lat: 47.747, lng: 35.215 },
  "херсон": { lat: 46.6354, lng: 32.6169 },
  "черніг": { lat: 51.4982, lng: 31.2893 },
  "сум": { lat: 50.9077, lng: 34.7981 },
  "полтав": { lat: 49.5883, lng: 34.5514 },
  "черкас": { lat: 49.4444, lng: 32.0598 },
  "вінниц": { lat: 49.2331, lng: 28.4682 },
  "житомир": { lat: 50.5547, lng: 28.6587 },
  "рівн": { lat: 50.6199, lng: 26.2516 },
  "кропивницьк": { lat: 48.5079, lng: 32.2623 },
  "хмельницьк": { lat: 49.4230, lng: 26.9871 },
  "чернівц": { lat: 48.2915, lng: 25.9352 },
  "франківськ": { lat: 48.9226, lng: 24.7111 },
  "тернопіль": { lat: 49.5535, lng: 25.5948 },
  "луцьк": { lat: 50.7472, lng: 25.3254 },
  "ужгород": { lat: 48.6208, lng: 22.2879 },

  // ═══ ВЕЛИКІ МІСТА (100К+) ═══
  "крив": { lat: 47.9100, lng: 33.3918 },
  "кременчу": { lat: 49.0667, lng: 33.4167 },
  "біл церк": { lat: 49.8000, lng: 30.1167 },
  "маріуполь": { lat: 47.0958, lng: 37.5536 },
  "краматорськ": { lat: 48.7205, lng: 37.5587 },
  "мелітопол": { lat: 46.8489, lng: 35.3653 },
  "бердянськ": { lat: 46.7584, lng: 36.7856 },
  "нікополь": { lat: 47.5688, lng: 34.3977 },
  "павлоград": { lat: 48.5167, lng: 35.8667 },
  "камянськ": { lat: 48.6833, lng: 34.6167 },
  "олександрі": { lat: 48.6667, lng: 33.1167 },
  "галицинове": { lat: 46.8208, lng: 31.9767 },
  "крим": { lat: 45.2, lng: 34.3 },

  // ═══ КИЇВСЬКА ОБЛАСТЬ ═══
  "бровар": { lat: 50.5094, lng: 30.7942 },
  "борисп": { lat: 50.3522, lng: 30.9571 },
  "фастів": { lat: 50.0717, lng: 29.9179 },
  "обухів": { lat: 50.1009, lng: 30.6229 },
  "васильків": { lat: 50.1681, lng: 30.3230 },
  "вишгород": { lat: 50.5838, lng: 30.4887 },
  "буч": { lat: 50.5461, lng: 30.5283 },
  "ірпін": { lat: 50.5194, lng: 30.5505 },
  "троєщин": { lat: 50.5158, lng: 30.6167 },
  "оболон": { lat: 50.5028, lng: 30.4988 },
  "позняк": { lat: 50.3979, lng: 30.6328 },
  "березан": { lat: 50.3167, lng: 31.4833 },
  "яготин": { lat: 50.5667, lng: 31.7667 },
  "переяслав": { lat: 50.0667, lng: 31.4500 },
  "кагарлик": { lat: 49.8500, lng: 30.8333 },
  "тарас": { lat: 50.4900, lng: 30.3600 },
  "гостомел": { lat: 50.5653, lng: 30.5542 },
  "боярк": { lat: 50.3242, lng: 30.5867 },
  "вишнев": { lat: 50.3862, lng: 30.3675 },
  "ворзел": { lat: 50.5553, lng: 30.5433 },
  "макарів": { lat: 50.4628, lng: 29.8092 },
  "славутич": { lat: 51.5167, lng: 30.7500 },

  // ═══ СУМСЬКА ОБЛАСТЬ ═══
  "шостк": { lat: 51.8667, lng: 33.4833 },
  "конотоп": { lat: 51.2333, lng: 33.2000 },
  "ромн": { lat: 50.7500, lng: 33.4833 },
  "лебедин": { lat: 50.5833, lng: 34.4833 },
  "ахтирк": { lat: 50.3000, lng: 34.9000 },
  "глухів": { lat: 51.6833, lng: 33.9167 },
  "тростянець": { lat: 50.4833, lng: 34.9667 },
  "кролевець": { lat: 51.5500, lng: 33.3833 },
  "путивль": { lat: 51.3333, lng: 33.8667 },
  "білопіл": { lat: 51.1500, lng: 34.3167 },
  "буринь": { lat: 51.2000, lng: 34.0167 },
  "середин": { lat: 51.3500, lng: 33.4333 },
  "юнаків": { lat: 50.3167, lng: 35.2500 },
  "краснопіл": { lat: 50.7627, lng: 35.6567 },
  "свес": { lat: 51.5667, lng: 33.5167 },
  "велик писарів": { lat: 50.5333, lng: 35.6500 },
  "хотін": { lat: 51.2500, lng: 33.4167 },

  // ═══ ХАРКІВСЬКА ОБЛАСТЬ ═══
  "чугуїв": { lat: 49.8333, lng: 36.6833 },
  "ізюм": { lat: 49.2105, lng: 37.2558 },
  "куп'янськ": { lat: 49.7144, lng: 37.6161 },
  "лозов": { lat: 48.8833, lng: 36.3167 },
  "первомайськ": { lat: 48.6333, lng: 36.2333 },
  "барвінков": { lat: 48.9001, lng: 37.0196 },
  "балакл": { lat: 49.4667, lng: 36.6333 },
  "вовчанськ": { lat: 50.5833, lng: 36.9333 },
  "дергач": { lat: 50.1000, lng: 36.1167 },
  "мерефа": { lat: 49.8167, lng: 36.0500 },
  "шевченков": { lat: 49.7000, lng: 37.0833 },
  "зміїв": { lat: 49.6833, lng: 36.3500 },
  "красноград": { lat: 49.3667, lng: 35.4333 },
  "богодухів": { lat: 50.1667, lng: 35.5167 },
  "валки": { lat: 49.8333, lng: 35.8000 },
  "золочів": { lat: 50.5833, lng: 35.9667 },
  "нов водолаг": { lat: 49.7167, lng: 35.8833 },
  "липц": { lat: 50.5167, lng: 36.4167 },
  "двурічн": { lat: 49.7333, lng: 37.6833 },
  "борова": { lat: 49.4167, lng: 37.0500 },
  "мал данилів": { lat: 50.0667, lng: 36.4000 },
  "печеніг": { lat: 49.9000, lng: 36.9333 },
  "есхар": { lat: 49.8500, lng: 36.6333 },

  // ═══ ЧЕРНІГІВСЬКА ОБЛАСТЬ ═══
  "ніжин": { lat: 51.0333, lng: 31.8833 },
  "прилук": { lat: 50.5833, lng: 32.3833 },
  "бахмач": { lat: 51.1833, lng: 32.8167 },
  "борзна": { lat: 51.2500, lng: 32.4167 },
  "городн": { lat: 51.9833, lng: 31.6167 },
  "новгород-сів": { lat: 52.0000, lng: 33.2667 },
  "щорс": { lat: 51.8167, lng: 31.9500 },
  "корюківк": { lat: 51.7667, lng: 32.2500 },
  "мена": { lat: 51.5167, lng: 32.2000 },
  "семенівк": { lat: 52.0667, lng: 32.5833 },
  "сосниц": { lat: 51.5500, lng: 32.5333 },

  // ═══ ПОЛТАВСЬКА ОБЛАСТЬ ═══
  "лубн": { lat: 50.0167, lng: 32.9833 },
  "гадяч": { lat: 50.3833, lng: 34.0000 },
  "мирг": { lat: 49.9654, lng: 33.6050 },
  "горішн": { lat: 49.0000, lng: 33.4500 },
  "котельв": { lat: 50.0667, lng: 35.0500 },
  "хорол": { lat: 49.7833, lng: 33.2667 },
  "пирятин": { lat: 50.5333, lng: 32.5167 },
  "карлівк": { lat: 49.4500, lng: 35.1333 },
  "гребінк": { lat: 50.1167, lng: 31.9000 },
  "глобин": { lat: 49.4000, lng: 33.2833 },
  "козельщин": { lat: 49.2333, lng: 34.0667 },
  "зіньків": { lat: 50.5000, lng: 34.3667 },

  // ═══ ДНІПРОПЕТРОВСЬКА ОБЛАСТЬ ═══
  "новомосков": { lat: 48.6333, lng: 35.2333 },
  "синельник": { lat: 48.3167, lng: 35.5167 },
  "жовт вод": { lat: 48.3500, lng: 33.5000 },
  "п'ятихатк": { lat: 48.4167, lng: 33.7000 },
  "верхньодніпр": { lat: 48.6667, lng: 34.3167 },
  "марганець": { lat: 47.6333, lng: 34.6167 },
  "покров": { lat: 47.6500, lng: 34.1500 },
  "апостолов": { lat: 47.6500, lng: 33.7167 },
  "перещепин": { lat: 48.7833, lng: 35.3833 },
  "царичанк": { lat: 48.8333, lng: 35.2000 },
  "підгородн": { lat: 48.5667, lng: 35.0500 },
  "магдалинівк": { lat: 48.9500, lng: 34.9000 },

  // ═══ ЗАПОРІЗЬКА ОБЛАСТЬ ═══
  "оріхів": { lat: 47.5667, lng: 35.7833 },
  "гуляйпол": { lat: 47.6667, lng: 36.2667 },
  "токмак": { lat: 47.2500, lng: 35.7167 },
  "пологи": { lat: 47.4833, lng: 36.2500 },
  "василівк": { lat: 47.4333, lng: 35.2500 },
  "вільнянськ": { lat: 47.9333, lng: 35.4167 },
  "енергодар": { lat: 47.5000, lng: 34.6500 },
  "камянк-дніпр": { lat: 47.4833, lng: 34.4167 },
  "приморськ-з": { lat: 46.7333, lng: 36.3500 },
  "більмак": { lat: 47.4667, lng: 36.5333 },
  "михайлівк": { lat: 47.1833, lng: 35.2167 },

  // ═══ ОДЕСЬКА ОБЛАСТЬ ═══
  "ізмаїл": { lat: 45.3400, lng: 28.8350 },
  "білгород-дн": { lat: 46.1958, lng: 30.3496 },
  "южн": { lat: 46.6236, lng: 31.0810 },
  "чорноморськ": { lat: 46.3100, lng: 30.6550 },
  "подільськ": { lat: 47.7500, lng: 29.5333 },
  "балт": { lat: 47.9333, lng: 29.6167 },
  "рені": { lat: 45.4533, lng: 28.2750 },
  "кілі": { lat: 45.4467, lng: 29.2617 },
  "арциз": { lat: 45.9917, lng: 29.4350 },
  "болград": { lat: 45.6800, lng: 28.6117 },
  "роздільн": { lat: 46.8500, lng: 30.0667 },
  "біляївк": { lat: 46.5167, lng: 30.3167 },
  "заток": { lat: 46.0617, lng: 30.4517 },
  "сергіївк": { lat: 46.0333, lng: 30.6000 },

  // ═══ МИКОЛАЇВСЬКА ОБЛАСТЬ ═══
  "первомай": { lat: 48.0500, lng: 30.8500 },
  "южноукраїн": { lat: 47.8167, lng: 31.1667 },
  "вознесен": { lat: 47.5551, lng: 31.3229 },
  "нов одес": { lat: 47.3000, lng: 31.7667 },
  "очаків": { lat: 46.6150, lng: 31.5450 },
  "баштанк": { lat: 47.4000, lng: 32.4333 },
  "снігурівк": { lat: 46.7667, lng: 32.8000 },
  "нов буг": { lat: 47.6833, lng: 32.5167 },

  // ═══ ХЕРСОНСЬКА ОБЛАСТЬ ═══
  "нов кахов": { lat: 46.7567, lng: 33.3500 },
  "генічеськ": { lat: 46.1750, lng: 34.7983 },
  "каховк": { lat: 46.8153, lng: 33.4792 },
  "бериславль": { lat: 46.8500, lng: 33.4167 },
  "скадовськ": { lat: 46.1067, lng: 32.9106 },
  "олешк": { lat: 46.6167, lng: 32.7667 },
  "таврійськ": { lat: 46.7500, lng: 33.4167 },
  "чорнобаївк": { lat: 46.7500, lng: 32.6333 },

  // ═══ ДОНЕЦЬКА ОБЛАСТЬ ═══
  "слов'янськ": { lat: 48.8507, lng: 37.6186 },
  "покровськ": { lat: 48.2820, lng: 37.1828 },
  "костянтинів": { lat: 48.5277, lng: 37.7069 },
  "дружків": { lat: 48.6214, lng: 37.5278 },
  "бахмут": { lat: 48.5987, lng: 37.9980 },
  "часівяр": { lat: 48.5861, lng: 37.8344 },
  "курахов": { lat: 47.9867, lng: 37.2831 },
  "лиман": { lat: 48.9861, lng: 37.8115 },
  "красногорівк": { lat: 48.1333, lng: 37.5167 },
  "авдіїв": { lat: 48.1333, lng: 37.7500 },
  "торецьк": { lat: 48.3833, lng: 37.8500 },
  "мирноград": { lat: 48.2833, lng: 37.2500 },
  "добропіл": { lat: 48.4500, lng: 37.0833 },
  "селидов": { lat: 48.1500, lng: 37.3000 },
  "вугледар": { lat: 47.7833, lng: 37.2333 },
  "волноваха": { lat: 47.6000, lng: 37.4833 },
  "велик новосілк": { lat: 47.8500, lng: 37.0333 },
  "святогірськ": { lat: 49.0333, lng: 37.5667 },
  "святогорск": { lat: 49.0333, lng: 37.5667 },
  "дробишев": { lat: 49.0308, lng: 37.7719 },
  "дробышев": { lat: 49.0308, lng: 37.7719 },
  "маяк": { lat: 48.9567, lng: 37.6253 },
  "крестищ": { lat: 49.0067, lng: 37.5233 },
  "хрестищ": { lat: 49.0067, lng: 37.5233 },

  // ═══ ЧЕРКАСЬКА ОБЛАСТЬ ═══
  "умань": { lat: 48.7500, lng: 30.5167 },
  "сміл": { lat: 49.2167, lng: 31.8667 },
  "золотонош": { lat: 49.6667, lng: 32.0333 },
  "канів": { lat: 49.7500, lng: 31.4667 },
  "шпол": { lat: 49.0000, lng: 31.4000 },
  "звенигородк": { lat: 49.0833, lng: 30.9667 },
  "ватутін": { lat: 49.0167, lng: 32.0833 },
  "тальн": { lat: 48.8833, lng: 30.6833 },

  // ═══ ВІННИЦЬКА ОБЛАСТЬ ═══
  "козятин": { lat: 49.7100, lng: 28.8400 },
  "ладижин": { lat: 48.6833, lng: 29.2333 },
  "жмеринк": { lat: 49.0333, lng: 28.1167 },
  "могилів-под": { lat: 48.4500, lng: 27.8000 },
  "калинівк": { lat: 49.4500, lng: 28.5333 },
  "гнівань": { lat: 49.0833, lng: 28.3500 },
  "хмільник": { lat: 49.5667, lng: 27.9500 },
  "бар": { lat: 49.0833, lng: 27.6833 },
  "тульчин": { lat: 48.6667, lng: 28.8500 },
  "гайсин": { lat: 48.8167, lng: 29.3833 },
  "немирів": { lat: 48.9833, lng: 28.8333 },

  // ═══ ЖИТОМИРСЬКА ОБЛАСТЬ ═══
  "бердичів": { lat: 49.8833, lng: 28.5833 },
  "коростен": { lat: 50.9500, lng: 28.6500 },
  "новоград-вол": { lat: 50.5833, lng: 27.6167 },
  "малин": { lat: 50.7667, lng: 29.2500 },
  "коростишів": { lat: 50.3167, lng: 29.0500 },
  "овруч": { lat: 51.3167, lng: 28.8000 },
  "радомишль": { lat: 50.4833, lng: 29.2167 },

  // ═══ ХМЕЛЬНИЦЬКА ОБЛАСТЬ ═══
  "старокост": { lat: 49.7547, lng: 27.2181 },
  "шепетівк": { lat: 50.1800, lng: 27.0600 },
  "кам'янець-под": { lat: 48.6833, lng: 26.5833 },
  "красилів": { lat: 49.6500, lng: 26.9667 },
  "славут": { lat: 50.3000, lng: 26.8667 },
  "нетішин": { lat: 50.3500, lng: 26.6333 },
  "полонн": { lat: 50.1167, lng: 27.5167 },
  "деражн": { lat: 49.2667, lng: 27.4333 },

  // ═══ РІВНЕНСЬКА ОБЛАСТЬ ═══
  "сарн": { lat: 51.3333, lng: 26.6167 },
  "дубн": { lat: 50.4167, lng: 25.7500 },
  "острог": { lat: 50.3333, lng: 26.5167 },
  "костопіль": { lat: 50.8833, lng: 26.4500 },
  "здолбунів": { lat: 50.5167, lng: 26.2500 },
  "березн": { lat: 50.9667, lng: 26.8000 },
  "корець": { lat: 50.6167, lng: 27.1500 },
  "рокитн": { lat: 51.0167, lng: 26.1500 },
  "вараш": { lat: 51.3500, lng: 25.8500 },

  // ═══ ВОЛИНСЬКА ОБЛАСТЬ ═══
  "нововолинськ": { lat: 50.7167, lng: 24.1667 },
  "ковел": { lat: 51.2167, lng: 24.7167 },
  "володимир": { lat: 50.8500, lng: 24.3167 },
  "камінь-кашір": { lat: 51.6167, lng: 24.9667 },
  "ківерц": { lat: 50.8333, lng: 25.4667 },

  // ═══ ЛЬВІВСЬКА ОБЛАСТЬ ═══
  "стрий": { lat: 49.2600, lng: 23.8500 },
  "дрогобич": { lat: 49.3500, lng: 23.5000 },
  "червоноград": { lat: 50.3833, lng: 24.2333 },
  "борислав": { lat: 49.2833, lng: 23.4333 },
  "самбір": { lat: 49.5167, lng: 23.2000 },
  "трускавець": { lat: 49.2833, lng: 23.5000 },
  "яворів": { lat: 49.9333, lng: 23.4000 },
  "золочів-л": { lat: 49.8000, lng: 24.9000 },
  "буськ": { lat: 49.9667, lng: 24.6167 },
  "жовкв": { lat: 50.0667, lng: 23.9667 },
  "новояворів": { lat: 49.9333, lng: 23.5833 },
  "городок": { lat: 49.7833, lng: 23.6500 },

  // ═══ ІВАНО-ФРАНКІВСЬКА ОБЛАСТЬ ═══
  "калуш": { lat: 49.0167, lng: 24.3667 },
  "коломи": { lat: 48.5333, lng: 25.0333 },
  "долин": { lat: 48.9667, lng: 24.0167 },
  "надвірн": { lat: 48.6333, lng: 24.5833 },
  "яремче": { lat: 48.4500, lng: 24.5667 },
  "рогатин": { lat: 49.4000, lng: 24.6000 },
  "тисмениц": { lat: 48.9000, lng: 24.8500 },

  // ═══ ТЕРНОПІЛЬСЬКА ОБЛАСТЬ ═══
  "чортків": { lat: 48.9000, lng: 25.7833 },
  "бережан": { lat: 49.4500, lng: 24.9333 },
  "борщів": { lat: 48.8000, lng: 26.0500 },
  "збараж": { lat: 49.6667, lng: 25.7667 },
  "кременець": { lat: 50.1000, lng: 25.7167 },
  "теребовл": { lat: 49.3000, lng: 25.7000 },
  "підволочиськ": { lat: 49.5333, lng: 26.1500 },

  // ═══ ЧЕРНІВЕЦЬКА ОБЛАСТЬ ═══
  "новодністровськ": { lat: 48.5833, lng: 27.5500 },
  "хотин-ч": { lat: 48.5000, lng: 26.5000 },
  "сторожинець": { lat: 48.1667, lng: 25.7167 },
  "кіцман": { lat: 48.4000, lng: 25.7000 },
  "вижниц": { lat: 48.2500, lng: 25.2167 },
  "герц": { lat: 48.1500, lng: 26.2333 },

  // ═══ ЗАКАРПАТСЬКА ОБЛАСТЬ ═══
  "мукачев": { lat: 48.4400, lng: 22.7200 },
  "хуст": { lat: 48.1833, lng: 23.3000 },
  "берегов": { lat: 48.2000, lng: 22.6333 },
  "виноградів": { lat: 48.1500, lng: 23.0333 },
  "рахів": { lat: 48.0500, lng: 24.2000 },
  "свалява": { lat: 48.5500, lng: 22.9833 },
  "тячів": { lat: 48.0167, lng: 23.5667 },
  "перечин": { lat: 48.7333, lng: 22.4833 },
  "іршав": { lat: 48.3333, lng: 23.0500 },

  // ═══ КІРОВОГРАДСЬКА ОБЛАСТЬ ═══
  "знам'янк": { lat: 48.7167, lng: 32.6667 },
  "світловодськ": { lat: 49.0500, lng: 33.2333 },
  "мал виск": { lat: 48.6333, lng: 31.6500 },
  "помічн": { lat: 48.2333, lng: 31.4167 },
  "новоукраїнк": { lat: 48.3333, lng: 31.5167 },
  "долинськ": { lat: 48.3667, lng: 32.5167 },
  "гайворон": { lat: 48.3333, lng: 29.8667 },
  "бобринець": { lat: 48.0667, lng: 32.1500 },

  // ═══ СТРАТЕГІЧНІ / ПРИФРОНТОВІ ═══
  "стариц": { lat: 49.3500, lng: 37.5000 },
  "cватов": { lat: 49.4167, lng: 38.1500 },
  "сватов": { lat: 49.4167, lng: 38.1500 },
  "кремінн": { lat: 49.0500, lng: 38.2167 },
  "сіверськ": { lat: 48.8667, lng: 38.0833 },
  "робот": { lat: 47.3667, lng: 35.8500 },
  "роботин": { lat: 47.3667, lng: 35.8500 },
  "вербов": { lat: 47.3833, lng: 35.8833 },
  "запорізьк напрям": { lat: 47.5000, lng: 35.8000 },
  "cєвєродонецьк": { lat: 48.9500, lng: 38.5000 },
  "сєвєродонецьк": { lat: 48.9500, lng: 38.5000 },
  "лисичанськ": { lat: 48.9167, lng: 38.4333 },
  "попасн": { lat: 48.6333, lng: 38.3833 },
  "рубіжн": { lat: 49.0167, lng: 38.3833 },

  // ═══ РЕГІОНИ / ОБЛАСТІ ═══
  "київщин": { lat: 50.55, lng: 30.5 },
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
  "запорізьк": { lat: 47.5, lng: 35.5 },
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
  "київська обл": { lat: 50.55, lng: 30.5 },
  "сумська обл": { lat: 51.0, lng: 34.0 },
  "харківська обл": { lat: 49.5, lng: 36.5 },
  "чернігівська обл": { lat: 51.5, lng: 32.0 },
  "одеська обл": { lat: 47.0, lng: 30.0 },
  "миколаївська обл": { lat: 47.5, lng: 32.0 },
  "херсонська обл": { lat: 46.5, lng: 33.0 },
  "дніпропетровська обл": { lat: 48.5, lng: 35.0 },
  "донецька обл": { lat: 48.0, lng: 37.5 },
  "запорізька обл": { lat: 47.5, lng: 35.5 },
  "полтавська обл": { lat: 49.5, lng: 34.5 },
  "черкаська обл": { lat: 49.3, lng: 32.0 },
  "вінницька обл": { lat: 49.0, lng: 28.5 },
  "житомирська обл": { lat: 50.5, lng: 28.5 },
};

export const AIRBASE_COORDS: Record<string, {lat: number, lng: number}> = {
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

export const GENERIC_SPAWN = {
  AIRCRAFT: { lat: 53.0, lng: 39.0 },
  DRONE_SOUTH: { lat: 45.5, lng: 36.5 },
  DRONE_NORTH: { lat: 52.0, lng: 33.0 },
  MISSILE: { lat: 46.0, lng: 37.0 },
  BLACK_SEA: { lat: 44.0, lng: 31.0 },
  CASPIAN_SEA: { lat: 42.5, lng: 50.0 },
};




export function calculateAzimuth(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  
  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
  
  let brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

function parseDirection(text: string): number | null {
  if (text.match(/(північно-східн|на\s+північний\s+схід)/i)) return 45;
  if (text.match(/(південно-східн|на\s+південний\s+схід)/i)) return 135;
  if (text.match(/(південно-західн|на\s+південний\s+захід)/i)) return 225;
  if (text.match(/(північно-західн|на\s+північний\s+захід)/i)) return 315;
  if (text.match(/(північ|на\s+північ)/i)) return 0;
  if (text.match(/(схід|на\s+схід)/i)) return 90;
  if (text.match(/(південь|на\s+південь)/i)) return 180;
  if (text.match(/(захід|на\s+захід)/i)) return 270;
  return null;
}

function parseQuantity(text: string): number {
  const numMatch = text.match(/(?<![a-zа-яіїєґ])(\d{1,2})\s*(?:х|x)?\s*(?:шт|шахед|ракет|бпла|каб|дрон)/i);
  if (numMatch) return Math.min(parseInt(numMatch[1], 10), 30);
  
  const numMatchReverse = text.match(/(?:шахед|ракет|бпла|каб|дрон)[^\d]{0,10}(\d{1,2})(?![a-zа-яіїєґ])/i);
  if (numMatchReverse) return Math.min(parseInt(numMatchReverse[1], 10), 30);
  
  if (text.match(/\b(пара|пару)\b/i)) return 2;
  if (text.match(/\b(кілька|декілька)\b/i)) return 3;
  if (text.match(/\b(група|зграя)\b/i)) return 5;
  if (text.match(/\b(багато|масова)\b/i)) return 8;
  return 1;
}

function detectThreatType(text: string): ParsedThreat['type'] | null {
  const t = text.toLowerCase();
  if (t.match(/(відбій|чисто|немає загроз|спокійно|зник|поки чисто|не фіксується|локаційно втрачено|загроза застосування|можливі пуски|реб|рєб|фальш|імітаці|тренуван)/)) return 'INFO';
  if (t.match(/(результат|підсумок|зведення|залишилося|продовжують|по шахедах)/)) return 'SUMMARY';
  if (t.match(/(збито|мінус|знищен|впав|робота ппо|працює ппо|ппо працює|вибух|перехоплено)/)) {
    if (!t.match(/(рух|летить|пуск|курс|напрямок)/)) return 'PPO';
  }
  
  if (t.match(/(циркон|3м22)/)) return 'ZIRCON';
  if (t.match(/(кинджал|кинжал|х-47)/)) return 'KINZHAL';
  if (t.match(/(іскандер|iskander)/)) return 'ISKANDER';
  if (t.match(/(калібр|kalibr)/)) return 'KALIBR';
  if (t.match(/(х-101|х-55|kh-101|крилат)/)) return 'KH101';
  if (t.match(/(балістик|баллистик)/)) return 'BALLISTIC_MISSILE';
  if (t.match(/(ракет|missile)/)) return 'MISSILE';
  if (t.match(/(\bкаб\b|\bкаби\b|\bкабів\b|\bфаб\b|\bфаби\b|авіабомб|\bбомб\b|\bбомби\b|\bбомбу\b)/)) return 'KAB';
  if (t.match(/(fpv|фпв|фпві)/)) return 'FPV';
  if (t.match(/(розвідник|орлан|zala|зала|supercam|суперкам|recon)/)) return 'RECON';
  if (t.match(/(шахед|бпла|\bдрон\b|\bдрони\b|мопед|геран|\bdrone\b|shahed)/)) return 'DRONE';
  if (t.match(/(авіація|су-3|су-2|міг|ту-9|ту-2|літак|борти)/)) return 'AIRCRAFT';
  
  if (t.match(/(невідома ціль|невідомі цілі|невідомий об\.єкт|невідомі об\.єкти|ціль|об\.єкт)/) && !t.match(/невідомо/)) return 'UNKNOWN';
  
  return null;
}


const IGNORE_WORDS = /(наслідок|наслідки|депутат|санкці|врятував|врятувала|на жаль|помер|загинув|постражда|фото|відео|наживо|пишуть|повідомляє|заявив|інтерв.ю|стаття|новина|деталі|читайте|джерело|коментар|підписав|впк|виробництво|комплектуючих|російського|зведення|брифінг|поранений|евакуація|смерт|колишнього|нардеп|закупівл|розкрадання|бюджетн|слідств|вартість|фіктивн|фоп|готівк|розслідують|расследуют|хищение|закупке|производителе|стоимость|средств|заволодіння|розслідує|гроші|мільярд|млрд|обмін|валют|obmin|реклама|знижка|розіграш|магазин|ціна|грн|гривень|клієнт|підпишись|канал|працюємо|vpn|crypto|крипта|одяг|спорядження|промокод|акція|бонус|казино|slots)/;

export function parseTelegramText(text: string): ParsedThreat[] {
  let lowerText = text.toLowerCase();
  
  if (lowerText.match(IGNORE_WORDS)) return [];

  
  // DON'T REPLACE COMMAS YET, but replace other punctuation
  lowerText = lowerText.replace(/[.!?;:]/g, ' ');

  const baseType = detectThreatType(lowerText);
  if (!baseType) return [];
  
  if (baseType === 'INFO' || baseType === 'SUMMARY' || baseType === 'PPO') {
    let lat = null, lng = null;
    for (const [key, coords] of Object.entries(CITY_COORDS)) {
      if (lowerText.includes(key)) {
        lat = coords.lat; lng = coords.lng;
        break;
      }
    }
    return [{ type: baseType, lat, lng, confidence: 100, direction: null }];
  }

  // SPLIT BY COMMA, NEWLINE, CONJUNCTIONS
  const chunks = lowerText.split(/(?:\n|,|(?:а|і|та)\s+також\s+|\s+та\s+)/).filter(c => c.trim().length > 3);
  const results: ParsedThreat[] = [];

  for (const chunk of chunks) {
    const chunkType = detectThreatType(chunk) || baseType;
    if (chunkType === 'INFO' || chunkType === 'SUMMARY' || chunkType === 'PPO') continue;
    
    const qty = parseQuantity(chunk);
    let dir = parseDirection(chunk);
    
    // Process ALL matches in this chunk, not just the last one
    let targetLoc: { lat: number, lng: number, name: string } | null = null;
    let originLoc: { lat: number, lng: number, name: string } | null = null;
    let currentLoc: { lat: number, lng: number, name: string } | null = null;

    // We collect all locations mentioned in the chunk, with their roles
    for (const [cityKey, coords] of Object.entries(CITY_COORDS)) {
      const regex = new RegExp(`(?:^|[^а-яіїєґ'’])(${cityKey})`, 'i');
      const match = chunk.match(regex);
      if (match) {
        const matchIndex = match.index as number;
        const prefix = chunk.substring(Math.max(0, matchIndex - 20), matchIndex);
        
        if (prefix.match(/(?:на|курс|вектор|напрямку|до)\s+$/)) {
          // If there's already a targetLoc, we push the current built threat and start a new one!
          // This handles cases like "на Київ, Суми" where commas were missing
          if (targetLoc) {
            results.push({
              type: chunkType,
              lat: (currentLoc || targetLoc).lat + jitter(),
              lng: (currentLoc || targetLoc).lng + jitter(),
              confidence: currentLoc ? 80 : 40,
              direction: dir ?? Math.floor(Math.random() * 360),
              quantity: qty,
              targetName: targetLoc.name,
              targetLat: targetLoc.lat,
              targetLng: targetLoc.lng
            });
          }
          targetLoc = { lat: coords.lat, lng: coords.lng, name: cityKey };
        } else if (prefix.match(/(?:з|від|через)\s+$/)) {
          originLoc = { lat: coords.lat, lng: coords.lng, name: cityKey };
        } else {
          // It's a current loc. Same logic, if already have one, push the previous
          if (currentLoc) {
            results.push({
              type: chunkType,
              lat: (currentLoc || targetLoc || {lat:0}).lat + jitter(),
              lng: (currentLoc || targetLoc || {lng:0}).lng + jitter(),
              confidence: currentLoc ? 80 : 40,
              direction: dir ?? Math.floor(Math.random() * 360),
              quantity: qty,
              targetName: targetLoc ? targetLoc.name : null,
              targetLat: targetLoc ? targetLoc.lat : null,
              targetLng: targetLoc ? targetLoc.lng : null
            });
            targetLoc = null;
          }
          currentLoc = { lat: coords.lat, lng: coords.lng, name: cityKey };
        }
      }
    }

    if (!currentLoc) {
      for (const [base, coords] of Object.entries(AIRBASE_COORDS)) {
        if (chunk.includes(base)) currentLoc = { lat: coords.lat, lng: coords.lng, name: base };
      }
    }

    if (currentLoc && targetLoc && dir === null) {
      dir = calculateAzimuth(currentLoc.lat, currentLoc.lng, targetLoc.lat, targetLoc.lng);
    }

    if (currentLoc || targetLoc) {
      const plotLoc = currentLoc || targetLoc!;
      const conf = currentLoc ? 80 : 40; 
      
      results.push({
        type: chunkType,
        lat: plotLoc.lat + jitter(),
        lng: plotLoc.lng + jitter(),
        confidence: conf,
        direction: dir ?? Math.floor(Math.random() * 360),
        quantity: qty,
        targetName: targetLoc ? targetLoc.name : null,
        targetLat: targetLoc ? targetLoc.lat : null,
        targetLng: targetLoc ? targetLoc.lng : null
      });
    }
  }

  // Deduplicate
  const uniqueResults: ParsedThreat[] = [];
  for (const res of results) {
    const isDuplicate = uniqueResults.some(u => 
      u.type === res.type && 
      Math.abs(u.lat! - res.lat!) < 0.5 && 
      Math.abs(u.lng! - res.lng!) < 0.5
    );
    if (!isDuplicate) uniqueResults.push(res);
  }

  if (uniqueResults.length > 0) return uniqueResults;

  return legacyFallback(lowerText, baseType);
}

function legacyFallback(lowerText: string, type: ParsedThreat['type']): ParsedThreat[] {
  const qty = parseQuantity(lowerText);
  const dir = parseDirection(lowerText) ?? Math.floor(Math.random() * 360);
  
  let spawn = GENERIC_SPAWN.DRONE_SOUTH;
  if (type === 'CRUISE_MISSILE' || type === 'MISSILE' || type === 'KH101' || type === 'KALIBR') spawn = GENERIC_SPAWN.CASPIAN_SEA;
  else if (type === 'BALLISTIC_MISSILE' || type === 'ISKANDER' || type === 'KINZHAL' || type === 'ZIRCON') spawn = GENERIC_SPAWN.BLACK_SEA;
  else if (type === 'AIRCRAFT') spawn = GENERIC_SPAWN.AIRCRAFT;
  else if (type === 'KAB') spawn = GENERIC_SPAWN.DRONE_NORTH;
  else if (type === 'DRONE' || type === 'FPV' || type === 'RECON') spawn = GENERIC_SPAWN.DRONE_SOUTH;
  else spawn = GENERIC_SPAWN.DRONE_SOUTH;

  return [{ type, lat: spawn.lat + jitter(), lng: spawn.lng + jitter(), confidence: 50, direction: dir, quantity: qty }];
}

function jitter(): number {
  return (Math.random() - 0.5) * 0.3;
}
