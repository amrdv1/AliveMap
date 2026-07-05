import React from 'react';
import { useStore } from '../store/useStore';
import { ShieldAlert, Map, AlertTriangle, Info } from 'lucide-react';

export default function SummaryView() {
  const { threats, alerts } = useStore();
  
  const activeThreats = threats.filter(t => t.status === 'ACTIVE');
  const alertRegions = Object.entries(alerts).filter(([_, data]) => data.alertnow).map(([region]) => region);

  const drones = activeThreats.filter(t => t.type === 'DRONE');
  const missiles = activeThreats.filter(t => t.type.includes('MISSILE'));
  const aircraft = activeThreats.filter(t => t.type === 'AIRCRAFT');
  const kabs = activeThreats.filter(t => t.type === 'KAB');

  return (
    <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-md pt-24 px-4 pb-24 overflow-y-auto custom-scrollbar flex justify-center">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        
        {/* Header */}
        <div className="bg-[#010a1b] border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-wider mb-2 flex items-center gap-3">
              <ShieldAlert className="text-red-500 w-8 h-8" />
              Оперативне Зведення
            </h1>
            <p className="text-gray-400 font-medium tracking-wide">
              Поточна ситуація в повітряному просторі України станом на {new Date().toLocaleTimeString('uk-UA')}
            </p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 px-6 py-4 rounded-2xl text-center min-w-[150px]">
            <div className="text-3xl font-black text-red-500 mb-1">{activeThreats.length}</div>
            <div className="text-xs font-bold text-red-400/80 uppercase tracking-widest">Активних цілей</div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Шахеди" count={drones.length} color="bg-red-500" icon="🛸" />
          <StatCard title="Ракети" count={missiles.length} color="bg-orange-500" icon="🚀" />
          <StatCard title="Тактична Авіація" count={aircraft.length} color="bg-blue-500" icon="✈️" />
          <StatCard title="КАБи / БПЛА" count={kabs.length + activeThreats.filter(t=>t.type==='RECON').length} color="bg-yellow-500" icon="🎯" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Alerts List */}
          <div className="bg-[#070b14]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <AlertTriangle className="text-orange-500 w-6 h-6" />
              Тривоги ({alertRegions.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {alertRegions.length > 0 ? alertRegions.map(region => (
                <span key={region} className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-lg">
                  {region}
                </span>
              )) : (
                <div className="text-gray-500 text-sm italic py-4">Немає активних тривог</div>
              )}
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-[#070b14]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
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
        <div className="bg-[#070b14]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <Info className="text-purple-500 w-6 h-6" />
            Останні зведення та статистика
          </h2>
          <div className="flex flex-col gap-4">
            {messages.filter(m => m.tags.includes('SUMMARY') || m.text.toLowerCase().match(/(збито|знищено|за добу|наслідки|підсумки|статистика|ліквідаці|зведення|загалом)/)).slice(0, 5).map(msg => (
              <div key={msg.id || Math.random().toString()} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-purple-400 font-bold text-xs uppercase">{msg.channelName}</span>
                  <span className="text-white/40 text-[10px] font-mono">{new Date(msg.timestamp).toLocaleString('uk-UA')}</span>
                </div>
                <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
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
  return (
    <div className="bg-[#070b14]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${color.replace('bg-', 'bg-').replace('500', '500/20')} border ${color.replace('bg-', 'border-').replace('500', '500/30')}`}>
        {icon}
      </div>
      <div>
        <div className={`text-2xl font-black ${color.replace('bg-', 'text-')}`}>{count}</div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</div>
      </div>
    </div>
  );
}
