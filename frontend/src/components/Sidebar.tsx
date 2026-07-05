"use client";

import { useStore } from '../store/useStore';
import { Settings, Filter, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThreatIcon } from './ThreatIcon';

export default function Sidebar() {
  const { threats } = useStore();

  const activeThreats = threats.filter(t => t.status === 'ACTIVE').slice(0, 20);

  return (
    <div className="hidden lg:flex w-72 h-full bg-[#070b14]/90 backdrop-blur-md border-l border-gray-800/50 flex-col z-20 text-white shadow-2xl overflow-y-auto custom-scrollbar p-6">
      <h3 className="text-gray-500 text-xs font-bold tracking-widest mb-6 uppercase flex items-center gap-2">
        АКТИВНІ ЦІЛІ
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
      </h3>

      <div className="flex-grow flex flex-col gap-4">
        {activeThreats.map(threat => (
          <div key={threat.id} className="flex items-center gap-4 bg-[#0a0f18]/80 rounded p-3 text-sm border border-gray-800/60 hover:border-gray-700 hover:bg-[#0d1421] transition-all cursor-pointer">
            <div className={`w-8 h-8 rounded-full flex justify-center items-center ${
              threat.type === 'DRONE' || threat.type.includes('MISSILE') ? 'bg-red-500/10 border border-red-500/30' : 'bg-blue-500/10 border border-blue-500/30'
            }`}>
              <ThreatIcon type={threat.type} className="w-5 h-5" />
            </div>
            
            <div className="flex-1">
              <div className="text-xs font-bold text-gray-200">
                {threat.type === 'DRONE' ? 'Shahed-136' : 
                 threat.type === 'CRUISE_MISSILE' ? 'Крилата ракета' : 
                 threat.type === 'BALLISTIC_MISSILE' ? 'Балістична ракета' :
                 threat.type === 'KAB' ? 'КАБ' :
                 threat.type === 'AIRCRAFT' ? 'Літак МіГ-31К' : threat.type}
              </div>
            </div>
            
            <div className="text-[10px] text-gray-400 font-mono">
              {new Date(threat.updatedAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        {activeThreats.length === 0 && (
          <div className="text-xs text-gray-600 text-center py-10 italic">
            Немає активних цілей
          </div>
        )}
      </div>
      
      <button className="mt-4 w-full py-3 bg-[#0a0f18] border border-gray-800 rounded text-xs text-gray-400 hover:text-white hover:border-gray-600 transition-colors uppercase tracking-widest font-bold">
        Переглянути всі
      </button>
    </div>
  );
}
