import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function CitySearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const { setFlyToLocation, setActiveTab } = useStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`)
        .then(res => res.json())
        .then(data => {
          setResults(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (city: any) => {
    setFlyToLocation({ lat: city.lat, lng: city.lng });
    setActiveTab('MAP');
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative z-50">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-white/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Пошук н.п..."
          className="w-48 lg:w-64 bg-white/5 border border-white/10 text-white text-sm rounded-full pl-9 pr-4 py-1.5 outline-none focus:border-red-500/50 focus:bg-white/10 transition-all placeholder:text-white/40"
        />
        {loading && (
          <div className="absolute right-3 w-3 h-3 border-2 border-white/20 border-t-red-500 rounded-full animate-spin"></div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden">
          {results.map((city, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(city)}
              className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 flex items-center gap-3"
            >
              <MapPin className="w-4 h-4 text-red-500 shrink-0" />
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-white truncate">{city.names[0]}</span>
                <span className="text-xs text-white/40 truncate">{city.region}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
