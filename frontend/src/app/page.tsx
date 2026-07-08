"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { ShieldAlert, Cpu, Map as MapIcon } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import MobileTopBar from '@/components/MobileTopBar';
import MobileBottomNav from '@/components/MobileBottomNav';
import MobileBottomSheet from '@/components/MobileBottomSheet';

import MonitoringFeed from '@/components/MonitoringFeed';
import StatsBottomPanel from '@/components/StatsBottomPanel';
import ThreatFilters from '@/components/ThreatFilters';
import SummaryView from '@/components/SummaryView';
import { socket } from '@/lib/socket';

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#05070A]" />
});

export default function Home() {
  const { activeTab, setMessages, isAboutOpen, setAboutOpen } = useStore();

  React.useEffect(() => {
    // Attempt to expand and request fullscreen for Telegram Mini App
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.expand();
        if (tg.requestFullscreen) {
          tg.requestFullscreen();
        }
        if (tg.disableVerticalSwipes) {
          tg.disableVerticalSwipes();
        }
      }
    } catch (e) {
      console.warn("Telegram WebApp API error:", e);
    }

    const fetchMessages = () => {
      fetch('/api/messages')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setMessages(data);
        })
        .catch(console.error);
    };

    const fetchAlerts = () => {
      fetch('/api/alerts')
        .then(res => res.json())
        .then(data => {
          if (data.states) {
            useStore.getState().setAlerts(data.states);
          }
        })
        .catch(console.error);
    };

    const fetchThreats = () => {
      fetch('/api/threats')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) useStore.getState().setThreats(data);
        })
        .catch(console.error);
    };

    fetchMessages();
    fetchAlerts();
    fetchThreats();
    
    const intervalMessages = setInterval(fetchMessages, 60000); // Refresh every 60 seconds
    const intervalThreats = setInterval(fetchThreats, 60000); // Refresh threats every 60 seconds
    const intervalAlerts = setInterval(fetchAlerts, 15000); // Refresh alerts every 15s
    const cleanupInterval = setInterval(() => useStore.getState().cleanupMessages(), 60000);

    // Connect socket for real-time updates
    socket.connect();

    socket.on('monitoring:new_message', (msg) => {
      useStore.getState().addMessage(msg);
    });

    socket.on('threat:new', (threat) => {
      useStore.getState().setThreats([...useStore.getState().threats, threat]);
    });

    socket.on('threat:update', (threat) => {
      const state = useStore.getState();
      const exists = state.threats.find(t => t.id === threat.id);
      if (exists) {
        state.setThreats(state.threats.map(t => t.id === threat.id ? threat : t));
      } else {
        state.setThreats([...state.threats, threat]);
      }
    });

    socket.on('explosion:new', (exp) => {
      useStore.getState().addExplosion(exp);
      setTimeout(() => {
        useStore.getState().removeExplosion(exp.id);
      }, 60000);
    });

    socket.on('threats:refresh', () => {
      fetchThreats();
    });

    return () => {
      clearInterval(intervalMessages);
      clearInterval(intervalThreats);
      clearInterval(intervalAlerts);
      clearInterval(cleanupInterval);
      socket.disconnect();
      socket.off('monitoring:new_message');
      socket.off('threat:new');
      socket.off('threat:update');
      socket.off('explosion:new');
      socket.off('threats:refresh');
    };
  }, [setMessages]);

  return (
    <main className="relative w-full h-[100dvh] bg-black text-white overflow-hidden">
      {/* Background Map Layer */}
      <div className={`absolute inset-0 z-0 ${activeTab !== 'MAP' && 'hidden md:block'}`}>
        <Map />
      </div>

      {/* Global Overlays */}
      <AnimatePresence>
        {activeTab === 'SUMMARY' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-0 z-10"
          >
            <SummaryView />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Desktop UI */}
      <div className="hidden md:block">
        <Navbar />
        {activeTab === 'MAP' && <ThreatFilters />}
        
        {/* Monitoring side panel */}
        <AnimatePresence>
          {activeTab === 'MONITORING' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-24 left-6 bottom-24 z-20 flex flex-col gap-4 w-80 lg:w-[400px]"
            >
               <MonitoringFeed />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Right Side Panels */}
        <AnimatePresence>
          {activeTab === 'MAP' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-28 right-6 bottom-24 z-20 flex flex-col gap-4 w-80"
            >
              <div className="bg-gradient-to-b from-black/40 to-black/10 backdrop-blur-xl rounded-3xl border border-white/10 flex-1 min-h-[150px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <Sidebar />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <StatsBottomPanel />
      </div>

      {/* Floating Mobile UI */}
      <div className="block md:hidden">
        <MobileTopBar />
        
        {activeTab === 'MAP' && <ThreatFilters />}
        
        <AnimatePresence>
          {activeTab === 'MONITORING' && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 260, mass: 0.8 }}
              className="fixed inset-0 pb-4 z-50 bg-black/95 backdrop-blur-3xl overflow-hidden"
              style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + var(--tg-safe-area-inset-top, 0px) + 126px)' }}
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-2 mb-1 cursor-grab active:cursor-grabbing" />
              <MonitoringFeed isMobile />
            </motion.div>
          )}
        </AnimatePresence>
        
        {activeTab === 'MAP' && <MobileBottomSheet />}
      </div>

      {/* Global About Modal */}
      <AnimatePresence>
      {isAboutOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md" onClick={() => setAboutOpen(false)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#010a1b] border border-gray-800 rounded-3xl p-8 w-[90%] md:w-[550px] shadow-[0_0_50px_rgba(0,0,0,1)] relative overflow-hidden" onClick={e => e.stopPropagation()}
          >
            {/* Background glowing effects */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none"></div>
            
            <button className="absolute top-5 right-5 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors" onClick={() => setAboutOpen(false)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center justify-center w-14 h-14">
                <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-wider">ALIVEMAP</h2>
                <p className="text-red-400 text-sm font-bold tracking-widest uppercase">Система Моніторингу</p>
              </div>
            </div>
            
            <div className="space-y-4 text-sm text-gray-300 font-medium">
              <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <ShieldAlert className="w-6 h-6 text-orange-400 shrink-0" />
                <p><strong className="text-white">Збір даних:</strong> Система автоматично моніторить десятки Telegram-каналів ОВА та перевірених джерел.</p>
              </div>
              <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <Cpu className="w-6 h-6 text-blue-400 shrink-0" />
                <p><strong className="text-white">ШІ-аналіз:</strong> Кожне повідомлення обробляється штучним інтелектом (Google Gemini) для визначення типу та вектора загрози.</p>
              </div>
              <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <MapIcon className="w-6 h-6 text-green-400 shrink-0" />
                <p><strong className="text-white">Трекінг:</strong> Маркери плавно переміщуються по карті в реальному часі на основі курсу та швидкості цілей.</p>
              </div>
            </div>
            
            <div className="mt-8 pt-5 border-t border-gray-800/50 flex justify-between items-center text-xs font-semibold text-gray-600 uppercase tracking-widest">
              <span>ALIVEMAP v1.0.0</span>
              <span>Слава Україні</span>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </main>
  );
}
