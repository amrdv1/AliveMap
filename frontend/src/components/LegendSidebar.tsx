import React from 'react';
import { ThreatIcon } from './ThreatIcon';

export default function LegendSidebar() {
  return (
    <div className="hidden lg:flex w-64 h-full bg-[#070b14]/90 backdrop-blur-md border-r border-gray-800/50 flex-col z-20 text-white overflow-y-auto custom-scrollbar">
      <div className="p-6 flex-1">
        
        <h3 className="text-gray-500 text-xs font-bold tracking-widest mb-6 uppercase">Типи цілей</h3>
        
        <div className="flex flex-col gap-5 mb-10">
          <LegendItem type="DRONE" label="БПЛА" />
          <LegendItem type="CRUISE_MISSILE" label="КРИЛАТА РАКЕТА" />
          <LegendItem type="BALLISTIC_MISSILE" label="БАЛІСТИЧНА РАКЕТА" />
          <LegendItem type="AIRCRAFT" label="АВІАЦІЯ" />
          <LegendItem type="PPO" label="ППО" />
          <LegendItem type="KAB" label="КАБ" />
          <LegendItem type="RECON" label="РОЗВІДКА" />
        </div>

        <h3 className="text-gray-500 text-xs font-bold tracking-widest mb-6 uppercase">Рівень небезпеки</h3>
        
        <div className="flex flex-col gap-4">
          <ThreatLevel color="bg-green-500" label="НИЗЬКИЙ" />
          <ThreatLevel color="bg-yellow-500" label="ПІДВИЩЕНИЙ" />
          <ThreatLevel color="bg-orange-500" label="ВИСОКИЙ" />
          <ThreatLevel color="bg-red-600" label="КРИТИЧНИЙ" />
        </div>
        
      </div>
    </div>
  );
}

function LegendItem({ type, label }: { type: string, label: string }) {
  return (
    <div className="flex items-center gap-4 opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
      <div className="w-6 flex justify-center">
        <ThreatIcon type={type} className="w-5 h-5" />
      </div>
      <span className="text-xs font-medium tracking-wide">{label}</span>
    </div>
  );
}

function ThreatLevel({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-4 opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
      <div className={`w-4 h-4 rounded ${color} shadow-lg shadow-${color.replace('bg-', '')}/20`}></div>
      <span className="text-xs font-medium tracking-wide">{label}</span>
    </div>
  );
}
