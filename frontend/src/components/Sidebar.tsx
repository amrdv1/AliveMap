"use client";

import { useStore } from '../store/useStore';
import { ThreatIcon } from './ThreatIcon';

// Format locations for display
const LOCATIONS: Record<string, {lat: number, lng: number}> = {
  "Київ": { lat: 50.4501, lng: 30.5234 },
  "Львів": { lat: 49.8397, lng: 24.0297 },
  "Одеса": { lat: 46.4825, lng: 30.7233 },
  "Харків": { lat: 50.0000, lng: 36.2304 },
  "Дніпро": { lat: 48.4647, lng: 35.0462 },
  "Миколаїв": { lat: 46.9750, lng: 31.9946 },
  "Запоріжжя": { lat: 47.8388, lng: 35.1396 },
  "Херсон": { lat: 46.6354, lng: 32.6169 },
  "Чернігів": { lat: 51.4982, lng: 31.2893 },
  "Суми": { lat: 50.9077, lng: 34.7981 },
  "Полтава": { lat: 49.5883, lng: 34.5514 },
  "Черкаси": { lat: 49.4444, lng: 32.0598 },
  "Вінниця": { lat: 49.2331, lng: 28.4682 },
  "Житомир": { lat: 50.2547, lng: 28.6587 },
  "Рівне": { lat: 50.6199, lng: 26.2516 },
  "Кропивницький": { lat: 48.5079, lng: 32.2623 },
  "Хмельницький": { lat: 49.4230, lng: 26.9871 },
  "Чернівці": { lat: 48.2915, lng: 25.9352 },
  "Івано-Франківськ": { lat: 48.9226, lng: 24.7111 },
  "Тернопіль": { lat: 49.5535, lng: 25.5948 },
  "Луцьк": { lat: 50.7472, lng: 25.3254 },
  "Ужгород": { lat: 48.6208, lng: 22.2879 },
  "Кривий Ріг": { lat: 47.9100, lng: 33.3918 }, 
  "Кременчук": { lat: 49.0667, lng: 33.4167 },
  "Білгород-Дністровський": { lat: 46.1958, lng: 30.3496 },
  "Ізмаїл": { lat: 45.3400, lng: 28.8350 },
  "Миргород": { lat: 49.9654, lng: 33.6050 },
  "Старокостянтинів": { lat: 49.7547, lng: 27.2181 },
  "Павлоград": { lat: 48.5167, lng: 35.8667 },
  "Шостка": { lat: 51.8667, lng: 33.4833 },
  "Конотоп": { lat: 51.2333, lng: 33.2000 },
  "Ніжин": { lat: 51.0333, lng: 31.8833 },
  "Умань": { lat: 48.7500, lng: 30.2167 },
  "Біла Церква": { lat: 49.8000, lng: 30.1167 },
  // Airbases
  "Саваслейка (РФ)": { lat: 55.4411, lng: 42.3161 },
  "Оленья (РФ)": { lat: 68.1517, lng: 33.4617 },
  "Енгельс (РФ)": { lat: 51.4811, lng: 46.2111 },
  "Моздок (РФ)": { lat: 43.7850, lng: 44.5936 },
  "Шайковка (РФ)": { lat: 54.2250, lng: 34.3683 },
  "Дягілєво (РФ)": { lat: 54.6464, lng: 39.5714 },
  "Мачулищі (РБ)": { lat: 53.7719, lng: 27.5772 },
  "Бельбек (Крим)": { lat: 44.6853, lng: 33.5614 },
  "Ахтубінськ (РФ)": { lat: 48.3075, lng: 46.2081 },
  "Морозовськ (РФ)": { lat: 48.3142, lng: 41.7925 },
  "Приморсько-Ахтарськ (РФ)": { lat: 46.0465, lng: 38.1749 },
  "Чауда (Крим)": { lat: 45.0000, lng: 35.8333 },
  "Єйськ (РФ)": { lat: 46.6811, lng: 38.2062 },
  "Курськ (РФ)": { lat: 51.7373, lng: 36.1950 },
  "Брянськ (РФ)": { lat: 53.2435, lng: 34.3634 },
  "Воронеж (РФ)": { lat: 51.6608, lng: 39.2003 },
  // Regions generic
  "Акваторія Азовського моря": { lat: 45.5, lng: 36.5 },
  "Північ РФ": { lat: 52.0, lng: 33.0 },
  "Акваторія Чорного моря": { lat: 44.0, lng: 31.0 },
};

