"use client";

import { useStore } from '../store/useStore';
import { Settings, Filter, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const { threats, filters, setFilter } = useStore();

  const activeThreats = threats.filter(t => t.status === 'ACTIVE');
  const dronesCount = activeThreats.filter(t => t.type === 'DRONE').length;
  const missilesCount = activeThreats.filter(t => t.type === 'MISSILE' || t.type === 'CRUISE_MISSILE' || t.type === 'BALLISTIC_MISSILE').length;
  const kabCount = activeThreats.filter(t => t.type === 'KAB').length;

  return (
    <div className="w-80 h-full bg-[#0a0f18] text-white p-4 border-r border-gray-800 flex flex-col z-20 shadow-2xl overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4 tracking-wider flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          LIVE FEED
        </h2>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-[#121a28] p-2 rounded text-center border border-gray-800">
            <div className="text-2xl font-bold text-yellow-500">{dronesCount}</div>
            <div className="text-xs text-gray-500">UAVs</div>
          </div>
          <div className="bg-[#121a28] p-2 rounded text-center border border-gray-800">
            <div className="text-2xl font-bold text-red-500">{missilesCount}</div>
            <div className="text-xs text-gray-500">Missiles</div>
          </div>
          <div className="bg-[#121a28] p-2 rounded text-center border border-gray-800">
            <div className="text-2xl font-bold text-purple-500">{kabCount}</div>
            <div className="text-xs text-gray-500">KABs</div>
          </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col gap-3">
        {threats.slice(0, 50).map(threat => (
          <div key={threat.id} className="bg-[#121a28] rounded p-3 text-sm border border-gray-800 hover:border-gray-600 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                threat.type === 'DRONE' ? 'bg-yellow-500/20 text-yellow-500' :
                threat.type === 'BALLISTIC_MISSILE' ? 'bg-orange-500/20 text-orange-500' :
                threat.type === 'KAB' ? 'bg-purple-500/20 text-purple-500' :
                threat.type === 'AIRCRAFT' ? 'bg-blue-500/20 text-blue-500' :
                threat.type === 'ALERT' ? 'bg-red-500/20 text-red-500' :
                'bg-red-500/20 text-red-500'
              }`}>
                {threat.type}
              </span>
              <span className="text-gray-500 text-xs">
                {new Date(threat.updatedAt).toLocaleTimeString()}
              </span>
            </div>
            {threat.speed && <div className="text-gray-400 mt-1 text-xs">Speed: {Math.round(threat.speed)} km/h</div>}
            {threat.course && <div className="text-gray-400 text-xs">Course: {Math.round(threat.course)}°</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
