import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Wifi, WifiOff, Map as MapIcon, List, Activity, Info, Search } from 'lucide-react';
import CitySearch from './CitySearch';
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="h-[56px] bg-[#0a0a0a]/85 backdrop-blur-3xl border border-white/[0.05] rounded-full flex items-center justify-between px-4 pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <img src="/logo.png" alt="AliveMap" className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            </div>
            <h1 className="text-[15px] font-black tracking-widest text-white uppercase">
              ALIVE<span className="text-red-600">MAP</span>
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            {activeTab !== 'MAP' ? (
              <button 
                onClick={() => setActiveTab('MAP')}
                className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-500 px-3 py-1.5 rounded-full transition-colors border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                <X size={14} strokeWidth={3} />
                <span className="text-[10px] font-black tracking-widest uppercase">Закрити</span>
              </button>
            ) : (
              <>
                <div className={`flex items-center gap-1.5 mr-2 px-3 py-1.5 rounded-full ${isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'} border border-current/10`}>
                  {isOnline ? <Wifi size={12} strokeWidth={3} /> : <WifiOff size={12} strokeWidth={3} />}
                  <span className="text-[10px] font-black tracking-widest">
                    {time.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <button 
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={`p-2 rounded-full transition-all duration-300 ${menuOpen ? 'bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] text-white' : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/[0.05]'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {menuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Dropdown Menu */}
        <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[68px] right-3 w-[280px] bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/5 rounded-[24px] shadow-[0_16px_40px_rgba(0,0,0,0.5)] overflow-hidden pointer-events-auto flex flex-col z-50 p-2"
          >
            <div className="flex flex-col gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMenuOpen(false); }}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-red-500/15 text-red-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={18} strokeWidth={2.5} />
                  <span className="text-[13px] font-black tracking-widest">{tab.label}</span>
                  {tab.id === 'MAP' && activeThreatsCount > 0 && (
                    <span className="ml-auto bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.6)] text-white text-[10px] px-2.5 py-0.5 rounded-full font-black">
                      {activeThreatsCount}
                    </span>
                  )}
                </button>
              );
            })}
            <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent w-full my-1" />
            <button
              onClick={() => { setAboutOpen(true); setMenuOpen(false); }}
              className="flex items-center gap-4 px-4 py-3.5 text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-300 rounded-xl"
            >
              <Info size={18} strokeWidth={2.5} />
              <span className="text-[13px] font-black tracking-widest">ІНФО</span>
            </button>
            </div>
            
            <div className="p-3 bg-white/5 mt-1 rounded-xl">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <CitySearch 
                  onSelect={(loc) => {
                    useStore.getState().setFlyToLocation({ lat: loc.lat, lng: loc.lng });
                    setActiveTab('MAP');
                    setMenuOpen(false);
                  }} 
                  className="w-full bg-black/40 text-white text-xs rounded-lg pl-9 pr-3 py-2.5 outline-none border border-white/5 focus:border-red-500/50 transition-colors placeholder:text-gray-500" 
                />
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}
