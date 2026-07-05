"use client";

import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import LegendSidebar from '@/components/LegendSidebar';
import Navbar from '@/components/Navbar';
import MobileTopBar from '@/components/MobileTopBar';
import MobileBottomNav from '@/components/MobileBottomNav';
import MobileBottomSheet from '@/components/MobileBottomSheet';

import MonitoringFeed from '@/components/MonitoringFeed';
import StatsBottomPanel from '@/components/StatsBottomPanel';
import AboutModal from '@/components/AboutModal';

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#05070A]" />
});

export default function Home() {
  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden font-sans text-white bg-black">
      <AboutModal />
      {/* Background Map Layer */}
      <div className="absolute inset-0 z-0">
        <Map />
      </div>

      {/* Floating Desktop UI */}
      <div className="hidden lg:block">
        <Navbar />
        <MonitoringFeed />
        
        {/* Top Right: Active Targets */}
        <div className="absolute top-24 right-6 z-20">
          <div className="bg-[#070b14]/80 backdrop-blur-md rounded-2xl border border-gray-800/50 shadow-xl overflow-hidden max-h-[50vh] w-80">
            <Sidebar />
          </div>
        </div>

        {/* Bottom Right: Legend */}
        <div className="absolute bottom-24 right-6 z-20">
          <div className="bg-[#070b14]/80 backdrop-blur-md rounded-2xl border border-gray-800/50 shadow-xl overflow-hidden h-72 w-80">
            <LegendSidebar />
          </div>
        </div>

        <StatsBottomPanel />
      </div>

      {/* Floating Mobile UI */}
      <div className="block lg:hidden">
        <MobileTopBar />
        <MobileBottomSheet />
        <MobileBottomNav />
      </div>
    </main>
  );
}
