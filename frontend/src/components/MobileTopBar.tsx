import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Wifi, WifiOff, Menu, Map as MapIcon, List, Activity, Info } from 'lucide-react';
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
         style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + var(--tg-safe-area-inset-top, 0px) + 36px)' }}>
      <div className="h-14 mx-3 bg-black/60 backdrop-blur-3xl border border-white/[0.1] rounded-2xl flex items-center justify-between px-4 pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="relative w-7 h-7 flex items-center justify-center">
            <img src="/logo.png" alt="AliveMap" className="w-6 h-6 object-contain" />
          </div>
          <h1 className="text-sm font-black tracking-[0.15em] text-white uppercase">
            Alive<span className="text-red-500">Map</span>
          </h1>
        </div>

        {/* Status & Menu */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1 ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          </div>

          <div className="text-gray-300 font-mono text-xs font-semibold tabular-nums">
            {time.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 hover:bg-white/10 active:bg-white/15 rounded-xl transition-colors ml-1 text-gray-300 hover:text-white">
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-4 mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden pointer-events-auto"
          >
            <div className="flex flex-col p-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setMenuOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-red-500/10 text-red-500' : 'text-gray-300 hover:bg-white/5'}`}
                  >
                    <Icon size={18} />
                    <span className="text-xs font-bold tracking-wider">{tab.label}</span>
                    {tab.id === 'MAP' && activeThreatsCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
                        {activeThreatsCount}
                      </span>
                    )}
                  </button>
                );
              })}
              <div className="h-px bg-white/10 my-1 mx-2" />
              <button
                onClick={() => { setAboutOpen(true); setMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 transition-colors"
              >
                <Info size={18} />
                <span className="text-xs font-bold tracking-wider">ІНФО</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
