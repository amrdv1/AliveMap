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
    <div className="absolute top-24 left-4 w-72 max-h-[calc(100vh-8rem)] bg-[#070b14]/70 backdrop-blur-md border border-gray-700/30 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col z-20 overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 border-b border-gray-800/50 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          Стрічка моніторингу
          <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">{messages.length}</span>
        </h2>
        <button className="text-gray-500 hover:text-white bg-gray-800/50 rounded-full p-1 transition-colors"><X size={16} /></button>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b border-gray-800/50 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input type="text" placeholder="Шукати за ключовим словом..." 
                 className="w-full bg-[#0a0f18] text-white text-sm rounded-xl pl-9 pr-4 py-2 outline-none border border-gray-800 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all placeholder:text-gray-600" />
        </div>
        <div className="flex gap-2">
          <button className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all">Усі</button>
          <button className="bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 text-xs font-medium px-4 py-1.5 rounded-full transition-colors border border-gray-700/50">Важливе</button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {messages.map(msg => (
          <div key={msg.id} className="p-3 hover:bg-[#0a0f18] rounded-xl transition-colors cursor-pointer mb-1 border border-transparent hover:border-gray-800/50">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-bold text-gray-300">@{msg.channelName}</span>
              <span className="text-[10px] text-gray-500">
                {new Date(msg.timestamp).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            {msg.tags.length > 0 && (
              <div className="flex gap-1 mb-2">
                {msg.tags.map(tag => (
                  <span key={tag} className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm border ${
                    tag === 'Загроза' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                    tag === 'Тривога' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-gray-800/50 text-gray-400 border-gray-700'
                  }`}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line font-medium">
              {msg.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
