import React from 'react';
import { Map, List, Activity, Info } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function MobileBottomNav() {
  const { activeTab, setActiveTab, setAboutOpen } = useStore();

  return (
    <div className="lg:hidden fixed bottom-6 left-4 right-4 h-16 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/5 flex items-center justify-around z-50 shadow-[0_20px_40px_rgba(0,0,0,0.7)]">
      <button 
        onClick={() => setActiveTab('MAP')}
        className={`relative flex flex-col items-center justify-center w-1/4 h-full transition-all duration-300 ${activeTab === 'MAP' ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
      >
        <Map size={24} strokeWidth={activeTab === 'MAP' ? 2.5 : 2} className={`transition-transform duration-300 ${activeTab === 'MAP' ? '-translate-y-1' : ''}`} />
        <span className={`text-[10px] font-bold tracking-wider absolute bottom-2 transition-all duration-300 ${activeTab === 'MAP' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>МАПА</span>
        {activeTab === 'MAP' && <div className="absolute top-1 w-1 h-1 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,1)]" />}
      </button>
      
      <button 
        onClick={() => setActiveTab('SUMMARY')}
        className={`relative flex flex-col items-center justify-center w-1/4 h-full transition-all duration-300 ${activeTab === 'SUMMARY' ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
      >
        <List size={24} strokeWidth={activeTab === 'SUMMARY' ? 2.5 : 2} className={`transition-transform duration-300 ${activeTab === 'SUMMARY' ? '-translate-y-1' : ''}`} />
        <span className={`text-[10px] font-bold tracking-wider absolute bottom-2 transition-all duration-300 ${activeTab === 'SUMMARY' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>ЗВЕДЕННЯ</span>
        {activeTab === 'SUMMARY' && <div className="absolute top-1 w-1 h-1 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,1)]" />}
      </button>
      
      <button 
        onClick={() => setActiveTab('MONITORING')}
        className={`relative flex flex-col items-center justify-center w-1/4 h-full transition-all duration-300 ${activeTab === 'MONITORING' ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
      >
        <Activity size={24} strokeWidth={activeTab === 'MONITORING' ? 2.5 : 2} className={`transition-transform duration-300 ${activeTab === 'MONITORING' ? '-translate-y-1' : ''}`} />
        <span className={`text-[10px] font-bold tracking-wider absolute bottom-2 transition-all duration-300 ${activeTab === 'MONITORING' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>СТРІЧКА</span>
        {activeTab === 'MONITORING' && <div className="absolute top-1 w-1 h-1 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,1)]" />}
      </button>
      
      <button 
        onClick={() => setAboutOpen(true)}
        className="relative flex flex-col items-center justify-center w-1/4 h-full text-gray-500 hover:text-gray-300 transition-all duration-300"
      >
        <Info size={24} strokeWidth={2} className="transition-transform duration-300" />
      </button>
    </div>
  );
}
