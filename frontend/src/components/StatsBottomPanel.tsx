import React from 'react';
import { useStore } from '../store/useStore';

export default function StatsBottomPanel() {
  const { threats } = useStore();
  
  const alertsCount = threats.filter(t => t.type === 'ALERT').length;
  const targetsCount = threats.filter(t => t.type !== 'ALERT').length;
  const onlineCount = Math.floor(Math.random() * 5000) + 2000; // Mock online count

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-30">
      
      {/* Action Buttons (Mockup style) */}
      <div className="bg-white rounded-2xl shadow-xl p-2 flex gap-2">
        <div className="flex items-center gap-3 px-4 py-2 border-r border-gray-100">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">Хлопці пишуть в Telegram</div>
            <div className="text-[10px] text-gray-400">Приєднуйтесь до спільноти моніторингу</div>
          </div>
          <button className="ml-2 bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-xl">Підписатися</button>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">Додаток ALIVEMAP</div>
            <div className="text-[10px] text-gray-400">Push-сповіщення про тривоги</div>
          </div>
          <div className="ml-2 flex gap-1">
            <button className="bg-black text-white text-[10px] font-bold px-3 py-2 rounded-xl flex items-center gap-1">
              Google Play
            </button>
            <button className="bg-black text-white text-[10px] font-bold px-3 py-2 rounded-xl flex items-center gap-1">
              App Store
            </button>
          </div>
        </div>
      </div>

      {/* Stats Pill */}
      <div className="bg-[#0f111a] border border-gray-800 rounded-full px-6 py-2 flex items-center gap-6 shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-white text-xs font-bold">ALIVEMAP</span>
        </div>
        <div className="h-4 w-px bg-gray-800"></div>
        <div className="flex gap-1 text-xs">
          <span className="text-gray-400">Тривоги</span>
          <span className="text-red-500 font-bold">{alertsCount}</span>
        </div>
        <div className="flex gap-1 text-xs">
          <span className="text-gray-400">Цілі</span>
          <span className="text-white font-bold">{targetsCount}</span>
        </div>
        <div className="flex gap-1 text-xs">
          <span className="text-gray-400">Онлайн</span>
          <span className="text-green-400 font-bold">{onlineCount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
