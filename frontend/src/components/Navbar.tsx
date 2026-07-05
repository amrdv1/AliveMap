import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

export default function Navbar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-16 bg-[#070b14] border-b border-gray-800/50 flex items-center justify-between px-6 z-30 relative shadow-md">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-8 h-8 bg-red-600 rounded-full opacity-20 blur-md animate-pulse"></div>
          <Activity className="text-red-500 w-6 h-6 relative z-10" />
        </div>
        <h1 className="text-xl font-bold tracking-widest text-white flex items-center gap-1">
          Alive<span className="text-red-500">Map</span>
        </h1>
      </div>

      {/* Tabs */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wider">
        <div className="text-white border-b-2 border-white pb-1 cursor-pointer">МАПА</div>
        <div className="text-gray-500 hover:text-gray-300 cursor-pointer pb-1 transition-colors">ЗВЕДЕННЯ</div>
        <div className="text-gray-500 hover:text-gray-300 cursor-pointer pb-1 transition-colors">СТАТИСТИКА</div>
        <div className="text-gray-500 hover:text-gray-300 cursor-pointer pb-1 transition-colors">НОВИНИ</div>
        <div className="text-gray-500 hover:text-gray-300 cursor-pointer pb-1 transition-colors">ПРО НАС</div>
      </div>

      {/* Time & Live Indicator */}
      <div className="flex items-center gap-4">
        <div className="text-gray-300 font-mono text-lg">
          {time.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-red-500 text-xs font-bold tracking-widest">LIVE</span>
        </div>
      </div>
    </div>
  );
}
