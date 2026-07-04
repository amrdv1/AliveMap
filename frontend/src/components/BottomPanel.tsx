"use client";

import { useStore } from '../store/useStore';

export default function BottomPanel() {
  const { reports } = useStore();

  const counts = reports.reduce((acc, report) => {
    acc[report.type] = (acc[report.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none flex justify-center">
      <div className="bg-[#0a0f18]/80 backdrop-blur-md border border-gray-800 rounded-lg px-6 py-3 flex gap-8 pointer-events-auto shadow-xl">
        
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-white">{reports.length}</span>
          <span className="text-xs text-gray-400 uppercase">Total Reports</span>
        </div>
        
        <div className="w-px bg-gray-800"></div>
        
        <div className="flex flex-col items-center min-w-[60px]">
          <span className="text-xl font-bold text-blue-400">{counts['DRONE'] || 0}</span>
          <span className="text-xs text-gray-400 uppercase">Drones</span>
        </div>

        <div className="flex flex-col items-center min-w-[60px]">
          <span className="text-xl font-bold text-red-400">{counts['MISSILE'] || 0}</span>
          <span className="text-xs text-gray-400 uppercase">Missiles</span>
        </div>

        <div className="flex flex-col items-center min-w-[60px]">
          <span className="text-xl font-bold text-yellow-400">{counts['AIRCRAFT'] || 0}</span>
          <span className="text-xs text-gray-400 uppercase">Aircraft</span>
        </div>

      </div>
    </div>
  );
}
