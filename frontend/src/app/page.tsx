"use client";

import dynamic from 'next/dynamic';
import { useStore } from '@/store/useStore';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import MobileTopBar from '@/components/MobileTopBar';
import MobileBottomNav from '@/components/MobileBottomNav';
import MobileBottomSheet from '@/components/MobileBottomSheet';

import MonitoringFeed from '@/components/MonitoringFeed';
import StatsBottomPanel from '@/components/StatsBottomPanel';
import ThreatFilters from '@/components/ThreatFilters';
import SummaryView from '@/components/SummaryView';

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#05070A]" />
});

export default function Home() {
  const { activeTab } = useStore();

  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden font-sans text-white bg-black">
      {/* Background Map Layer */}
      <div className={`absolute inset-0 z-0 ${activeTab !== 'MAP' && 'hidden md:block'}`}>
        <Map />
      </div>

      {/* Global Overlays */}
      {activeTab === 'SUMMARY' && <SummaryView />}

      {/* Floating Desktop UI */}
      <div className="hidden md:block">
        <Navbar />
        {activeTab === 'MAP' && <ThreatFilters />}
        
        {/* Monitoring side panel */}
        {activeTab === 'MONITORING' && (
          <div className="absolute top-24 left-6 bottom-24 z-20 flex flex-col gap-4 w-80 lg:w-[400px]">
             <MonitoringFeed />
          </div>
        )}
        
        {/* Right Side Panels */}
        {activeTab === 'MAP' && (
          <div className="absolute top-28 right-6 bottom-24 z-20 flex flex-col gap-4 w-80">
            <div className="bg-[#070b14]/70 backdrop-blur-xl rounded-2xl border border-white/5 flex-1 min-h-[150px] overflow-hidden shadow-xl">
              <Sidebar />
            </div>
          </div>
        )}

        <StatsBottomPanel />
      </div>

      {/* Floating Mobile UI */}
      <div className="block md:hidden">
        <MobileTopBar />
        
        {activeTab === 'MAP' && <ThreatFilters />}
        
        {activeTab === 'MONITORING' && (
          <div className="absolute inset-0 pt-16 pb-20 z-30 bg-[#05070A]">
            <MonitoringFeed isMobile />
          </div>
        )}
        
        {activeTab === 'MAP' && <MobileBottomSheet />}
        <MobileBottomNav />
      </div>
    </main>
  );
}
