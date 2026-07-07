import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Wifi, WifiOff } from 'lucide-react';

export default function MobileTopBar() {
  const { threats, alerts } = useStore();
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

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-40"
         style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="h-14 bg-black/60 backdrop-blur-2xl border-b border-white/[0.06] flex items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="relative w-7 h-7 flex items-center justify-center">
            <img src="/logo.png" alt="AliveMap" className="w-6 h-6 object-contain" />
          </div>
          <h1 className="text-sm font-black tracking-[0.15em] text-white uppercase">
            Alive<span className="text-red-500">Map</span>
          </h1>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-3">
          {/* Connection */}
          <div className={`flex items-center gap-1 ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
            {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
          </div>

          {/* Alert count */}
          {alertCount > 0 && (
            <div className="flex items-center gap-1 bg-red-500/15 border border-red-500/20 px-2 py-0.5 rounded-lg">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-red-400">{alertCount}</span>
            </div>
          )}

          {/* Time */}
          <div className="text-gray-400 font-mono text-xs font-semibold tabular-nums">
            {time.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
}
