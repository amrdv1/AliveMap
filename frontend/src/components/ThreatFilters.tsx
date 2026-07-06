import React from 'react';
import { useStore, ReportType } from '../store/useStore';
import { ThreatIcon } from './ThreatIcon';

export default function ThreatFilters() {
  const { filters, setFilter } = useStore();

  const toggleType = (type: ReportType) => {
    if (filters.types.includes(type)) {
      setFilter('types', filters.types.filter(t => t !== type));
    } else {
      setFilter('types', [...filters.types, type]);
    }
  };

  const isSelected = (type: ReportType) => filters.types.includes(type);

  const filterOptions: { type: ReportType; label: string; color: string }[] = [
    { type: 'DRONE', label: 'Шахеди', color: 'bg-red-500/20 text-red-500 border-red-500/30' },
    { type: 'FPV', label: 'FPV', color: 'bg-orange-500/20 text-orange-500 border-orange-500/30' },
    { type: 'CRUISE_MISSILE', label: 'Кр. Ракети', color: 'bg-orange-500/20 text-orange-500 border-orange-500/30' },
    { type: 'KH101', label: 'Х-101/55', color: 'bg-orange-600/20 text-orange-500 border-orange-600/30' },
    { type: 'KALIBR', label: 'Калібр', color: 'bg-rose-500/20 text-rose-500 border-rose-500/30' },
    { type: 'BALLISTIC_MISSILE', label: 'Балістика', color: 'bg-purple-500/20 text-purple-500 border-purple-500/30' },
    { type: 'ISKANDER', label: 'Іскандер', color: 'bg-fuchsia-500/20 text-fuchsia-500 border-fuchsia-500/30' },
    { type: 'KINZHAL', label: 'Кинджал', color: 'bg-red-600/20 text-red-500 border-red-600/30' },
    { type: 'ZIRCON', label: 'Циркон', color: 'bg-red-700/20 text-red-600 border-red-700/30' },
    { type: 'KAB', label: 'КАБи', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
    { type: 'AIRCRAFT', label: 'Авіація', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { type: 'RECON', label: 'БПЛА', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    { type: 'UNKNOWN', label: 'Невідомі', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
  ];

  return (
    <div className="absolute top-[88px] left-1/2 -translate-x-1/2 z-20 flex gap-2 overflow-x-auto w-full px-4 md:w-auto md:px-0 scrollbar-hide pointer-events-none">
      <div className="pointer-events-auto flex gap-2 mx-auto bg-[#010a1b] p-2 rounded-2xl border border-white/5 shadow-lg min-w-max">
        {filterOptions.map(opt => {
          const active = isSelected(opt.type);
          return (
            <button
              key={opt.type}
              onClick={() => toggleType(opt.type)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-300 border ${
                active 
                  ? opt.color + ' shadow-[0_0_10px_rgba(0,0,0,0.5)]'
                  : 'bg-white/5 text-white/30 border-transparent hover:bg-white/10 hover:text-white/60'
              }`}
            >
              <div className={`w-5 h-5 flex items-center justify-center rounded-full ${active ? 'bg-current/10' : 'bg-white/5 opacity-50'}`}>
                <ThreatIcon type={opt.type} className="w-3.5 h-3.5" />
              </div>
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