function getNearestLocation(lat: number, lng: number): string {
  let minDistance = Infinity;
  let nearest = "";
  for (const [name, coords] of Object.entries(LOCATIONS)) {
      const dist = Math.sqrt(Math.pow(lat - coords.lat, 2) + Math.pow(lng - coords.lng, 2));
      if (dist < minDistance) {
          minDistance = dist;
          nearest = name;
      }
  }
  return minDistance < 1.5 ? nearest : "У повітрі"; // Approx 150km radius matching
}

export default function Sidebar() {
  const { threats } = useStore();
  const activeThreats = threats.filter(t => t.status === 'ACTIVE').slice(0, 20);

  return (
    <div className="hidden lg:flex w-full h-full bg-transparent flex-col z-20 text-white overflow-y-auto custom-scrollbar p-5">
      <h3 className="text-white/50 text-[10px] font-bold tracking-widest mb-4 uppercase flex items-center gap-2">
        АКТИВНІ ЦІЛІ
        <div className="w-1.5 h-1.5 rounded-full bg-red-500/80 animate-pulse"></div>
      </h3>

      <div className="flex-grow flex flex-col gap-2">
        {activeThreats.map(threat => {
          const latestLoc = threat.locations?.[threat.locations.length - 1];
          const locationName = latestLoc ? getNearestLocation(latestLoc.lat, latestLoc.lng) : '';
          
          return (
            <div key={threat.id} className="flex items-center gap-4 bg-white/5 rounded-xl p-3 text-sm border border-transparent hover:border-white/10 hover:bg-white/10 transition-all cursor-pointer">
              <div className={`w-8 h-8 rounded-full flex justify-center items-center shrink-0 ${
                threat.type === 'DRONE' || threat.type.includes('MISSILE') ? 'bg-red-500/10' : 'bg-blue-500/10'
              }`}>
                <ThreatIcon type={threat.type} className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white/90 truncate">
                  {threat.type === 'DRONE' ? 'Шахед / БПЛА' : 
                   threat.type === 'FPV' ? 'FPV / Ланцет' :
                   threat.type === 'CRUISE_MISSILE' ? 'Крилата Ракета' : 
                   threat.type === 'BALLISTIC_MISSILE' ? 'Балістика' :
                   threat.type === 'MISSILE' ? 'Ракета' :
                   threat.type === 'KAB' ? 'КАБ / ФАБ' :
                   threat.type === 'AIRCRAFT' ? 'Тактична Авіація' :
                   threat.type === 'ZIRCON' ? 'Гіперзвукова (Циркон)' :
                   threat.type === 'PPO' ? 'ППО' :
                   threat.type === 'RECON' ? 'Розвідник' : 
                   threat.type === 'UNKNOWN' ? 'Невідома Ціль' : threat.type}
                </div>
                {locationName && (
                  <div className="text-[10px] text-white/50 font-medium truncate mt-0.5">
                    {locationName}
                  </div>
                )}
              </div>
              
              <div className="text-[10px] text-white/40 font-mono font-medium shrink-0">
                {new Date(threat.updatedAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        })}
        {activeThreats.length === 0 && (
          <div className="text-xs text-white/30 text-center py-10 italic">
            Немає активних цілей
          </div>
        )}
      </div>
      
      {activeThreats.length > 0 && (
        <button className="mt-4 w-full py-2.5 bg-white/5 rounded-xl text-[10px] text-white/50 hover:text-white/90 hover:bg-white/10 transition-colors uppercase tracking-widest font-bold">
          Переглянути всі
        </button>
      )}
    </div>
  );
}
