import React from 'react';
import { Map, List, Activity, Info } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function MobileBottomNav() {
  const { activeTab, setActiveTab, setAboutOpen, threats } = useStore();
  const activeCount = threats.filter(t => t.status === 'ACTIVE').reduce((acc, t) => acc + (t.quantity || 1), 0);

  const tabs = [
    { id: 'MAP' as const, icon: Map, label: 'МАПА' },
    { id: 'SUMMARY' as const, icon: List, label: 'ЗВЕДЕННЯ' },
    { id: 'MONITORING' as const, icon: Activity, label: 'СТРІЧКА' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Glass container with safe area */}
      <div className="mx-3 mb-2 h-[60px] bg-black/85 backdrop-blur-2xl rounded-2xl border border-white/[0.08] flex items-center justify-around shadow-[0_-4px_30px_rgba(0,0,0,0.6)]"
           style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all duration-200 active:scale-90 ${
                isActive ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                {tab.id === 'MAP' && activeCount > 0 && (
                  <div className="absolute -top-1 -right-2.5 bg-red-500 text-white text-[8px] font-black min-w-[14px] h-[14px] flex items-center justify-center rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                    {activeCount}
                  </div>
                )}
              </div>
              <span className={`text-[9px] font-bold tracking-wider transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute top-0 w-8 h-[2px] bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              )}
            </button>
          );
        })}
        <button
          onClick={() => setAboutOpen(true)}
          className="relative flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-gray-500 active:scale-90 transition-all"
        >
          <Info size={22} strokeWidth={1.8} />
          <span className="text-[9px] font-bold tracking-wider opacity-40">ІНФО</span>
        </button>
      </div>
    </div>
  );
}
