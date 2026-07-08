import React from 'react';
import { useStore, ReportType } from '../store/useStore';
import { ThreatIcon } from './ThreatIcon';
import { motion } from 'framer-motion';

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
    <div className="absolute left-0 top-[var(--mobile-top)] md:top-24 md:left-4 z-20 flex overflow-x-auto md:overflow-visible w-full px-3 md:w-auto md:px-0 scrollbar-hide"
         style={{ '--mobile-top': 'calc(env(safe-area-inset-top, 0px) + var(--tg-safe-area-inset-top, 0px) + 120px)' } as React.CSSProperties}>
      <div className="flex gap-2 min-w-max pb-2 md:pb-0 md:min-w-0 md:flex md:flex-col md:gap-2 md:w-[160px]">
        
        {filterOptions.map(opt => {
          const active = isSelected(opt.type);
          
          return (
            <motion.button
              key={opt.type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleType(opt.type)}
              className={`flex items-center justify-start md:w-full gap-2.5 px-4 py-2.5 md:px-4 md:py-2 rounded-full text-[11px] font-black tracking-widest uppercase transition-all duration-300 border backdrop-blur-xl ${
                active 
                  ? `${opt.color} shadow-[0_4px_12px_rgba(0,0,0,0.4)] brightness-110`
                  : 'bg-white/5 text-white/30 border-transparent hover:bg-white/10 hover:text-white/60 shadow-none'
              }`}
            >
              <ThreatIcon type={opt.type} className={`w-4 h-4 md:w-3.5 md:h-3.5 ${active ? 'opacity-100' : 'opacity-40'}`} />
              <span className="truncate">{opt.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
