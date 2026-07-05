import { GoogleGenerativeAI, Type } from "@google/generative-ai";

export interface ParsedThreat {
  type: 'DRONE' | 'MISSILE' | 'CRUISE_MISSILE' | 'BALLISTIC_MISSILE' | 'AIRCRAFT' | 'KAB' | 'RECON' | 'PPO' | 'ALERT';
  lat: number | null;
  lng: number | null;
  confidence: number;
  direction?: number;
  speed?: number;
}

const EXTENDED_CITY_COORDS: Record<string, {lat: number, lng: number}> = {
  // Major Cities
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
  "білгород-дністр": { lat: 46.1947, lng: 30.3496 },
  "кременчук": { lat: 49.0631, lng: 33.4053 },
  "миргород": { lat: 49.9667, lng: 33.6167 },
  "коростень": { lat: 50.9525, lng: 28.6353 },
  "старокостянтин": { lat: 49.7570, lng: 27.2185 },
  "стри": { lat: 49.2562, lng: 23.8504 },
  "чорноморськ": { lat: 46.3025, lng: 30.6558 },
  "очаків": { lat: 46.6136, lng: 31.5453 },
  "вознесенськ": { lat: 47.5611, lng: 31.3344 },
  "снігурівк": { lat: 47.0781, lng: 32.7983 },
  "берислав": { lat: 46.8402, lng: 33.4248 },
  "нікопол": { lat: 47.5667, lng: 34.3995 },
  "марганець": { lat: 47.6394, lng: 34.6133 },
  "павлоград": { lat: 48.5167, lng: 35.8667 },
  "лозов": { lat: 48.8899, lng: 36.3159 },
  "чугуїв": { lat: 49.8364, lng: 36.6800 },
  "ізюм": { lat: 49.2081, lng: 37.2687 },
  "куп'янськ": { lat: 49.7121, lng: 37.6041 },
  "вовчанськ": { lat: 50.2929, lng: 36.9366 },
  "золочів": { lat: 49.8058, lng: 24.8967 },
  "охтирк": { lat: 50.3101, lng: 34.8984 },
  "конотоп": { lat: 51.2405, lng: 33.1979 },
  "шостк": { lat: 51.8643, lng: 33.4731 },
  "ніжин": { lat: 51.0401, lng: 31.8845 },
  "прилук": { lat: 50.5902, lng: 32.3853 },
  "бровар": { lat: 50.5111, lng: 30.7904 },
  "бориспіл": { lat: 50.3486, lng: 30.9575 },
  "васильків": { lat: 50.1772, lng: 30.3168 },
  "обухів": { lat: 50.1207, lng: 30.6405 },
  "біла церкв": { lat: 49.7948, lng: 30.1162 },
  "фастів": { lat: 50.0819, lng: 29.9142 },
  "умань": { lat: 48.7484, lng: 30.2215 },
  "сміл": { lat: 49.2272, lng: 31.8797 },
};

function parseTelegramTextRegex(text: string): ParsedThreat {
  const lowerText = text.toLowerCase();
  
  let type: ParsedThreat['type'] = 'ALERT';
  if (lowerText.match(/(шахед|бпла|мопед|безпілотник|герань)/)) type = 'DRONE';
  else if (lowerText.match(/(каб|фаб|керован.*бомб|авіабомб)/)) type = 'KAB';
  else if (lowerText.match(/(розвід|орлан|zala|зала|supercam)/)) type = 'RECON';
  else if (lowerText.match(/(ппо|збито|відпрацювало|протиповітр)/)) type = 'PPO';
  else if (lowerText.match(/(кинджал|балістик|іскандер-м)/)) type = 'BALLISTIC_MISSILE';
  else if (lowerText.match(/(х-101|калібр|крилат.*ракет|іскандер-к)/)) type = 'CRUISE_MISSILE';
  else if (lowerText.match(/(ракет|х-)/)) type = 'MISSILE';
  else if (lowerText.match(/(ту-95|ту-22|міг-31|авіаці|су-34|су-35)/)) type = 'AIRCRAFT';

  let direction = undefined;
  if (lowerText.match(/(курс(ом)?\s*на\s*північ|вектор\s*північ|на\s*північ)/)) direction = 0;
  else if (lowerText.match(/(курс(ом)?\s*на\s*північний.*схід|на\s*північний.*схід)/)) direction = 45;
  else if (lowerText.match(/(курс(ом)?\s*на\s*схід|вектор\s*схід|на\s*схід)/)) direction = 90;
  else if (lowerText.match(/(курс(ом)?\s*на\s*південний.*схід|на\s*південний.*схід)/)) direction = 135;
  else if (lowerText.match(/(курс(ом)?\s*на\s*південь|вектор\s*південь|на\s*південь)/)) direction = 180;
  else if (lowerText.match(/(курс(ом)?\s*на\s*південний.*захід|на\s*південний.*захід)/)) direction = 225;
  else if (lowerText.match(/(курс(ом)?\s*на\s*захід|вектор\s*захід|на\s*захід)/)) direction = 270;
  else if (lowerText.match(/(курс(ом)?\s*на\s*північний.*захід|на\s*північний.*захід)/)) direction = 315;
  else if (lowerText.match(/курс/)) direction = Math.floor(Math.random() * 360); 

  let lat = null;
  let lng = null;
  let confidence = 0;
  const jitter = () => (Math.random() - 0.5) * 0.15; 
  
  for (const [cityKey, coords] of Object.entries(EXTENDED_CITY_COORDS)) {
    if (lowerText.includes(cityKey)) {
      lat = coords.lat + jitter();
      lng = coords.lng + jitter();
      confidence = 85;
      break;
    }
  }
  
  return { type, lat, lng, confidence, direction };
}

export async function parseTelegramText(text: string): Promise<ParsedThreat> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("No GEMINI_API_KEY found, falling back to Regex parser");
    return parseTelegramTextRegex(text);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['DRONE', 'MISSILE', 'CRUISE_MISSILE', 'BALLISTIC_MISSILE', 'AIRCRAFT', 'KAB', 'RECON', 'PPO', 'ALERT'] },
            lat: { type: Type.NUMBER, nullable: true },
            lng: { type: Type.NUMBER, nullable: true },
            confidence: { type: Type.NUMBER, description: "0 to 100" },
            direction: { type: Type.NUMBER, nullable: true, description: "0 to 360 degrees" },
            speed: { type: Type.NUMBER, nullable: true, description: "km/h" }
          },
          required: ["type", "confidence"]
        }
      }
    });

    const prompt = \`You are a military intelligence parser. Read the following Ukrainian Telegram message about an air raid threat and extract the details.
Calculate the exact latitude and longitude based on the mentioned city, region, or direction in Ukraine.
If it's a threat (drone, missile, aircraft), output coordinates. If it's general news or PPO (air defense) working, set lat/lng to null.
If you know the coordinates of the city/region, output them. Be as precise as possible.
Set confidence to 100 if you found exact coordinates, 0 if not.
Text: "\${text}"\`;

    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    
    // Safety check and jitter
    const jitter = () => (Math.random() - 0.5) * 0.05;
    
    return {
      type: parsed.type,
      lat: parsed.lat ? parsed.lat + jitter() : null,
      lng: parsed.lng ? parsed.lng + jitter() : null,
      confidence: parsed.confidence || 0,
      direction: parsed.direction || undefined,
      speed: parsed.speed || undefined
    };
  } catch (error) {
    console.error("Gemini API Error, falling back to Regex:", error);
    return parseTelegramTextRegex(text);
  }
}

