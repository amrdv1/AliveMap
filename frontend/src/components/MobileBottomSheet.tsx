import React, { useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Target, ChevronRight } from 'lucide-react';
import { ThreatIcon } from './ThreatIcon';
import { motion, AnimatePresence } from 'framer-motion';

const THREAT_LABELS: Record<string, string> = {
  'DRONE': 'ШАХЕД / БПЛА',
  'MOLNIYA': 'БПЛА МОЛНІЯ',
  'FPV': 'FPV ДРОН',
  'CRUISE_MISSILE': 'КРИЛАТА РАКЕТА',
  'KH101': 'Х-101/55',
  'KALIBR': 'КАЛІБР',
  'BALLISTIC_MISSILE': 'БАЛІСТИКА',
  'ISKANDER': 'ІСКАНДЕР',
  'KINZHAL': 'КИНДЖАЛ',
  'MISSILE': 'РАКЕТА',
  'KAB': 'КАБ / ФАБ',
  'AIRCRAFT': 'АВІАЦІЯ',
  'ZIRCON': 'ЦИРКОН',
  'PPO': 'ППО',
  'RECON': 'РОЗВІДНИК',
  'UNKNOWN': 'НЕВІДОМА ЦІЛЬ',
};

const THREAT_COLORS: Record<string, string> = {
  'DRONE': '#ef4444', 'MOLNIYA': '#ef4444', 'FPV': '#f97316', 'CRUISE_MISSILE': '#f97316',
  'KH101': '#ea580c', 'KALIBR': '#e11d48', 'BALLISTIC_MISSILE': '#a855f7',
  'ISKANDER': '#d946ef', 'KINZHAL': '#dc2626', 'MISSILE': '#f97316',
  'KAB': '#eab308', 'AIRCRAFT': '#3b82f6', 'ZIRCON': '#dc2626',
  'RECON': '#9ca3af', 'UNKNOWN': '#9ca3af', 'PPO': '#22c55e',
};

export default function MobileBottomSheet() {
  const { threats, setFlyToLocation, setSelectedThreat } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const activeThreats = threats.filter(t => t.status === 'ACTIVE');
  const totalQuantity = activeThreats.reduce((acc, t) => acc + (t.quantity || 1), 0);

  if (activeThreats.length === 0) return null;

  const handleThreatClick = (threat: any) => {
    if (threat.locations?.length > 0) {
      setFlyToLocation({ lat: threat.locations[0].lat, lng: threat.locations[0].lng });
    } else if (threat.targetLat && threat.targetLng) {
      setFlyToLocation({ lat: threat.targetLat, lng: threat.targetLng });
    }
    setSelectedThreat(threat);
  };

  return (
    <div className="lg:hidden fixed bottom-20 left-0 right-0 z-40 pointer-events-none" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {/* Threat count indicator */}
      <div className="pointer-events-auto flex items-center justify-center mb-3">
        <div className="bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/[0.05] rounded-full px-4 py-1.5 flex items-center gap-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          <span className="text-[11px] font-black text-white/80 tracking-widest uppercase">
            {totalQuantity} {totalQuantity === 1 ? 'активна ціль' : 'активних цілей'}
          </span>
        </div>
      </div>

      {/* Horizontal scroll cards */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide px-3 pb-1 gap-2.5 pointer-events-auto touch-pan-x"
      >
        {activeThreats.map((threat) => {
          const color = THREAT_COLORS[threat.type] || '#ffffff';
          return (
            <motion.div 
              key={threat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => handleThreatClick(threat)}
              className="flex-shrink-0 w-[280px] bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/[0.05] rounded-[24px] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.5)] cursor-pointer active:scale-[0.97] transition-transform relative overflow-hidden group"
            >
              <div 
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] pointer-events-none opacity-20"
                style={{ backgroundColor: color }}
              />
              <div className="flex items-center gap-3.5 relative z-10">
                {/* Icon */}
                <div 
                  className="w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 shadow-inner"
                  style={{ backgroundColor: color + '15', border: `1px solid ${color}30` }}
                >
                  <ThreatIcon type={threat.type} className="w-6 h-6 drop-shadow-md" color={color} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] font-black text-white tracking-widest truncate">
                    {THREAT_LABELS[threat.type] || threat.type}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    {threat.speed && (
                      <span className="text-[11px] text-white/50 font-bold tracking-widest">
                        {Math.round(threat.speed)} км/г
                      </span>
                    )}
                    {threat.course != null && (
                      <span className="text-[11px] text-white/50 font-bold tracking-widest flex items-center gap-1">
                        <Target size={10} className="opacity-50" />
                        {Math.round(threat.course)}°
                      </span>
                    )}
                  </div>
                </div>
                
                <ChevronRight className="w-5 h-5 text-white/20 shrink-0 group-active:translate-x-1 transition-transform" />
              </div>
              {/* Target name */}
              {threat.targetName && (
                <div className="mt-3.5 pt-3 border-t border-white/[0.05] relative z-10">
                  <span className="text-[11px] text-white/40 font-bold tracking-widest truncate flex items-center gap-1.5">
                    {(() => {
                        const loc = threat.locations && threat.locations.length > 0 ? threat.locations[0] : null;
                        const isOver = loc && threat.targetLat && threat.targetLng && (Math.sqrt(Math.pow(loc.lat - threat.targetLat, 2) + Math.pow(loc.lng - threat.targetLng, 2)) < 0.25);
                        return isOver ? 'В районі:' : 'Напрямок:';
                    })()}
                    <span className="text-white/80">{threat.targetName}</span>
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
