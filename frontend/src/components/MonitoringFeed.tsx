import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Search, X, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MonitoringFeed({ isMobile }: { isMobile?: boolean }) {
  const { messages } = useStore();

  return (
    <div className={`flex flex-col font-sans overflow-hidden ${
      isMobile 
        ? 'w-full h-full bg-transparent' 
        : 'w-full h-full bg-gradient-to-b from-black/40 to-black/10 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
    }`}>
      {/* Header */}
      <div className={`p-5 flex items-center justify-between ${isMobile ? 'bg-transparent' : 'border-b border-white/5 bg-black/20'}`}>
        <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-3">
          <Activity className="text-red-500 w-5 h-5" />
          Моніторинг
          <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-md shadow-[0_0_10px_rgba(239,68,68,0.5)]">
            {messages.length}
          </span>
        </h2>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b border-white/5 space-y-3 bg-black/10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input type="text" placeholder="Пошук повідомлень..." 
                 className="w-full bg-white/5 text-white text-sm rounded-xl pl-11 pr-4 py-3 outline-none border border-white/5 focus:border-red-500/50 focus:bg-white/10 transition-all placeholder:text-gray-600 font-medium" />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-4 py-2 rounded-xl transition-all tracking-wide">Усі</button>
          <button className="bg-white/5 text-gray-400 border border-transparent hover:bg-white/10 hover:text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors tracking-wide">Важливе</button>
          <button className="bg-white/5 text-gray-400 border border-transparent hover:bg-white/10 hover:text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors tracking-wide">Збиття</button>
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
              className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all cursor-pointer border border-white/5 hover:border-white/10 group"
            >
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-blue-400 tracking-wider">@{msg.channelName}</span>
              <span className="text-xs text-gray-500 font-medium">
                {new Date(msg.timestamp).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            {msg.tags && msg.tags.length > 0 && (
              <div className="flex gap-1.5 mb-3 flex-wrap">
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
                    'AIRCRAFT': 'Авіація / МіГ',
                    'KAB': 'КАБ / ФАБ',
                    'RECON': 'Розвідник',
                    'ZIRCON': 'Гіперзвукова (Циркон)',
                    'UNKNOWN': 'Невідома Ціль',
                    'PPO': 'ППО / Вибухи',
                  };

                  const tagColors: Record<string, string> = {
                    'DRONE': 'bg-red-500/20 text-red-400 border-red-500/30',
                    'FPV': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
                    'CRUISE_MISSILE': 'bg-red-600/20 text-red-500 border-red-600/30',
                    'KH101': 'bg-orange-600/20 text-orange-500 border-orange-600/30',
                    'KALIBR': 'bg-rose-500/20 text-rose-500 border-rose-500/30',
                    'BALLISTIC_MISSILE': 'bg-orange-500/20 text-orange-500 border-orange-500/30',
                    'ISKANDER': 'bg-fuchsia-500/20 text-fuchsia-500 border-fuchsia-500/30',
                    'KINZHAL': 'bg-red-600/20 text-red-500 border-red-600/30',
                    'MISSILE': 'bg-red-500/20 text-red-500 border-red-500/30',
                    'AIRCRAFT': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                    'KAB': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                    'RECON': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
                    'ZIRCON': 'bg-red-700/30 text-red-500 border-red-600/50 shadow-[0_0_10px_rgba(255,0,0,0.5)]',
                    'UNKNOWN': 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
                    'PPO': 'bg-green-500/20 text-green-400 border-green-500/30',
                  };

                  const label = tagTranslations[tag] || tag;
                  const cls = tagColors[tag] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
                  
                  return (
                    <span key={tag} className={`text-[10px] font-bold px-2 py-1 rounded-md tracking-wider uppercase border ${cls}`}>
                      {label}
                    </span>
                  );
                })}
              </div>
            )}
            
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line font-medium group-hover:text-white transition-colors">
              {msg.text}
            </p>
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
