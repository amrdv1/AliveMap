import React from 'react';
import { useStore } from '../store/useStore';
import { ShieldAlert, Map, AlertTriangle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SummaryView() {
  const { threats, alerts, messages } = useStore();
  
  const activeThreats = threats.filter(t => t.status === 'ACTIVE');
  const alertRegions = Object.entries(alerts).filter(([_, data]) => data.alertnow).map(([region]) => region);

  const sumQuantity = (type: string) => activeThreats.filter(t => t.type === type).reduce((acc, t) => acc + (t.quantity || 1), 0);

  const drones = sumQuantity('DRONE');
  const fpvs = sumQuantity('FPV');
  const molniya = sumQuantity('MOLNIYA');
  const missiles = sumQuantity('MISSILE');
  const cruise = sumQuantity('CRUISE_MISSILE');
  const ballistic = sumQuantity('BALLISTIC_MISSILE');
  const zircon = sumQuantity('ZIRCON');
  const kh101 = sumQuantity('KH101');
  const iskander = sumQuantity('ISKANDER');
  const kinzhal = sumQuantity('KINZHAL');
  const kalibr = sumQuantity('KALIBR');
  const aircraft = sumQuantity('AIRCRAFT');
  const kabs = sumQuantity('KAB');
  const recons = sumQuantity('RECON');
  const unknowns = sumQuantity('UNKNOWN');
  
  const totalActiveQuantity = activeThreats.reduce((acc, t) => acc + (t.quantity || 1), 0);

  return (
    <div className="absolute inset-0 z-20 bg-[#050505]/80 backdrop-blur-2xl pt-20 md:pt-28 px-4 pb-20 md:pb-24 overflow-y-auto custom-scrollbar flex justify-center">
      <div className="w-full max-w-5xl flex flex-col gap-8">
        
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-red-900/20 via-black/40 to-black/40 backdrop-blur-3xl border border-white/5 rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest mb-3 flex items-center gap-4">
              <div className="p-2.5 bg-red-500/10 rounded-2xl border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <ShieldAlert className="text-red-500 w-8 h-8" strokeWidth={2.5} />
              </div>
              ОПЕРАТИВНЕ ЗВЕДЕННЯ
            </h1>
            <p className="text-white/40 font-medium tracking-wider text-sm pl-2">
              Станом на {new Date().toLocaleTimeString('uk-UA')}
            </p>
          </div>
          <div className="relative z-10 bg-red-500/10 border border-red-500/20 px-8 py-5 rounded-[24px] text-center min-w-[180px] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_32px_rgba(239,68,68,0.2)]">
            <div className="text-5xl font-black text-red-500 mb-2 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] tracking-tighter">{totalActiveQuantity}</div>
            <div className="text-[11px] font-black text-red-400/90 uppercase tracking-[0.2em]">Активних цілей</div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <StatCard title="Шахеди" count={drones + fpvs + molniya} color="bg-red-500" icon="🛸" />
          <StatCard title="Ракети" count={missiles + cruise + ballistic + zircon + kh101 + iskander + kinzhal + kalibr} color="bg-orange-500" icon="🚀" />
          <StatCard title="Авіація" count={aircraft} color="bg-blue-500" icon="✈️" />
          <StatCard title="КАБи" count={kabs} color="bg-yellow-500" icon="🎯" />
          <StatCard title="Розвідка" count={recons} color="bg-gray-500" icon="👁️" />
          <StatCard title="Невідомі" count={unknowns} color="bg-zinc-500" icon="❓" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Alerts List */}
          <div className="bg-gradient-to-br from-red-500/5 to-transparent backdrop-blur-3xl border border-red-500/10 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20">
                <AlertTriangle className="text-red-500 w-5 h-5" />
              </div>
              Тривоги ({alertRegions.length})
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {alertRegions.length > 0 ? alertRegions.map(region => (
                <span key={region} className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-bold px-4 py-2 rounded-xl shadow-sm">
                  {region}
                </span>
              )) : (
                <div className="text-gray-500 text-sm italic py-4">Немає активних тривог</div>
              )}
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-bl from-blue-500/5 to-transparent backdrop-blur-3xl border border-blue-500/10 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-3">
              <Info className="text-blue-500 w-6 h-6" />
              Довідка
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed font-medium">
              Дані генеруються штучним інтелектом на основі повідомлень з відкритих Telegram-каналів. 
              Система може робити помилки або показувати цілі із затримкою. 
              Ніколи не покладайтесь на цю карту як на єдине джерело інформації під час реальної загрози. 
              Завжди переходьте в укриття при оголошенні повітряної тривоги.
            </p>
          </div>
        </div>

        {/* Textual Summaries */}
        <div className="bg-gradient-to-t from-purple-500/5 to-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)] mb-10">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <Info className="text-purple-400 w-5 h-5" />
            </div>
            Останні зведення та статистика
          </h2>
          <div className="flex flex-col gap-4">
            {messages.filter(m => m.tags.includes('SUMMARY') || m.text.toLowerCase().match(/(збито|знищено|за добу|наслідки|підсумки|статистика|ліквідаці|зведення|загалом)/)).slice(0, 5).map(msg => (
              <div key={msg.id || Math.random().toString()} className="bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-purple-400 font-bold text-xs uppercase tracking-wider">@{msg.channelName}</span>
                  <span className="text-gray-500 text-[10px] font-mono font-medium">{new Date(msg.timestamp).toLocaleString('uk-UA')}</span>
                </div>
                <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed font-medium">{msg.text}</p>
              </div>
            ))}
            {messages.filter(m => m.tags.includes('SUMMARY') || m.text.toLowerCase().match(/(збито|знищено|за добу|наслідки|підсумки|статистика|ліквідаці|зведення|загалом)/)).length === 0 && (
              <div className="text-gray-500 text-sm italic py-4 text-center">За останній час зведень не надходило</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, count, color, icon }: { title: string, count: number, color: string, icon: string }) {
  const colorMap: Record<string, { text: string, bg: string, border: string, glow: string }> = {
    'bg-red-500': { text: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', glow: 'shadow-[0_0_30px_rgba(239,68,68,0.15)]' },
    'bg-orange-500': { text: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', glow: 'shadow-[0_0_30px_rgba(249,115,22,0.15)]' },
    'bg-blue-500': { text: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', glow: 'shadow-[0_0_30px_rgba(59,130,246,0.15)]' },
    'bg-yellow-500': { text: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', glow: 'shadow-[0_0_30px_rgba(234,179,8,0.15)]' },
    'bg-gray-500': { text: 'text-gray-400', bg: 'bg-white/5', border: 'border-white/10', glow: '' },
    'bg-zinc-500': { text: 'text-zinc-400', bg: 'bg-white/5', border: 'border-white/10', glow: '' },
  };

  const style = colorMap[color] || colorMap['bg-gray-500'];
  const isActive = count > 0;

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }} 
      className={`relative overflow-hidden ${isActive ? style.bg : 'bg-[#0a0a0a]/60'} backdrop-blur-2xl border ${isActive ? style.border : 'border-white/5'} rounded-[24px] p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300 cursor-pointer ${isActive ? style.glow : 'shadow-lg'}`}
    >
      {isActive && <div className={`absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none`} />}
      
      <div className={`relative z-10 w-12 h-12 rounded-[16px] flex items-center justify-center text-2xl ${isActive ? style.bg : 'bg-white/5'} border ${isActive ? style.border : 'border-transparent'} shadow-inner transition-transform duration-500 hover:scale-110`}>
        <span className={isActive ? 'drop-shadow-lg' : 'opacity-50 grayscale'}>{icon}</span>
      </div>
      
      <div className="relative z-10 text-center">
        <div className={`text-4xl font-black tracking-tighter mb-1.5 ${isActive ? style.text : 'text-white/20'}`}>{count}</div>
        <div className={`text-[11px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-white/80' : 'text-white/30'}`}>{title}</div>
      </div>
    </motion.div>
  );
}
