import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Settings, Map as MapIcon, Layers, Flame, Box } from 'lucide-react';
import Logo from './Logo';

export default function StatsBottomPanel() {
  const { threats, alerts, mapMode, is3D, showHeatmap, setMapMode, setIs3D, setShowHeatmap } = useStore();
  const [showSettings, setShowSettings] = useState(false);
  
  const activeThreats = threats.filter(t => t.status === 'ACTIVE');
  
  // Count active regions from siren.pp.ua
  const alertsCount = Object.values(alerts).filter(a => a?.alertnow === true).length;
  
  const totalCount = activeThreats.length;
  const dronesCount = activeThreats.filter(t => t.type === 'DRONE' || t.type === 'FPV').length;
  const missilesCount = activeThreats.filter(t => ['CRUISE_MISSILE', 'BALLISTIC_MISSILE', 'MISSILE', 'ZIRCON', 'KH101', 'ISKANDER', 'KINZHAL', 'KALIBR'].includes(t.type)).length;
  const aircraftCount = activeThreats.filter(t => t.type === 'AIRCRAFT').length;

  return (
    <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-3 z-30 pointer-events-none">
      {/* Stats Pill - Premium Glass Edition */}
      <div className="pointer-events-auto bg-black/40 backdrop-blur-xl border border-white/10 rounded-full pl-4 pr-8 py-3 flex items-center gap-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        
        {/* Gear Icon replacing logo */}
        <div className="relative flex items-center gap-2 pr-4 border-r border-gray-700/50">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 flex items-center justify-center text-gray-300 hover:text-white"
          >
            <Settings size={18} />
          </button>
          
          {showSettings && (
            <div className="absolute bottom-[calc(100%+16px)] left-0 flex flex-col gap-2 bg-black/90 backdrop-blur-2xl border border-white/10 p-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 w-48">
              <button 
                onClick={() => { setMapMode(mapMode === 'dark' ? 'satellite' : 'dark'); setShowSettings(false); }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors bg-white/5 hover:bg-white/10 text-gray-200"
              >
                {mapMode === 'dark' ? <MapIcon size={16} className="text-blue-400" /> : <Layers size={16} className="text-gray-400" />}
                <span className="text-sm">{mapMode === 'dark' ? 'Супутник' : 'Темна Карта'}</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Logo className="w-5 h-5" />
            <span className="text-white text-xs font-black tracking-widest drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]">ALIVEMAP</span>
          </div>
        </div>
        
        <div className="flex gap-2 items-center">
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Тривоги:</span>
          <span className="text-white font-black text-base drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">{alertsCount}</span>
        </div>
        
        <div className="hidden md:block h-5 w-px border-r border-gray-700/50"></div>
        
        <div className="flex gap-2 items-center">
          <span className="text-white text-sm font-bold tracking-widest uppercase">Цілі: <span className="text-white/90 ml-1">{totalCount}</span></span>
        </div>

        <div className="hidden md:block h-5 w-px bg-gray-700/50"></div>

        <div className="flex gap-2 items-center">
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Шахеди/FPV:</span>
          <span className="text-red-500 font-black text-base drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">{dronesCount}</span>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Ракети:</span>
          <span className="text-orange-500 font-black text-base drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]">{missilesCount}</span>
        </div>
      </div>
    </div>
  );
}
