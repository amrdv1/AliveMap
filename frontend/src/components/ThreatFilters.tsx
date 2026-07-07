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
    <div className="absolute top-[60px] md:top-28 left-0 md:left-6 z-20 flex md:flex-col gap-1.5 md:gap-2 overflow-x-auto md:overflow-visible w-full px-3 md:w-auto md:px-0 scrollbar-hide pointer-events-none">
      <div className="pointer-events-auto flex md:flex-col gap-1.5 md:gap-2 bg-black/50 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none p-1.5 md:p-0 rounded-2xl md:rounded-none border border-white/[0.06] md:border-none shadow-[0_4px_20px_rgba(0,0,0,0.3)] md:shadow-none min-w-max">
        {filterOptions.map(opt => {
          const active = isSelected(opt.type);
          return (
            <motion.button
              key={opt.type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleType(opt.type)}
              className={`flex items-center justify-start md:w-full gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase transition-colors duration-300 border backdrop-blur-md ${
                active 
                  ? opt.color + ' shadow-[0_0_15px_rgba(currentColor,0.2)] bg-black/20'
                  : 'bg-black/20 text-white/40 border-white/5 hover:bg-white/10 hover:text-white/70 shadow-sm'
              }`}
            >
              <div className={`w-5 h-5 flex items-center justify-center rounded-full ${active ? 'bg-current/10' : 'bg-white/5 opacity-50'}`}>
                <ThreatIcon type={opt.type} className="w-3.5 h-3.5" />
              </div>
              {opt.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
