import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Wifi, WifiOff, Map as MapIcon, List, Activity, Info } from 'lucide-react';
import CitySearch from './CitySearch';

export default function MobileTopBar() {
  const { threats, alerts, activeTab, setActiveTab, setAboutOpen } = useStore();
  const [time, setTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);

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
         style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + var(--tg-safe-area-inset-top, 0px) + 12px)' }}>
      
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
            {/* Search (condensed) */}
            <div className="w-32 sm:w-48">
               <CitySearch />
            </div>
            
            <div className={`flex items-center gap-1 ml-1 ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
              {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            </div>
          </div>
        </div>

        {/* Bottom Row: Horizontal Tabs */}
        <div className="h-12 bg-black/60 backdrop-blur-3xl border border-white/[0.1] rounded-2xl flex items-center p-1 pointer-events-auto shadow-lg overflow-x-auto scrollbar-hide">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 h-full rounded-xl transition-colors shrink-0 ${
                  isActive ? 'bg-white/15 text-white shadow-sm' : 'text-gray-400 hover:text-white/80'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-red-500' : ''} />
                <span className="text-xs font-bold tracking-wider">{tab.label}</span>
                {tab.id === 'MAP' && activeThreatsCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
                    {activeThreatsCount}
                  </span>
                )}
              </button>
            );
          })}
          
          <button
            onClick={() => setAboutOpen(true)}
            className="flex items-center gap-2 px-4 h-full rounded-xl text-gray-400 hover:text-white/80 transition-colors shrink-0"
          >
            <Info size={16} />
            <span className="text-xs font-bold tracking-wider">ІНФО</span>
          </button>
        </div>
      </div>
    </div>
  );
}
