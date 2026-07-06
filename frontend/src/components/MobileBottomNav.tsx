import React from 'react';
import { Map, List, Activity, Info } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function MobileBottomNav() {
  const { activeTab, setActiveTab, setAboutOpen } = useStore();

  return (
    <div className="lg:hidden fixed bottom-6 left-4 right-4 h-16 bg-black/60 backdrop-blur-2xl rounded-3xl border border-white/10 flex items-center justify-around z-50 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <button 
        onClick={() => setActiveTab('MAP')}
        className={`flex flex-col items-center justify-center gap-1 w-1/4 transition-colors duration-300 ${activeTab === 'MAP' ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'text-gray-400 hover:text-white'}`}
      >
        <Map size={22} strokeWidth={activeTab === 'MAP' ? 2.5 : 2} />
        <span className="text-[10px] font-semibold tracking-wide">Мапа</span>
      </button>
      
      <button 
        onClick={() => setActiveTab('SUMMARY')}
        className={`flex flex-col items-center justify-center gap-1 w-1/4 transition-colors duration-300 ${activeTab === 'SUMMARY' ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'text-gray-400 hover:text-white'}`}
      >
        <List size={22} strokeWidth={activeTab === 'SUMMARY' ? 2.5 : 2} />
        <span className="text-[10px] font-semibold tracking-wide">Зведення</span>
      </button>
      
      <button 
        onClick={() => setActiveTab('MONITORING')}
        className={`flex flex-col items-center justify-center gap-1 w-1/4 transition-colors duration-300 ${activeTab === 'MONITORING' ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'text-gray-400 hover:text-white'}`}
      >
        <Activity size={22} strokeWidth={activeTab === 'MONITORING' ? 2.5 : 2} />
        <span className="text-[10px] font-semibold tracking-wide">Стрічка</span>
      </button>
      
      <button 
        onClick={() => setAboutOpen(true)}
        className="flex flex-col items-center justify-center text-gray-400 hover:text-white gap-1 w-1/4 transition-colors duration-300"
      >
        <Info size={22} />
        <span className="text-[10px] font-semibold tracking-wide">Інфо</span>
      </button>
    </div>
  );
}
