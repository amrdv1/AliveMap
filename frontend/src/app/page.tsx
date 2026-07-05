"use client";

import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import LegendSidebar from '@/components/LegendSidebar';
import Navbar from '@/components/Navbar';
import MobileTopBar from '@/components/MobileTopBar';
import MobileBottomNav from '@/components/MobileBottomNav';
import MobileBottomSheet from '@/components/MobileBottomSheet';

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#05070A]" />
});

export default function Home() {
  return (
    <main className="flex flex-col h-[100dvh] w-screen bg-[#050A14] overflow-hidden font-sans text-white">
      <div className="hidden lg:block">
        <Navbar />
      </div>
      <MobileTopBar />
      <div className="flex flex-1 relative overflow-hidden">
        <LegendSidebar />
        <div className="flex-1 relative z-0">
          <Map />
        </div>
        <Sidebar />
      </div>
      <MobileBottomSheet />
      <MobileBottomNav />
    </main>
  );
}
