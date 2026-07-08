import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { useStore } from '../store/useStore';

interface SearchResult {
  name: string;
  region: string;
  lat: number;
  lng: number;
  pop: number;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { setFlyToLocation } = useStore();

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
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      setIsLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          setResults(data);
          setIsOpen(true);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    setFlyToLocation({ lat: result.lat, lng: result.lng });
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={wrapperRef} className="absolute top-24 right-6 z-40 w-80 font-sans hidden md:block">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-white/50" />
        </div>
        <input
          type="text"
          className="w-full bg-black/40 backdrop-blur-xl border border-white/10 text-white rounded-2xl py-3 pl-10 pr-10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] focus:outline-none focus:border-white/30 focus:bg-black/60 transition-all placeholder:text-white/40"
          placeholder="Пошук міста або села..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
              if (results.length > 0) setIsOpen(true);
          }}
        />
        {query && (
          <button 
            onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white transition"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute mt-2 w-full bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.5)] flex flex-col max-h-[60vh] overflow-y-auto">
          {results.map((result, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(result)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition text-left border-b border-white/5 last:border-b-0"
            >
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                <MapPin size={16} className="text-white/60" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate capitalize">{result.name}</div>
                <div className="text-white/40 text-xs truncate">{result.region}</div>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute mt-2 w-full bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-[0_16px_48px_rgba(0,0,0,0.5)] text-center text-white/50 text-sm">
          Нічого не знайдено
        </div>
      )}
    </div>
  );
}
