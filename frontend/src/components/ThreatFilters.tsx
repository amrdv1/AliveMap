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
      <div className="flex gap-2 min-w-max pb-2 md:pb-0 md:min-w-0 md:flex md:flex-col md:gap-2 md:bg-[#0a0a0a]/80 md:backdrop-blur-xl md:border md:border-white/5 md:rounded-3xl md:p-4 md:shadow-2xl md:w-[220px]">
        <div className="hidden md:flex items-center gap-3 mb-3 px-2">
          <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
          <span className="text-white font-black tracking-widest text-[15px] uppercase">ALIVE<span className="text-red-600">MAP</span></span>
        </div>
        
        {filterOptions.map(opt => {
          const active = isSelected(opt.type);
          const [bgColor, textColor] = opt.color.split(' ');
          
          return (
            <motion.button
              key={opt.type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleType(opt.type)}
              className={`flex items-center justify-start md:w-full gap-3 px-4 py-2.5 md:px-4 md:py-2.5 rounded-2xl md:rounded-[14px] text-[11px] md:text-[11px] font-black tracking-widest uppercase transition-all duration-300 border backdrop-blur-2xl ${
                active 
                  ? `${bgColor.replace('/20', '/15')} ${textColor} border-current/10 shadow-sm`
                  : 'bg-white/5 text-white/30 border-transparent hover:bg-white/10 hover:text-white/60 shadow-none'
              }`}
            >
              <div className={`flex-shrink-0 w-5 h-5 md:w-4 md:h-4 flex items-center justify-center rounded-full ${active ? 'bg-current/20' : 'bg-white/10'}`}>
                <ThreatIcon type={opt.type} className="w-3.5 h-3.5 md:w-3 md:h-3" />
              </div>
              <span className="truncate">{opt.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
