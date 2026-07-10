import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Target, Info, ShieldAlert, Cpu, Map as MapIcon, Radar } from 'lucide-react';

import CitySearch from './CitySearch';
import Logo from './Logo';

export default function Navbar() {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const { setAboutOpen, activeTab, setActiveTab } = useStore();

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="absolute top-4 left-4 right-4 h-[64px] bg-[#0a0a0a]/85 backdrop-blur-3xl flex items-center justify-between px-6 z-30 border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-full">
      {/* Logo */}
      <div className="flex items-center gap-3 pl-2">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <Logo className="w-10 h-10 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)] rounded-xl object-contain" />
        </div>
        <h1 className="text-xl font-black tracking-widest text-white uppercase">
          ALIVE<span className="text-red-600">MAP</span>
        </h1>
      </div>

      {/* Tabs */}
      <div className="hidden md:flex flex-1 justify-center px-2 min-w-0">
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar max-w-full">
        <button 
          onClick={() => setActiveTab('MAP')}
          className={`px-5 py-2 rounded-xl text-sm font-semibold tracking-widest uppercase transition-all duration-300 ${
            activeTab === 'MAP' ? 'bg-white/15 text-white shadow-sm' : 'text-white/40 hover:text-white/80 hover:bg-white/5'
          }`}>
          Мапа
        </button>
        <button 
          onClick={() => setActiveTab('SUMMARY')}
          className={`px-5 py-2 rounded-xl text-sm font-semibold tracking-widest uppercase transition-all duration-300 ${
            activeTab === 'SUMMARY' ? 'bg-white/15 text-white shadow-sm' : 'text-white/40 hover:text-white/80 hover:bg-white/5'
          }`}>
          Зведення
        </button>
        <button 
          onClick={() => setActiveTab('MONITORING')}
          className={`px-5 py-2 rounded-xl text-sm font-semibold tracking-widest uppercase transition-all duration-300 ${
            activeTab === 'MONITORING' ? 'bg-white/15 text-white shadow-sm' : 'text-white/40 hover:text-white/80 hover:bg-white/5'
          }`}>
          Моніторинг
        </button>
        <button 
          onClick={() => setAboutOpen(true)}
          className="px-5 py-2 rounded-xl text-sm font-semibold tracking-widest uppercase text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-300">
          Інфо
        </button>
      </div>
      </div>

      {/* Search & Time & Live Indicator */}
      <div className="flex items-center justify-end gap-2 lg:gap-4 shrink-0">
        <div className="w-32 lg:w-56 shrink-0">
          <CitySearch />
        </div>
        <div className="text-gray-300 font-mono text-sm lg:text-lg font-medium drop-shadow-md shrink-0">
          {mounted ? time.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-red-500/10 px-2 lg:px-3 py-1.5 rounded-full border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)] shrink-0">
          <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]"></div>
          <span className="text-red-500 text-[10px] lg:text-xs font-black tracking-widest uppercase">НАЖИВО</span>
        </div>
      </div>
      
    </div>
  );
}
