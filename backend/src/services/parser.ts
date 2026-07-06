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

const CITY_COORDS: Record<string, {lat: number, lng: number}> = {
  // ═══ ОБЛАСНІ ЦЕНТРИ ═══
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

  // ═══ КИЇВСЬКА ОБЛАСТЬ ═══
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
  "яготин": { lat: 50.2667, lng: 31.7667 },
  "переяслав": { lat: 50.0667, lng: 31.4500 },
  "кагарлик": { lat: 49.8500, lng: 30.8333 },
  "тарас": { lat: 50.4900, lng: 30.3600 },
  "гостомел": { lat: 50.5653, lng: 30.2542 },
  "боярк": { lat: 50.3242, lng: 30.2867 },
  "вишнев": { lat: 50.3862, lng: 30.3675 },
  "ворзел": { lat: 50.5553, lng: 30.2433 },
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
  "велик писарів": { lat: 50.2333, lng: 35.6500 },
  "хотін": { lat: 51.2500, lng: 33.4167 },

  // ═══ ХАРКІВСЬКА ОБЛАСТЬ ═══
  "чугуїв": { lat: 49.8333, lng: 36.6833 },
  "ізюм": { lat: 49.2105, lng: 37.2558 },
  "куп'янськ": { lat: 49.7144, lng: 37.6161 },
  "лозов": { lat: 48.8833, lng: 36.3167 },
  "первомайськ": { lat: 48.6333, lng: 36.2333 },
  "барвінков": { lat: 48.9001, lng: 37.0196 },
  "балакл": { lat: 49.4667, lng: 36.6333 },
  "вовчанськ": { lat: 50.2833, lng: 36.9333 },
  "дергач": { lat: 50.1000, lng: 36.1167 },
  "мерефа": { lat: 49.8167, lng: 36.0500 },
  "шевченков": { lat: 49.7000, lng: 37.0833 },
  "зміїв": { lat: 49.6833, lng: 36.3500 },
  "красноград": { lat: 49.3667, lng: 35.4333 },
  "богодухів": { lat: 50.1667, lng: 35.5167 },
  "валки": { lat: 49.8333, lng: 35.8000 },
  "золочів": { lat: 50.2833, lng: 35.9667 },
  "нов водолаг": { lat: 49.7167, lng: 35.8833 },
  "липц": { lat: 50.2167, lng: 36.4167 },
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
  "пирятин": { lat: 50.2333, lng: 32.5167 },
  "карлівк": { lat: 49.4500, lng: 35.1333 },
  "гребінк": { lat: 50.1167, lng: 31.9000 },
  "глобин": { lat: 49.4000, lng: 33.2833 },
  "козельщин": { lat: 49.2333, lng: 34.0667 },
  "зіньків": { lat: 50.2000, lng: 34.3667 },

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
  "умань": { lat: 48.7500, lng: 30.2167 },
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
  "київська обл": { lat: 50.25, lng: 30.5 },
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
  const safeText = text.replace(/(х|x)[\-\s]*(59|101|555|55|47|22|69|35)/gi, '')
                       .replace(/(су|міг|mig|su)[\-\s]*\d{2}/gi, '')
                       .replace(/(с|s)[\-\s]*[34]00/gi, '')
                       .replace(/3м(22|14)/gi, '')
                       .replace(/кн[\-\s]*2[34]/gi, '');

  const numMatch = safeText.match(/(?<![a-zа-яіїєґ])(\d{1,2})\s*[xхXХ]?\s*(?:шахед|бпла|дрон|ракет|ціл|одиниц|штук|шт|мопед|безпілотник|геран|балістик|калібр|крилат|снаряд)/i);
  if (numMatch) return Math.min(parseInt(numMatch[1], 10), 30);
  
  const reverseMatch = safeText.match(/(?:ракет|бпла|шахед|калібр|дрон)[^\d]{0,15}(\d{1,2})(?![a-zа-яіїєґ])/i);
  if (reverseMatch) return Math.min(parseInt(reverseMatch[1], 10), 30);
  
  if (safeText.match(/\bпар[аи]\b/i)) return 2;
  if (safeText.match(/\b(кільк|декільк)\b/i)) return 3;
  if (safeText.match(/\b(груп[аи]|зграя)\b/i)) return 5;
  if (safeText.match(/\b(масован|масштабн)\b/i)) return 8;
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
      if (target.match(/(північ|півден|захід|схід|вектор)/)) continue;
      
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
  if (t.match(/(х-101|х-555|х-55|х-69)/)) return 'KH101';
  if (t.match(/(калібр|3м14)/)) return 'KALIBR';
  if (t.match(/(кинджал|х-47)/)) return 'KINZHAL';
  if (t.match(/(іскандер|искандер|кн-23|кн-24)/)) return 'ISKANDER';
  if (t.match(/(fpv|фпв|ланцет|молнія|зала|zala|суперкам|supercam)/)) return 'FPV';
  if (t.match(/(шахед|шахід|shahed|бпла|мопед|безпілотник|геран|гербер|дрон|ударний\s*безпілотн)/)) return 'DRONE';
  if (t.match(/(балістик|с-300|с-400|точка-у)/)) return 'BALLISTIC_MISSILE';
  if (t.match(/(х-59|х-35|кх-|крилат[аіи]\s*ракет|ракетоносц|ракетонос)/)) return 'CRUISE_MISSILE';
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

    const matchedLineLocs: {lat: number, lng: number, conf: number}[] = [];

    for (const [base, coords] of Object.entries(AIRBASE_COORDS)) {
      if (lineLower.includes(base)) {
        matchedLineLocs.push({ lat: coords.lat, lng: coords.lng, conf: 90 });
      }
    }
    
    if (lineType !== 'AIRCRAFT') {
      for (const [cityKey, coords] of Object.entries(CITY_COORDS)) {
        if (lineLower.includes(cityKey)) {
          if (lineTarget.targetName && lineTarget.targetName.includes(cityKey)) continue;
          matchedLineLocs.push({ lat: coords.lat, lng: coords.lng, conf: 80 });
        }
      }
    }

    if (matchedLineLocs.length === 0 && currentRegionLat !== null) {
      matchedLineLocs.push({ lat: currentRegionLat, lng: currentRegionLng!, conf: 60 });
    }

    const hasLineMention = lineLower.match(/(бпла|шахед|ракет|балістик|калібр|дрон|крилат|каб|фаб|бомб|авіабомб|х-101|х-55|циркон|курс|напрямок|збито|мінус|летить|рух|пуск|ціль|fpv|фпв)/);
    if (hasLineMention) {
      for (const loc of matchedLineLocs) {
        results.push({
          type: lineType!,
          lat: loc.lat + jitter(),
          lng: loc.lng + jitter(),
          confidence: loc.conf,
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
        if (targetName && targetName.includes(cityKey)) continue;
        matchedLocations.push({ lat: coords.lat, lng: coords.lng, conf: 80 });
      }
    }
  }

  if (matchedLocations.length === 0) {
    if (type === 'AIRCRAFT') {
      matchedLocations.push({ ...GENERIC_SPAWN.AIRCRAFT, conf: 50 });
    } else if ((type === 'CRUISE_MISSILE' || type === 'KALIBR' || type === 'KH101') && lowerText.match(/(морі|море|ракетонос|каспій|чорн)/)) {
      if (lowerText.match(/каспій/)) matchedLocations.push({ ...GENERIC_SPAWN.CASPIAN_SEA, conf: 70 });
      else matchedLocations.push({ ...GENERIC_SPAWN.BLACK_SEA, conf: 80 });
    } else if (type === 'DRONE') {
      if (lowerText.match(/(північ|курськ|брянськ|сум|чернігів)/)) matchedLocations.push({ ...GENERIC_SPAWN.DRONE_NORTH, conf: 50 });
      else matchedLocations.push({ ...GENERIC_SPAWN.DRONE_SOUTH, conf: 50 });
    } else if (['MISSILE', 'BALLISTIC_MISSILE', 'CRUISE_MISSILE', 'ZIRCON', 'KH101', 'ISKANDER', 'KINZHAL', 'KALIBR'].includes(type)) {
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
