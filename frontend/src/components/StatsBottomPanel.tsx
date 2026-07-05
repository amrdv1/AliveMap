import React from 'react';
import { useStore } from '../store/useStore';
import { Radar } from 'lucide-react';

export default function StatsBottomPanel() {
  const { threats } = useStore();
  
  const activeThreats = threats.filter(t => t.status === 'ACTIVE');
  
  const alertsCount = threats.filter(t => t.type === 'ALERT').length;
  const dronesCount = activeThreats.filter(t => t.type === 'DRONE').length;
  const missilesCount = activeThreats.filter(t => t.type === 'CRUISE_MISSILE' || t.type === 'BALLISTIC_MISSILE' || t.type === 'MISSILE').length;
  const aircraftCount = activeThreats.filter(t => t.type === 'AIRCRAFT').length;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-30 pointer-events-none">
      {/* Stats Pill - Premium Dark Edition */}
      <div className="pointer-events-auto bg-[#010a1b] border border-white/10 rounded-2xl px-6 py-3 flex flex-wrap justify-center md:flex-nowrap items-center gap-6 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
        <div className="hidden md:flex items-center gap-2 pr-2 border-r border-gray-700/50">
          <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
          <span className="text-white text-xs font-black tracking-widest drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]">ALIVEMAP</span>
        </div>
        
        <div className="flex gap-2 items-center">
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Шахеди:</span>
          <span className="text-red-500 font-black text-base drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">{dronesCount}</span>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Ракети:</span>
          <span className="text-orange-500 font-black text-base drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]">{missilesCount}</span>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Літаки:</span>
          <span className="text-blue-500 font-black text-base drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">{aircraftCount}</span>
        </div>
        
        <div className="hidden md:block h-5 w-px bg-gray-700/50"></div>
        
        <div className="flex gap-2 items-center">
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Тривоги:</span>
          <span className="text-white font-black text-base drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">{alertsCount}</span>
        </div>
      </div>
    </div>
  );
}
