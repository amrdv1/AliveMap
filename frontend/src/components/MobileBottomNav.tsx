import React from 'react';
import { Map, List, Activity, Info } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function MobileBottomNav() {
  const { activeTab, setActiveTab, setAboutOpen } = useStore();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full h-16 bg-[#010a1b] border-t border-gray-800 flex items-center justify-around z-50 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      <button 
        onClick={() => setActiveTab('MAP')}
        className={`flex flex-col items-center justify-center gap-1 w-1/4 transition-colors ${activeTab === 'MAP' ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
      >
        <Map size={20} />
        <span className="text-[10px] font-bold tracking-widest uppercase">Мапа</span>
      </button>
      
      <button 
        onClick={() => setActiveTab('SUMMARY')}
        className={`flex flex-col items-center justify-center gap-1 w-1/4 transition-colors ${activeTab === 'SUMMARY' ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
      >
        <List size={20} />
        <span className="text-[10px] font-bold tracking-widest uppercase">Зведення</span>
      </button>
      
      <button 
        onClick={() => setActiveTab('MONITORING')}
        className={`flex flex-col items-center justify-center gap-1 w-1/4 transition-colors ${activeTab === 'MONITORING' ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
      >
        <Activity size={20} />
        <span className="text-[10px] font-bold tracking-widest uppercase">Мон-нг</span>
      </button>
      
      <button 
        onClick={() => setAboutOpen(true)}
        className="flex flex-col items-center justify-center text-gray-500 hover:text-gray-300 gap-1 w-1/4 transition-colors"
      >
        <Info size={20} />
        <span className="text-[10px] font-bold tracking-widest uppercase">Інфо</span>
      </button>
    </div>
  );
}
