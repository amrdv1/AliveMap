import React from 'react';
import { useStore } from '../store/useStore';
import { X, MapPin, Navigation, BarChart3, Target } from 'lucide-react';

export default function AboutModal() {
  const { isAboutOpen, setAboutOpen } = useStore();

  if (!isAboutOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#121212] w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-2xl shadow-2xl border border-gray-800 text-white font-sans relative">
        <button 
          onClick={() => setAboutOpen(false)}
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="p-8 md:p-12 space-y-10">
          
          {/* Section 1: How it works */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Як працює радар шахедів ALIVEMAP?</h2>
            <ol className="space-y-4 text-sm md:text-base text-gray-300">
              <li>
                <strong className="text-white">1. Збір даних</strong> — система автоматично моніторить десятки Telegram-каналів ОВА та перевірених джерел цілодобово
              </li>
              <li>
                <strong className="text-white">2. ШІ-аналіз</strong> — кожне повідомлення аналізується, штучний інтелект визначає тип загрози, місцезнаходження, кількість та напрямок
              </li>
              <li>
                <strong className="text-white">3. Геокодування</strong> — назви населених пунктів конвертуються в координати через базу з 30 000+ міст та сіл України
              </li>
              <li>
                <strong className="text-white">4. Відображення</strong> — загроза з'являється на карті за 5-10 секунд з іконкою типу (шахед, ракета, БПЛА) та стрілкою напрямку
              </li>
              <li>
                <strong className="text-white">5. Оновлення</strong> — наступні повідомлення про ту ж загрозу оновлюють маркер на карті (координати, напрямок), а не створюють дублікат
              </li>
            </ol>
          </section>

          {/* Section 2: What radar shows */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Що показує радар?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#1a1a1a] border border-gray-800/50 rounded-xl p-5">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <span className="text-red-400"><MapPin size={20} /></span> Місцезнаходження
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Точне розташування шахеда або групи шахедів на карті з прив'язкою до населеного пункту.
                </p>
              </div>
              <div className="bg-[#1a1a1a] border border-gray-800/50 rounded-xl p-5">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <span className="text-blue-400"><Navigation size={20} /></span> Напрямок
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Курс польоту — куди рухається загроза. Стрілка на маркері показує напрямок.
                </p>
              </div>
              <div className="bg-[#1a1a1a] border border-gray-800/50 rounded-xl p-5">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <span className="text-green-400"><BarChart3 size={20} /></span> Кількість
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Скільки шахедів або БПЛА зафіксовано в групі. Число відображається на маркері (незабаром).
                </p>
              </div>
              <div className="bg-[#1a1a1a] border border-gray-800/50 rounded-xl p-5">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <span className="text-purple-400"><Target size={20} /></span> Точка запуску
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Звідки запущено: Чорне море, Крим, Краснодарський край, Курськ та інші регіони.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Types */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Типи БПЛА на радарі</h2>
            <ul className="space-y-4 text-sm md:text-base text-gray-300 list-disc pl-5">
              <li>
                <strong className="text-white">Shahed-136/131</strong> — іранські дрони-камікадзе. Швидкість ~150-180 км/год. Основна загроза при масованих нічних атаках.
              </li>
              <li>
                <strong className="text-white">Розвідувальні БПЛА</strong> — використовуються для розвідки та коригування. Зазвичай поодинокі.
              </li>
              <li>
                <strong className="text-white">БПЛА невстановленого типу</strong> — безпілотники, тип яких не ідентифіковано на момент виявлення.
              </li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}
