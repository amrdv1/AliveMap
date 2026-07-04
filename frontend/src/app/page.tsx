import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import TopPanel from '@/components/TopPanel';
import BottomPanel from '@/components/BottomPanel';

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#05070A]" />
});

export default function Home() {
  return (
    <main className="flex h-screen w-full bg-[#05070A] overflow-hidden text-white font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col relative">
        <TopPanel />
        <div className="flex-1 relative">
          <Map />
        </div>
        <BottomPanel />
      </div>
    </main>
  );
}
