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
    <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-md pt-16 md:pt-24 px-4 pb-20 md:pb-24 overflow-y-auto custom-scrollbar flex justify-center">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-white/[0.05] to-transparent backdrop-blur-3xl border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div>
            <h1 className="text-xl md:text-3xl font-black text-white uppercase tracking-wider mb-2 flex items-center gap-3">
              <ShieldAlert className="text-red-500 w-8 h-8" />
              Оперативне Зведення
            </h1>
            <p className="text-gray-400 font-medium tracking-wide">
              Поточна ситуація в повітряному просторі України станом на {new Date().toLocaleTimeString('uk-UA')}
            </p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 px-6 py-4 rounded-2xl text-center min-w-[150px]">
            <div className="text-3xl font-black text-red-500 mb-1">{totalActiveQuantity}</div>
            <div className="text-xs font-bold text-red-400/80 uppercase tracking-widest">Активних цілей</div>
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
  const colorMap: Record<string, { text: string, bg: string, border: string, from: string }> = {
    'bg-red-500': { text: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', from: 'from-red-500/10' },
    'bg-orange-500': { text: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', from: 'from-orange-500/10' },
    'bg-blue-500': { text: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', from: 'from-blue-500/10' },
    'bg-yellow-500': { text: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', from: 'from-yellow-500/10' },
    'bg-gray-500': { text: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20', from: 'from-gray-500/10' },
    'bg-zinc-500': { text: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20', from: 'from-zinc-500/10' },
  };

  const style = colorMap[color] || colorMap['bg-gray-500'];

  return (
    <motion.div 
      whileHover={{ scale: 1.03, y: -2 }} 
      className="bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-3xl border border-white/10 rounded-3xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center gap-4 relative overflow-hidden group cursor-pointer"
    >
      <div className={`absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b ${style.from} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
      
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${style.bg} border ${style.border} shadow-inner z-10 transition-transform duration-300 group-hover:scale-110`}>
        {icon}
      </div>
      
      <div className="text-center z-10">
        <div className={`text-3xl font-black ${style.text} drop-shadow-md mb-1`}>{count}</div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] group-hover:text-white transition-colors">{title}</div>
      </div>
    </motion.div>
  );
}
