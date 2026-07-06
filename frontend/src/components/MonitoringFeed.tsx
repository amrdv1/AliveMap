import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Search, X, Activity } from 'lucide-react';

export default function MonitoringFeed({ isMobile }: { isMobile?: boolean }) {
  const { messages } = useStore();

  return (
    <div className={`flex flex-col bg-[#010a1b] border border-white/5 font-sans overflow-hidden shadow-2xl ${
      isMobile ? 'w-full h-full rounded-none' : 'w-full h-full rounded-2xl'
    }`}>
      {/* Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-black/20">
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
        {messages.map(msg => (
          <div key={msg.id} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all cursor-pointer border border-white/5 hover:border-white/10 group">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-blue-400 tracking-wider">@{msg.channelName}</span>
              <span className="text-xs text-gray-500 font-medium">
                {new Date(msg.timestamp).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            {msg.tags && msg.tags.length > 0 && (
              <div className="flex gap-1.5 mb-3 flex-wrap">
                {msg.tags.map((tag: string) => {
                  const tagMap: Record<string, {label: string, cls: string}> = {
                    'DRONE': { label: 'Шахед', cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
                    'CRUISE_MISSILE': { label: 'Кр. Ракета', cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
                    'BALLISTIC_MISSILE': { label: 'Балістика', cls: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
                    'MISSILE': { label: 'Ракета', cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
                    'ZIRCON': { label: 'Циркон', cls: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
                    'AIRCRAFT': { label: 'Авіація', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
                    'KAB': { label: 'КАБ', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
                    'PPO': { label: 'ППО Збиття', cls: 'bg-green-500/20 text-green-400 border-green-500/30' },
                    'RECON': { label: 'Розвідка', cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
                    'SUMMARY': { label: 'Зведення', cls: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
                    'INFO': { label: 'Інфо', cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
                  };
                  const mapped = tagMap[tag] || { label: tag, cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
                  return (
                    <span key={tag} className={`text-[10px] font-bold px-2 py-1 rounded-md tracking-wider uppercase border ${mapped.cls}`}>
                      {mapped.label}
                    </span>
                  );
                })}
              </div>
            )}
            
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line font-medium group-hover:text-white transition-colors">
              {msg.text}
            </p>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center py-10 text-gray-500 text-sm font-medium">
            Немає повідомлень
          </div>
        )}
      </div>
    </div>
  );
}
