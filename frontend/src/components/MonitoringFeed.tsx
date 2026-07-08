import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Search, X, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MonitoringFeed({ isMobile }: { isMobile?: boolean }) {
  const { messages } = useStore();

  return (
    <div className={`flex flex-col font-sans overflow-hidden ${
      isMobile 
        ? 'w-full h-full bg-[#050505]/95' 
        : 'w-full h-full bg-[#050505]/80 backdrop-blur-2xl border border-white/[0.05] rounded-[32px] shadow-[0_16px_40px_rgba(0,0,0,0.5)]'
    }`}>
      {/* Header */}
      <div className={`p-6 flex items-center justify-between ${isMobile ? 'pt-24 pb-4' : 'border-b border-white/[0.05] bg-black/20'}`}>
        <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
          <Activity className="text-red-500 w-6 h-6" strokeWidth={2.5} />
          Моніторинг
          <span className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-black px-2.5 py-1 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            {messages.length}
          </span>
        </h2>
      </div>

      {/* Search and Filters */}
      <div className="px-6 py-4 border-b border-white/[0.05] space-y-4 bg-black/10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
          <input type="text" placeholder="Пошук повідомлень..." 
                 className="w-full bg-[#111]/80 text-white text-[13px] rounded-xl pl-11 pr-4 py-3.5 outline-none border border-white/5 focus:border-red-500/30 focus:bg-[#1a1a1a]/80 transition-all placeholder:text-white/30 font-medium" />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button className="bg-red-500/15 text-red-500 shadow-sm border border-transparent text-xs font-black px-5 py-2.5 rounded-xl transition-all tracking-widest uppercase">Усі</button>
          <button className="bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/60 text-xs font-black px-5 py-2.5 rounded-xl transition-colors tracking-widest uppercase">Важливе</button>
          <button className="bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/60 text-xs font-black px-5 py-2.5 rounded-xl transition-colors tracking-widest uppercase">Збиття</button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div 
              key={msg.id} 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index < 20 ? index * 0.03 : 0, duration: 0.3 }}
              onClick={() => {
                if (msg.lat && msg.lng) {
                   useStore.getState().setFlyToLocation({ lat: msg.lat, lng: msg.lng });
                   useStore.getState().setActiveTab('MAP');
                   return;
                }
                // Fallback: search frontend threats
                const state = useStore.getState();
                const possibleThreats = state.threats.filter(t => msg.tags.includes(t.type));
                if (possibleThreats.length > 0) {
                  // Find the one closest in time
                  const msgTime = new Date(msg.timestamp).getTime();
                  let closest = possibleThreats[0];
                  let minDiff = Math.abs(new Date(closest.updatedAt).getTime() - msgTime);
                  for (const t of possibleThreats) {
                    const diff = Math.abs(new Date(t.updatedAt).getTime() - msgTime);
                    if (diff < minDiff) {
                      minDiff = diff;
                      closest = t;
                    }
                  }
                  if (closest.locations.length > 0) {
                    state.setFlyToLocation({ lat: closest.locations[0].lat, lng: closest.locations[0].lng });
                    state.setActiveTab('MAP');
                  } else if (closest.targetLat && closest.targetLng) {
                    state.setFlyToLocation({ lat: closest.targetLat, lng: closest.targetLng });
                    state.setActiveTab('MAP');
                  }
                }
              }}
              className="p-5 bg-gradient-to-br from-[#111111]/90 to-[#0a0a0a]/90 hover:from-[#1a1a1a]/90 hover:to-[#111111]/90 rounded-[20px] transition-all cursor-pointer border border-white/[0.03] hover:border-white/[0.08] hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500/50 to-purple-500/50 opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-center mb-3 pl-3">
                <span className="text-[11px] font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent uppercase tracking-widest">@{msg.channelName}</span>
                <span className="text-[10px] text-white/30 font-bold tracking-widest">
                  {new Date(msg.timestamp).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="pl-3">
              {msg.tags && msg.tags.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap">
                  {msg.tags.map((tag: string) => {
                    const tagTranslations: Record<string, string> = {
                      'DRONE': 'Шахед / БПЛА',
                      'FPV': 'FPV / Ланцет',
                      'CRUISE_MISSILE': 'Крилата Ракета',
                      'KH101': 'Крилата Ракета (Х-101/555)',
                      'KALIBR': 'Крилата Ракета (Калібр)',
                      'BALLISTIC_MISSILE': 'Балістика',
                      'ISKANDER': 'Балістика (Іскандер)',
                      'KINZHAL': 'Аеробалістична (Кинджал)',
                      'MISSILE': 'Ракета',
                      'KAB': 'КАБ / ФАБ',
                      'AIRCRAFT': 'Авіація',
                      'ZIRCON': 'Циркон',
                      'PPO': 'Робота ППО',
                      'INFO': 'Інформація',
                      'RECON': 'Розвідник',
                      'UNKNOWN': 'Невідома ціль'
                    };
                    return (
                      <span key={tag} className="bg-white/5 border border-white/10 text-white/70 text-[9px] px-2.5 py-1 rounded-md font-bold uppercase tracking-widest">
                        {tagTranslations[tag] || tag}
                      </span>
                    );
                  })}
                </div>
              )}

              <p className="text-[14px] text-white/80 leading-relaxed font-medium whitespace-pre-wrap">
                {msg.text}
              </p>
              </div>
            </motion.div>
        ))}
        </AnimatePresence>
        {messages.length === 0 && (
          <div className="text-center py-10 text-gray-500 text-sm font-medium">
            Немає повідомлень
          </div>
        )}
      </div>
    </div>
  );
}
