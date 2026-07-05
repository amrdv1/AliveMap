import React from 'react';
import { Map, List, Bell, User } from 'lucide-react';

export default function MobileBottomNav() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full h-16 bg-[#070b14]/95 backdrop-blur-md border-t border-gray-800 flex items-center justify-around z-50 pb-safe">
      <div className="flex flex-col items-center justify-center text-red-500 gap-1 w-1/4">
        <Map size={20} />
        <span className="text-[10px] font-medium tracking-wide">Мапа</span>
      </div>
      <div className="flex flex-col items-center justify-center text-gray-500 hover:text-gray-300 gap-1 w-1/4 transition-colors">
        <List size={20} />
        <span className="text-[10px] font-medium tracking-wide">Зведення</span>
      </div>
      <div className="flex flex-col items-center justify-center text-gray-500 hover:text-gray-300 gap-1 w-1/4 transition-colors">
        <Bell size={20} />
        <span className="text-[10px] font-medium tracking-wide">Сповіщення</span>
      </div>
      <div className="flex flex-col items-center justify-center text-gray-500 hover:text-gray-300 gap-1 w-1/4 transition-colors">
        <User size={20} />
        <span className="text-[10px] font-medium tracking-wide">Профіль</span>
      </div>
    </div>
  );
}
