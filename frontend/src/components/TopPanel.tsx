"use client";

import { useStore } from '../store/useStore';
import { Activity, Users, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function TopPanel() {
  const [time, setTime] = useState('');

  useEffect(() => {
    setTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex justify-between pointer-events-none">
      <div className="flex gap-4">
        <div className="bg-[#0a0f18]/80 backdrop-blur-md border border-gray-800 rounded-lg px-4 py-2 flex items-center gap-3 pointer-events-auto shadow-lg">
          <Activity className="w-5 h-5 text-green-500 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 uppercase">System Status</span>
            <span className="text-sm font-semibold text-green-400">ONLINE</span>
          </div>
        </div>

        <div className="bg-[#0a0f18]/80 backdrop-blur-md border border-gray-800 rounded-lg px-4 py-2 flex items-center gap-3 pointer-events-auto shadow-lg">
          <Users className="w-5 h-5 text-blue-500" />
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 uppercase">Connected</span>
            <span className="text-sm font-semibold text-white">1,245</span>
          </div>
        </div>
      </div>

      <div className="bg-[#0a0f18]/80 backdrop-blur-md border border-gray-800 rounded-lg px-4 py-2 flex items-center gap-3 pointer-events-auto shadow-lg">
        <Clock className="w-5 h-5 text-gray-400" />
        <span className="text-sm font-semibold tracking-wider font-mono">{time}</span>
      </div>
    </div>
  );
}
