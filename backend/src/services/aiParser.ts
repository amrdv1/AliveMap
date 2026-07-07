import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface AIExtraction {
  speed: number | null; // km/h
  course: number | null; // degrees 0-360
  predictedTarget: string | null;
  locationNames: string[]; // strictly formatted for Geocoder
  targetLat: number | null;
  targetLng: number | null;
}

export async function extractWithAI(text: string): Promise<AIExtraction | null> {
  if (!process.env.GEMINI_API_KEY) return null;

  const prompt = `
Ви - військовий аналітик. Проаналізуйте повідомлення з моніторингового телеграм каналу.
Якщо інформація відсутня, поверніть null.

Повідомлення: "${text}"

Поверніть відповідь виключно у форматі JSON:
{
  "speed": number | null, // швидкість в км/год, якщо є (напр. 600, 800)
  "course": number | null, // курс/напрямок в градусах: (північ = 0, схід = 90, південь = 180, захід = 270, північно-захід = 315 і т.д.)
  "predictedTarget": string | null, // ймовірна ціль (місто або об'єкт)
  "locationNames": string[], // ТІЛЬКИ точні назви населених пунктів для Geocoder (напр. ["Тузли, Одеська область", "Снігурівка, Миколаївська область", "Одеса"]). НЕ пишіть прийменники ("біля", "навпроти"), НЕ пишіть "Чорне море" або регіони.
  "targetLat": number | null, // Якщо ви ТОЧНО знаєте координати цієї локації (напр. акваторія моря біля Тузлів, чи конкретне село), напишіть широту. Інакше null.
  "targetLng": number | null  // Якщо ви ТОЧНО знаєте координати, напишіть довготу. Інакше null.
}
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            temperature: 0
        }
    });
    
    if (response.text) {
        const parsed = JSON.parse(response.text);
        return {
            speed: parsed.speed || null,
            course: parsed.course || null,
            predictedTarget: parsed.predictedTarget || null,
            locationNames: Array.isArray(parsed.locationNames) ? parsed.locationNames : [],
            targetLat: typeof parsed.targetLat === 'number' ? parsed.targetLat : null,
            targetLng: typeof parsed.targetLng === 'number' ? parsed.targetLng : null
        };
    }
  } catch (error) {
    console.error("Gemini AI extraction error:", error);
  }
  
  return null;
}
