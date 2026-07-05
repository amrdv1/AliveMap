import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

export default function Navbar() {
  const [time, setTime] = useState(new Date());
  const { setAboutOpen } = useStore();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute top-4 left-4 right-4 h-16 bg-[#070b14]/80 backdrop-blur-lg rounded-2xl flex items-center justify-between px-6 z-30 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-gray-700/50">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          <img src="/logo.png" alt="AliveMap Logo" className="w-10 h-10 object-contain relative z-10 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
               onError={(e) => {
                 e.currentTarget.style.display = 'none';
                 e.currentTarget.parentElement!.innerHTML += '<svg class="text-red-500 w-6 h-6 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>';
               }} 
          />
        </div>
        <h1 className="text-xl font-bold tracking-widest text-white flex items-center gap-1 uppercase">
          Alive<span className="text-red-500">Map</span>
        </h1>
      </div>

      {/* Tabs */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wider">
        <div className="text-white border-b-2 border-red-500 pb-1 cursor-pointer font-bold drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">МАПА</div>
        <div className="text-gray-400 hover:text-white cursor-pointer pb-1 transition-colors">ЗВЕДЕННЯ</div>
        <div className="text-gray-400 hover:text-white cursor-pointer pb-1 transition-colors">СТАТИСТИКА</div>
        <div onClick={() => setAboutOpen(true)} className="text-gray-400 hover:text-white cursor-pointer pb-1 transition-colors">ІНФОРМАЦІЯ</div>
      </div>

      {/* Time & Live Indicator */}
      <div className="flex items-center gap-4">
        <div className="text-gray-300 font-mono text-lg">
          {time.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
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
