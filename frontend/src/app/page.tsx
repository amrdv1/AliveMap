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

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#05070A]" />
});

export default function Home() {
  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden font-sans text-white bg-black">
      {/* Background Map Layer */}
      <div className="absolute inset-0 z-0">
        <Map />
      </div>

      {/* Floating Desktop UI */}
      <div className="hidden lg:block">
        <Navbar />
        <MonitoringFeed />
        <div className="absolute top-24 right-6 z-20 flex flex-col gap-4">
          {/* We keep Legend on the right side for now, or just let users figure it out. Let's wrap Sidebar to make it floating */}
          <div className="bg-[#070b14]/90 backdrop-blur-md rounded-2xl border border-gray-800/50 shadow-xl overflow-hidden h-96 w-80">
            <Sidebar />
          </div>
          <div className="bg-[#070b14]/90 backdrop-blur-md rounded-2xl border border-gray-800/50 shadow-xl overflow-hidden h-96 w-80">
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
