import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Target, Info, ShieldAlert, Cpu, Map as MapIcon, Radar } from 'lucide-react';

export default function Navbar() {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const { setAboutOpen, activeTab, setActiveTab } = useStore();

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute top-4 left-4 right-4 h-16 bg-[#070b14]/70 backdrop-blur-xl rounded-2xl flex items-center justify-between px-6 z-30 border border-white/10 shadow-lg">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-8 h-8">
          <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
          <Radar className="text-red-500 relative z-10 w-6 h-6 animate-[spin_4s_linear_infinite]" />
        </div>
        <h1 className="text-lg font-bold tracking-widest text-white/90 flex items-center gap-1 uppercase">
          Alive<span className="text-red-500">Map</span>
        </h1>
      </div>

      {/* Tabs */}
      <div className="hidden md:flex items-center gap-2">
        <button 
          onClick={() => setActiveTab('MAP')}
          className={`px-5 py-2 rounded-xl text-sm font-bold tracking-widest uppercase transition-all ${
            activeTab === 'MAP' ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white/80 hover:bg-white/5'
          }`}>
          Мапа
        </button>
        <button 
          onClick={() => setActiveTab('SUMMARY')}
          className={`px-5 py-2 rounded-xl text-sm font-bold tracking-widest uppercase transition-all ${
            activeTab === 'SUMMARY' ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white/80 hover:bg-white/5'
          }`}>
          Зведення
        </button>
        <button 
          onClick={() => setActiveTab('MONITORING')}
          className={`px-5 py-2 rounded-xl text-sm font-bold tracking-widest uppercase transition-all ${
            activeTab === 'MONITORING' ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white/80 hover:bg-white/5'
          }`}>
          Моніторинг
        </button>
        <button 
          onClick={() => setAboutOpen(true)}
          className="px-5 py-2 rounded-xl text-sm font-bold tracking-widest uppercase text-white/40 hover:text-white/80 hover:bg-white/5 transition-all">
          Інфо
        </button>
      </div>

      {/* Time & Live Indicator */}
      <div className="flex items-center gap-4">
        <div className="text-gray-300 font-mono text-lg font-medium drop-shadow-md">
          {mounted ? time.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
        </div>
        <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]"></div>
          <span className="text-red-500 text-xs font-black tracking-widest uppercase">LIVE</span>
        </div>
      </div>
      
      {/* About Modal */}
      {useStore((state) => state.isAboutOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md" onClick={() => setAboutOpen(false)}>
          <div className="bg-[#05080f] border border-gray-800 rounded-3xl p-8 w-[550px] shadow-[0_0_50px_rgba(0,0,0,1)] relative overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Background glowing effects */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none"></div>
            
            <button className="absolute top-5 right-5 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors" onClick={() => setAboutOpen(false)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
                <Radar className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-wider">ALIVEMAP</h2>
                <p className="text-red-400 text-sm font-bold tracking-widest uppercase">Система Моніторингу</p>
              </div>
            </div>
            
            <div className="space-y-4 text-sm text-gray-300 font-medium">
              <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <ShieldAlert className="w-6 h-6 text-orange-400 shrink-0" />
                <p><strong className="text-white">Збір даних:</strong> Система автоматично моніторить десятки Telegram-каналів ОВА та перевірених джерел.</p>
              </div>
              <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <Cpu className="w-6 h-6 text-blue-400 shrink-0" />
                <p><strong className="text-white">ШІ-аналіз:</strong> Кожне повідомлення обробляється штучним інтелектом (Google Gemini) для визначення типу та вектора загрози.</p>
              </div>
              <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <MapIcon className="w-6 h-6 text-green-400 shrink-0" />
                <p><strong className="text-white">Трекінг:</strong> Маркери плавно переміщуються по карті в реальному часі на основі курсу та швидкості цілей.</p>
              </div>
            </div>
            
            <div className="mt-8 pt-5 border-t border-gray-800/50 flex justify-between items-center text-xs font-semibold text-gray-600 uppercase tracking-widest">
              <span>ALIVEMAP v1.0.0</span>
              <span>Слава Україні</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
