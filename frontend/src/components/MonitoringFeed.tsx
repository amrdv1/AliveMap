import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Search, X } from 'lucide-react';

export default function MonitoringFeed() {
  const { messages, setMessages, addMessage } = useStore();

  useEffect(() => {
    // Fetch initial messages
    fetch('/api/messages')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch(console.error);
  }, [setMessages]);

  return (
    <div className="absolute top-24 left-4 w-80 max-h-[calc(100vh-8rem)] bg-[#070b14]/50 backdrop-blur-xl border border-white/5 rounded-2xl flex flex-col z-20 overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white/90 flex items-center gap-2">
          Моніторинг
          <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">{messages.length}</span>
        </h2>
        <button className="text-white/40 hover:text-white/90 rounded-full p-1 transition-colors"><X size={16} /></button>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b border-white/5 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
          <input type="text" placeholder="Пошук..." 
                 className="w-full bg-white/5 text-white/90 text-sm rounded-xl pl-9 pr-4 py-2 outline-none border border-transparent focus:border-white/10 transition-all placeholder:text-white/30" />
        </div>
        <div className="flex gap-2">
          <button className="bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-4 py-1.5 rounded-full transition-all">Усі</button>
          <button className="text-white/50 hover:text-white hover:bg-white/5 text-xs font-medium px-4 py-1.5 rounded-full transition-colors border border-transparent">Важливе</button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {messages.map(msg => (
          <div key={msg.id} className="p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer mb-1 border border-transparent hover:border-white/5">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-white/70">@{msg.channelName}</span>
              <span className="text-[10px] text-white/30 font-medium">
                {new Date(msg.timestamp).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            {msg.tags.length > 0 && (
              <div className="flex gap-1 mb-2">
                {msg.tags.map(tag => (
                  <span key={tag} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${
                    tag === 'Загроза' ? 'bg-orange-500/10 text-orange-400 border-orange-500/10' :
                    tag === 'Тривога' ? 'bg-red-500/10 text-red-400 border-red-500/10' : 'bg-white/5 text-white/50 border-white/5'
                  }`}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <p className="text-xs text-white/60 leading-relaxed whitespace-pre-line font-medium">
              {msg.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
