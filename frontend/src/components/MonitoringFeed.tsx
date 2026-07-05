import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Search, X } from 'lucide-react';

export default function MonitoringFeed() {
  const { messages, setMessages, addMessage } = useStore();

  useEffect(() => {
    // Fetch initial messages
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch(console.error);
      
    // Socket listener logic should be in a global place or here
  }, [setMessages]);

  return (
    <div className="absolute top-24 left-6 w-80 max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl flex flex-col z-20 overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          Стрічка моніторингу
          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{messages.length}</span>
        </h2>
        <button className="text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-1"><X size={16} /></button>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b border-gray-100 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="Шукати за ключовим словом..." 
                 className="w-full bg-gray-50 text-gray-700 text-sm rounded-xl pl-9 pr-4 py-2 outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
        </div>
        <div className="flex gap-2">
          <button className="bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">Усі</button>
          <button className="bg-gray-50 text-gray-600 hover:bg-gray-100 text-xs font-medium px-4 py-1.5 rounded-full transition-colors">Важливе</button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {messages.map(msg => (
          <div key={msg.id} className="p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer mb-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-bold text-gray-900">@{msg.channelName}</span>
              <span className="text-[10px] text-gray-400">
                {new Date(msg.timestamp).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            {msg.tags.length > 0 && (
              <div className="flex gap-1 mb-2">
                {msg.tags.map(tag => (
                  <span key={tag} className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                    tag === 'Загроза' ? 'bg-orange-100 text-orange-600' :
                    tag === 'Тривога' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line font-medium">
              {msg.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
