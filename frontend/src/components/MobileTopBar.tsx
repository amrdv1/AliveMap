import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Wifi, WifiOff, Map as MapIcon, List, Activity, Info } from 'lucide-react';
import CitySearch from './CitySearch';

export default function MobileTopBar() {
  const { threats, alerts, activeTab, setActiveTab, setAboutOpen } = useStore();
  const [time, setTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const activeThreatsCount = threats.filter(t => t.status === 'ACTIVE').reduce((acc, t) => acc + (t.quantity || 1), 0);
  const alertCount = Object.values(alerts).filter(a => a.alertnow).length;

  const tabs = [
    { id: 'MAP' as const, icon: MapIcon, label: 'МАПА' },
    { id: 'SUMMARY' as const, icon: List, label: 'ЗВЕДЕННЯ' },
    { id: 'MONITORING' as const, icon: Activity, label: 'СТРІЧКА' },
  ];

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 pointer-events-none"
         style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + var(--tg-safe-area-inset-top, 0px) + 56px)' }}>
      
      <div className="mx-3 flex flex-col gap-2">
        {/* Top Row: Logo & Status & Search */}
        <div className="h-14 bg-black/60 backdrop-blur-3xl border border-white/[0.1] rounded-2xl flex items-center justify-between px-3 pointer-events-auto shadow-lg">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative w-7 h-7 flex items-center justify-center">
              <img src="/logo.png" alt="AliveMap" className="w-6 h-6 object-contain" />
            </div>
            <h1 className="text-sm font-black tracking-[0.15em] text-white uppercase">
              Alive<span className="text-red-500">Map</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 ml-1 ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
              {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
              <span className="text-[11px] font-black tracking-wider text-white">
                {time.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="ml-2 p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10 text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute top-[115px] right-3 w-64 bg-black/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col z-50">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMenuOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    isActive ? 'bg-red-500/10 text-red-500' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-xs font-bold tracking-wider">{tab.label}</span>
                  {tab.id === 'MAP' && activeThreatsCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                      {activeThreatsCount}
                    </span>
                  )}
                </button>
              );
            })}
            <div className="h-[1px] bg-white/10 w-full" />
            <button
              onClick={() => { setAboutOpen(true); setMenuOpen(false); }}
              className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              <Info size={18} />
              <span className="text-xs font-bold tracking-wider">ІНФО</span>
            </button>
            <div className="h-[1px] bg-white/10 w-full" />
            <div className="p-3">
              <CitySearch />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
