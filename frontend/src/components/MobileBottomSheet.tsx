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
    <div className="lg:hidden fixed bottom-4 left-0 right-0 z-40 pointer-events-none" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {/* Threat count indicator */}
      <div className="pointer-events-auto flex items-center justify-center mb-2">
        <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-3 py-1 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-gray-300 tracking-wider uppercase">
            {totalQuantity} {totalQuantity === 1 ? 'ціль' : 'цілей'}
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
              className="flex-shrink-0 w-[260px] bg-black/85 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-pointer active:scale-[0.97] transition-transform"
            >
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: color + '20', border: `1px solid ${color}40` }}
                >
                  <ThreatIcon type={threat.type} className="w-5 h-5" color={color} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-black text-white tracking-wide truncate">
                    {THREAT_LABELS[threat.type] || threat.type}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {threat.speed && (
                      <span className="text-[10px] text-gray-400 font-semibold">
                        {Math.round(threat.speed)} км/г
                      </span>
                    )}
                    {threat.course != null && (
                      <span className="text-[10px] text-gray-500 font-semibold">
                        {Math.round(threat.course)}°
                      </span>
                    )}
                    {threat.quantity > 1 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                        x{threat.quantity}
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
              </div>

              {/* Target name */}
              {threat.targetName && (
                <div className="mt-2 pt-2 border-t border-white/5">
                  <span className="text-[10px] text-gray-500 font-semibold">
                    {(() => {
                        const loc = threat.locations && threat.locations.length > 0 ? threat.locations[0] : null;
                        const isOver = loc && threat.targetLat && threat.targetLng && (Math.sqrt(Math.pow(loc.lat - threat.targetLat, 2) + Math.pow(loc.lng - threat.targetLng, 2)) < 0.25);
                        return isOver ? 'В районі: ' : 'Напрямок: ';
                    })()}
                    <span className="text-gray-300">{threat.targetName}</span>
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
