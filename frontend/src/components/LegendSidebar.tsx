import React from 'react';
import { Target, Navigation, Hash, Crosshair } from 'lucide-react';

export default function LegendSidebar() {
  return (
    <div className="h-full flex flex-col text-gray-200">
      <div className="p-4 border-b border-gray-800/50 bg-[#0a0f18]/80">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Інформація</h2>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-6">
        {/* Section 1: How it works */}
        <div>
          <h3 className="text-white font-bold mb-3 text-lg">Як працює радар ALIVEMAP?</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><strong className="text-gray-200">1. Збір даних</strong> — система автоматично моніторить десятки Telegram-каналів ОВА та перевірених джерел цілодобово.</li>
            <li><strong className="text-gray-200">2. ШІ-аналіз</strong> — кожне повідомлення аналізується штучним інтелектом, який визначає тип загрози, місцезнаходження, кількість та напрямок.</li>
            <li><strong className="text-gray-200">3. Геокодування</strong> — назви населених пунктів конвертуються в координати через базу міст України.</li>
            <li><strong className="text-gray-200">4. Відображення</strong> — загроза з'являється на карті з іконкою типу (шахед, ракета, БПЛА) та стрілкою напрямку.</li>
            <li><strong className="text-gray-200">5. Оновлення</strong> — наступні повідомлення про ту ж загрозу оновлюють маркер на карті, а не створюють дублікат.</li>
          </ul>
        </div>

        {/* Section 2: What it shows */}
        <div>
          <h3 className="text-white font-bold mb-3 text-lg">Що показує радар?</h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-[#111622] p-3 rounded-xl border border-gray-800/50">
              <div className="flex items-center gap-2 mb-1">
                <Target size={16} className="text-pink-500" />
                <span className="font-bold text-white text-sm">Місцезнаходження</span>
              </div>
              <p className="text-xs text-gray-400">Точне розташування шахеда або групи шахедів на карті з прив'язкою до населеного пункту.</p>
            </div>
            
            <div className="bg-[#111622] p-3 rounded-xl border border-gray-800/50">
              <div className="flex items-center gap-2 mb-1">
                <Navigation size={16} className="text-blue-400" />
                <span className="font-bold text-white text-sm">Напрямок</span>
              </div>
              <p className="text-xs text-gray-400">Курс польоту — куди рухається загроза. Стрілка на маркері показує напрямок.</p>
            </div>

            <div className="bg-[#111622] p-3 rounded-xl border border-gray-800/50">
              <div className="flex items-center gap-2 mb-1">
                <Hash size={16} className="text-green-400" />
                <span className="font-bold text-white text-sm">Кількість</span>
              </div>
              <p className="text-xs text-gray-400">Скільки шахедів або БПЛА зафіксовано в групі. Число відображається на маркері.</p>
            </div>

            <div className="bg-[#111622] p-3 rounded-xl border border-gray-800/50">
              <div className="flex items-center gap-2 mb-1">
                <Crosshair size={16} className="text-purple-400" />
                <span className="font-bold text-white text-sm">Точка запуску</span>
              </div>
              <p className="text-xs text-gray-400">Звідки запущено: Чорне море, Крим, Краснодарський край, Курськ та інші регіони.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Drone Types */}
        <div>
          <h3 className="text-white font-bold mb-3 text-lg">Типи БПЛА на радарі</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><strong className="text-gray-200">Shahed-136/131</strong> — іранські дрони-камікадзе. Швидкість ~150-180 км/год. Основна загроза при масованих нічних атаках.</li>
            <li><strong className="text-gray-200">Розвідувальні БПЛА</strong> — використовуються для розвідки та коригування. Зазвичай поодинокі.</li>
            <li><strong className="text-gray-200">БПЛА невстановленого типу</strong> — безпілотники, тип яких не ідентифіковано на момент виявлення.</li>
          </ul>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #374151; }
      `}} />
    </div>
  );
}
