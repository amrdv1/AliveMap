import React, { useState, useEffect } from 'react';
import { Activity, Menu, Radar } from 'lucide-react';

export default function MobileTopBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="lg:hidden h-14 bg-[#010a1b] border-b border-gray-800/50 flex items-center justify-between px-4 z-40 absolute top-0 w-full pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2">
        <div className="relative flex items-center justify-center w-8 h-8">
          <img src="/logo.png" alt="AliveMap Logo" className="relative z-10 w-6 h-6 object-contain" />
        </div>
        <h1 className="text-lg font-bold tracking-widest text-white flex items-center gap-1 uppercase">
          Alive<span className="text-red-500">Map</span>
        </h1>
      </div>

      <div className="pointer-events-auto flex items-center gap-3">
        <div className="text-gray-300 font-mono text-sm">
          {time.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <Menu className="text-gray-400 w-6 h-6" />
      </div>
    </div>
  );
}
