"use client";

import { useStore } from '../store/useStore';
import { Settings, Filter, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
            {/* Simple vector icon representation for sidebar */}
            <div className={`w-8 h-8 rounded-full flex justify-center items-center ${
              threat.type === 'DRONE' || threat.type.includes('MISSILE') ? 'bg-red-500/10 border border-red-500/30' : 'bg-blue-500/10 border border-blue-500/30'
            }`}>
              {threat.type === 'DRONE' ? (
                <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[8px] border-l-transparent border-r-transparent border-b-red-500"></div>
              ) : threat.type.includes('MISSILE') ? (
                <div className="w-1 h-3 bg-red-500 relative before:content-[''] before:absolute before:-top-1 before:left-0 before:w-0 before:h-0 before:border-l-[2px] before:border-r-[2px] before:border-b-[3px] before:border-l-transparent before:border-r-transparent before:border-b-red-500"></div>
              ) : (
                <div className="w-3 h-3 bg-blue-500" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 50% 80%, 0% 100%)' }}></div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="text-xs font-bold text-gray-200">
                {threat.type === 'DRONE' ? 'Shahed-136' : 
                 threat.type === 'CRUISE_MISSILE' ? 'Крилата ракета' : 
                 threat.type === 'BALLISTIC_MISSILE' ? 'Балістична ракета' :
                 threat.type === 'KAB' ? 'КАБ' :
                 threat.type === 'AIRCRAFT' ? 'Літак МіГ-31К' : threat.type}
              </div>
              {threat.locations[0]?.source?.name && (
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {threat.locations[0].source.name}
                </div>
              )}
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
