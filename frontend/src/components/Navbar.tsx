import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

export default function Navbar() {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { setAboutOpen } = useStore();

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute top-4 left-4 right-4 h-16 bg-[#070b14]/50 backdrop-blur-xl rounded-2xl flex items-center justify-between px-6 z-30 border border-white/5">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          {!imgError ? (
            <img src="/logo.png" alt="AliveMap Logo" className="w-8 h-8 object-contain relative z-10 opacity-90" 
                 onError={() => setImgError(true)} 
            />
          ) : (
            <svg className="text-red-500/80 w-6 h-6 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          )}
        </div>
        <h1 className="text-lg font-semibold tracking-widest text-white/90 flex items-center gap-1 uppercase">
          Alive<span className="text-red-500/80">Map</span>
        </h1>
      </div>

      {/* Tabs */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-widest">
        <div className="text-white border-b border-red-500/50 pb-1 cursor-pointer">МАПА</div>
        <div className="text-white/40 hover:text-white/80 cursor-pointer pb-1 transition-colors">ЗВЕДЕННЯ</div>
        <div className="text-white/40 hover:text-white/80 cursor-pointer pb-1 transition-colors">СТАТИСТИКА</div>
        <div onClick={() => setAboutOpen(true)} className="text-white/40 hover:text-white/80 cursor-pointer pb-1 transition-colors">ІНФОРМАЦІЯ</div>
      </div>

      {/* Time & Live Indicator */}
      <div className="flex items-center gap-4">
        <div className="text-gray-300 font-mono text-lg">
          {mounted ? time.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
        </div>
        <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-red-500 text-xs font-bold tracking-widest">LIVE</span>
        </div>
      </div>
      
      {/* About Modal */}
      {useStore((state) => state.isAboutOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setAboutOpen(false)}>
          <div className="bg-[#070b14] border border-gray-800 rounded-2xl p-6 w-[500px] shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white" onClick={() => setAboutOpen(false)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h2 className="text-xl font-bold mb-4 text-white uppercase tracking-wider">Як працює радар ALIVEMAP?</h2>
            <div className="space-y-4 text-sm text-gray-300 font-medium">
              <p>
                <strong className="text-white">1. Збір даних</strong> — система автоматично моніторить десятки Telegram-каналів ОВА та перевірених джерел цілодобово.
              </p>
              <p>
                <strong className="text-white">2. ШІ-аналіз</strong> — кожне повідомлення аналізується штучним інтелектом, який визначає тип загрози, місцезнаходження, кількість та напрямок.
              </p>
              <p>
                <strong className="text-white">3. Геокодування</strong> — назви населених пунктів перетворюються у точні координати для відображення на карті.
              </p>
              <p>
                <strong className="text-white">4. Трекінг та прогнозування</strong> — система розраховує траєкторію та швидкість цілей, плавно переміщуючи їх по карті. Дані оновлюються в режимі реального часу (WebSockets).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-800 text-xs text-gray-500 flex justify-between items-center">
              <span>ALIVEMAP v0.1.0-beta</span>
              <span>© 2026 Всі права захищено</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
