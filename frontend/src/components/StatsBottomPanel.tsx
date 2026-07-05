import React from 'react';
import { useStore } from '../store/useStore';

export default function StatsBottomPanel() {
  const { threats } = useStore();
  
  const alertsCount = threats.filter(t => t.type === 'ALERT').length;
  const targetsCount = threats.filter(t => t.type !== 'ALERT').length;
  const onlineCount = Math.floor(Math.random() * 5000) + 2000; // Mock online count

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-30">
      {/* Stats Pill - Premium Dark Edition */}
      <div className="bg-[#070b14]/90 backdrop-blur-lg border border-gray-700/50 rounded-full px-6 py-3 flex items-center gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
          <span className="text-white text-sm font-bold tracking-widest drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]">ALIVEMAP</span>
        </div>
        <div className="h-5 w-px bg-gray-700"></div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-400 font-medium">Тривоги</span>
          <span className="text-red-500 font-bold">{alertsCount}</span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-400 font-medium">Цілі</span>
          <span className="text-white font-bold drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]">{targetsCount}</span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-400 font-medium">Онлайн</span>
          <span className="text-green-400 font-bold drop-shadow-[0_0_8px_rgba(74,222,128,0.3)]">{onlineCount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
