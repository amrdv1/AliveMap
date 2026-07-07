import React from 'react';
import { useStore } from '../store/useStore';
import { Target, AlertTriangle } from 'lucide-react';
import { ThreatIcon } from './ThreatIcon';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileBottomSheet() {
  const { threats, setFlyToLocation } = useStore();
  
  const activeThreats = threats.filter(t => t.status === 'ACTIVE');

  if (activeThreats.length === 0) return null;

  return (
    <div className="lg:hidden fixed bottom-24 left-0 right-0 z-40 pointer-events-none">
      <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 pb-2 gap-4 pointer-events-auto">
        {activeThreats.map((threat, idx) => (
          <div 
            key={threat.id}
            onClick={() => {
                if (threat.locations.length > 0) {
                    setFlyToLocation({ lat: threat.locations[0].lat, lng: threat.locations[0].lng });
                } else if (threat.targetLat && threat.targetLng) {
                    setFlyToLocation({ lat: threat.targetLat, lng: threat.targetLng });
                }
            }}
            className="flex-shrink-0 w-full sm:w-[320px] snap-center bg-black/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] cursor-pointer"
          >
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4"></div>
            
            <div className="flex items-center gap-4 mb-5">
              <div className={`w-12 h-12 rounded-full flex justify-center items-center shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
                threat.type === 'DRONE' || threat.type.includes('MISSILE') ? 'bg-red-500/20 border border-red-500/50 text-red-500' : 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
              }`}>
                <ThreatIcon type={threat.type} className="w-6 h-6" />
              </div>
              
              <div className="flex-1">
                <h2 className="text-lg font-black text-white tracking-wide leading-tight">
                  {threat.type === 'DRONE' ? 'ШАХЕД / БПЛА' : 
                   threat.type === 'FPV' ? 'FPV / ДРОН' :
                   threat.type === 'CRUISE_MISSILE' ? 'КРИЛАТА РАКЕТА' : 
                   threat.type === 'KH101' ? 'КРИЛАТА РАКЕТА (Х-101)' :
                   threat.type === 'KALIBR' ? 'КАЛІБР' :
                   threat.type === 'BALLISTIC_MISSILE' ? 'БАЛІСТИКА' :
                   threat.type === 'ISKANDER' ? 'ІСКАНДЕР-М' :
                   threat.type === 'KINZHAL' ? 'КИНДЖАЛ' :
                   threat.type === 'MISSILE' ? 'РАКЕТА' :
                   threat.type === 'KAB' ? 'КАБ / ФАБ' :
                   threat.type === 'AIRCRAFT' ? 'АВІАЦІЯ' :
                   threat.type === 'ZIRCON' ? 'ЦИРКОН' :
                   threat.type === 'PPO' ? 'ППО' :
                   threat.type === 'RECON' ? 'РОЗВІДНИК' : threat.type}
                </h2>
                <p className="text-xs text-gray-400 font-medium mt-1">
                  {idx + 1} з {activeThreats.length} активних цілей
                </p>
              </div>
              
              <Target className="text-gray-500 w-5 h-5 opacity-50" />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="text-center bg-white/5 rounded-xl py-2 border border-white/5">
                <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider font-bold">Курс</div>
                <div className="text-sm font-black text-white">{threat.course ? `${Math.round(threat.course)}°` : '—'}</div>
              </div>
              <div className="text-center bg-white/5 rounded-xl py-2 border border-white/5">
                <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider font-bold">Швидкість</div>
                <div className="text-sm font-black text-white">{threat.speed ? `${Math.round(threat.speed)} км/г` : '—'}</div>
              </div>
              <div className="text-center bg-white/5 rounded-xl py-2 border border-white/5">
                <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider font-bold">Кількість</div>
                <div className="text-sm font-black text-white">{threat.quantity > 1 ? `${threat.quantity} шт` : '1 шт'}</div>
              </div>
            </div>

            <div className="w-full py-3 bg-red-600 hover:bg-red-500 transition-colors rounded-xl text-white font-black tracking-widest text-sm uppercase shadow-[0_0_15px_rgba(220,38,38,0.5)] flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" /> ЗАГРОЗА
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
