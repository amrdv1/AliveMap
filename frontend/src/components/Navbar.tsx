import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Target, Info, ShieldAlert, Cpu, Map as MapIcon, Radar } from 'lucide-react';

import CitySearch from './CitySearch';

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
    <div className="absolute top-4 left-4 right-4 h-16 bg-[#050505]/95 backdrop-blur-2xl rounded-3xl flex items-center justify-between px-6 z-30 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
      {/* Logo */}
      <div className="flex items-center gap-3 w-48">
        <div className="relative flex items-center justify-center w-8 h-8">
          <img src="/logo.png" alt="AliveMap Logo" className="relative z-10 w-7 h-7 object-contain" />
        </div>
        <h1 className="text-lg font-bold tracking-widest text-white/90 flex items-center gap-1 uppercase">
          Alive<span className="text-red-500">Map</span>
        </h1>
      </div>

      {/* Tabs */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/5">
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

      {/* Search & Time & Live Indicator */}
      <div className="flex items-center justify-end gap-4 w-auto">
        <div className="hidden lg:block w-48 lg:w-64">
          <CitySearch />
        </div>
        <div className="text-gray-300 font-mono text-lg font-medium drop-shadow-md">
          {mounted ? time.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
        </div>
        <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]"></div>
          <span className="text-red-500 text-xs font-black tracking-widest uppercase">НАЖИВО</span>
        </div>
      </div>
      
    </div>
  );
}
