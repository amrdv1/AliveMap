"use client";

import { useStore } from '../store/useStore';
import { ThreatIcon } from './ThreatIcon';

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
        {activeThreats.map(threat => (
          <div key={threat.id} className="flex items-center gap-4 bg-white/5 rounded-xl p-3 text-sm border border-transparent hover:border-white/10 hover:bg-white/10 transition-all cursor-pointer">
            <div className={`w-8 h-8 rounded-full flex justify-center items-center ${
              threat.type === 'DRONE' || threat.type.includes('MISSILE') ? 'bg-red-500/10' : 'bg-blue-500/10'
            }`}>
              <ThreatIcon type={threat.type} className="w-5 h-5" />
            </div>
            
            <div className="flex-1">
              <div className="text-xs font-semibold text-white/90">
                {threat.type === 'DRONE' ? 'Shahed-136' : 
                 threat.type === 'CRUISE_MISSILE' ? 'Крилата ракета' : 
                 threat.type === 'BALLISTIC_MISSILE' ? 'Балістична ракета' :
                 threat.type === 'KAB' ? 'КАБ' :
                 threat.type === 'AIRCRAFT' ? 'Літак МіГ-31К' : threat.type}
              </div>
            </div>
            
            <div className="text-[10px] text-white/40 font-mono font-medium">
              {new Date(threat.updatedAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
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
