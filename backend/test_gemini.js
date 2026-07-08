require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function test(text) {
  const prompt = `Ви - військовий аналітик. Проаналізуйте повідомлення з моніторингового телеграм каналу. 
Якщо інформація відсутня, поверніть null. 
Повідомлення: "${text}" 
Поверніть відповідь виключно у форматі JSON: 
{ "speed": null, "course": null, "predictedTarget": null, "locationNames": [], "targetLat": null, "targetLng": null }`;
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            temperature: 0
        }
    });
    console.log(text.substring(0, 30) + '... -> ', response.text);
  } catch(e) { console.error(e); }
}

async function run() {
  await test('Томаківка (Дніпропетровська обл.) Загроза застосування БПЛА. Перейдіть в укриття!');
  await test('загроза фпв\n18:26 Дрон впав з детонацією\n18:19 фабрика МГЗК\n18:19 Марганецька ТГ');
  await test('Рух Шахеда\n---\nЛупареве/Парутино повинні вже його чути над водою');
  await test('Це було пряме влучання шахеда в багатоповерхівку на Трої');
}
run();
