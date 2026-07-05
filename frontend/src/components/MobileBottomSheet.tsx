import React from 'react';
import { useStore } from '../store/useStore';
import { Target } from 'lucide-react';
import { ThreatIcon } from './ThreatIcon';

export default function MobileBottomSheet() {
  const { threats } = useStore();
  
  // Show the most dangerous/recent threat on mobile by default if no selection logic exists
  const activeThreats = threats.filter(t => t.status === 'ACTIVE');
  const selectedThreat = activeThreats[0];

  if (!selectedThreat) return null;

  return (
    <div className="lg:hidden fixed bottom-16 left-0 w-full bg-[#070b14] border-t border-gray-800 rounded-t-3xl z-40 p-5 pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto mb-4"></div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-12 h-12 rounded-full flex justify-center items-center ${
          selectedThreat.type === 'DRONE' || selectedThreat.type.includes('MISSILE') ? 'bg-red-500/10 border border-red-500/30' : 'bg-blue-500/10 border border-blue-500/30'
        }`}>
          <ThreatIcon type={selectedThreat.type} className="w-6 h-6" />
        </div>
        
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white tracking-wide">
            {selectedThreat.type === 'DRONE' ? 'Shahed-136' : 
             selectedThreat.type === 'CRUISE_MISSILE' ? 'Крилата ракета' : 
             selectedThreat.type === 'BALLISTIC_MISSILE' ? 'Балістична ракета' :
             selectedThreat.type === 'KAB' ? 'КАБ' :
             selectedThreat.type === 'AIRCRAFT' ? 'Літак МіГ-31К' : selectedThreat.type}
          </h2>
          <p className="text-sm text-gray-400">
            Україна
          </p>
        </div>
        
        <Target className="text-gray-500 w-6 h-6" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">Курс</div>
          <div className="text-lg font-bold text-white">{selectedThreat.course ? `${Math.round(selectedThreat.course)}°` : '—'}</div>
        </div>
        <div className="text-center border-l border-r border-gray-800">
          <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">Швидкість</div>
          <div className="text-lg font-bold text-white">{selectedThreat.speed ? `${Math.round(selectedThreat.speed)} км/г` : '—'}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">Висота</div>
          <div className="text-lg font-bold text-white">—</div>
        </div>
      </div>

      <button className="w-full py-4 bg-red-600 hover:bg-red-700 transition-colors rounded-xl text-white font-bold tracking-widest text-lg uppercase shadow-[0_0_20px_rgba(220,38,38,0.4)]">
        Загроза висока
      </button>
    </div>
  );
}
