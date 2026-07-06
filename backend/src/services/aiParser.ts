import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface AIExtraction {
  speed: number | null; // km/h
  course: number | null; // degrees 0-360
  predictedTarget: string | null;
  targetLat: number | null;
  targetLng: number | null;
}

export async function extractWithAI(text: string): Promise<AIExtraction | null> {
  if (!process.env.GEMINI_API_KEY) return null;

  const prompt = `
Ви - військовий аналітик. Проаналізуйте повідомлення з моніторингового телеграм-каналу та витягніть наступні дані про рух загрози (БПЛА, ракети тощо).
Якщо інформації немає, поверніть null.

Повідомлення: "${text}"

Поверніть СУВОРО валідний JSON:
{
  "speed": number | null, // Швидкість у км/год, якщо вказана (напр. 600, 800)
  "course": number | null, // Курс/вектор у градусах (Північ = 0, Схід = 90, Південь = 180, Захід = 270, Пн-Зх = 315 і т.д.)
  "predictedTarget": string | null // Ймовірна ціль (місто або об'єкт)
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
            targetLat: null,
            targetLng: null
        };
    }
  } catch (error) {
    console.error("Gemini AI extraction error:", error);
  }
  
  return null;
}
