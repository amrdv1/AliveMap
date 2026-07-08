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
    <div className="absolute left-0 top-[var(--mobile-top)] md:top-28 md:left-6 z-20 flex overflow-x-auto md:overflow-visible w-full px-3 md:w-auto md:px-0 scrollbar-hide"
         style={{ '--mobile-top': 'calc(env(safe-area-inset-top, 0px) + var(--tg-safe-area-inset-top, 0px) + 72px)' } as React.CSSProperties}>
      <div className="flex gap-2 min-w-max pb-2 md:pb-0 md:min-w-0 md:grid md:grid-cols-2 md:gap-2 md:bg-black/40 md:backdrop-blur-xl md:border md:border-white/10 md:rounded-3xl md:p-3 md:shadow-[0_8px_32px_rgba(0,0,0,0.3)] md:w-64">
        <div className="hidden md:block col-span-2 mb-1 px-1">
          <span className="text-white/40 text-[9px] font-black tracking-widest uppercase">Фільтри Загроз</span>
        </div>
        {filterOptions.map(opt => {
          const active = isSelected(opt.type);
          return (
            <motion.button
              key={opt.type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleType(opt.type)}
              className={`flex items-center justify-start md:w-full gap-2 px-4 py-2.5 md:px-2.5 md:py-1.5 rounded-2xl md:rounded-xl text-[11px] md:text-[9px] font-black tracking-wide uppercase transition-all duration-300 border backdrop-blur-2xl ${
                active 
                  ? opt.color.replace('bg-', 'bg-').replace('/20', '/10') + ' shadow-[0_4px_20px_rgba(currentColor,0.2)] bg-black/80 border-current/30 md:shadow-sm md:bg-black/60'
                  : 'bg-black/60 text-white/50 border-white/[0.08] hover:bg-black/80 hover:text-white/80 shadow-[0_4px_15px_rgba(0,0,0,0.4)] md:bg-white/5 md:shadow-none md:border-transparent md:hover:bg-white/10'
              }`}
            >
              <div className={`flex-shrink-0 w-5 h-5 md:w-4 md:h-4 flex items-center justify-center rounded-full ${active ? 'bg-current/15' : 'bg-white/5 opacity-50'}`}>
                <ThreatIcon type={opt.type} className="w-3.5 h-3.5 md:w-2.5 md:h-2.5" />
              </div>
              <span className="truncate">{opt.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
