
import React, { useState } from 'react';
import { Tab } from '../types';
import BottomNav from './BottomNav';
import { useApp } from '../contexts/AppContext';

interface DateRangeSelectorViewProps {
  onBack: () => void;
  onApply: (start: Date, end: Date) => void;
}

const DateRangeSelectorView: React.FC<DateRangeSelectorViewProps> = ({ onBack, onApply }) => {
  const { isDarkMode } = useApp();
  // Mocking May 2024 based on the UI
  const daysInMonth = 31;
  const startDayOfWeek = 3; // Wednesday
  const [startDate, setStartDate] = useState<number | null>(10);
  const [endDate, setEndDate] = useState<number | null>(16);

  const handleDayClick = (day: number) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
    } else if (day < startDate) {
      setStartDate(day);
    } else {
      setEndDate(day);
    }
  };

  const isInRange = (day: number) => {
    if (!startDate || !endDate) return false;
    return day > startDate && day < endDate;
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const prevMonthDays = [28, 29, 30];

  return (
    <div className="fixed inset-0 z-[90] bg-[#F8FAFC] dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom duration-400 overflow-y-auto no-scrollbar pb-[180px]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="flex items-center max-w-md mx-auto relative h-10 w-full">
          <button 
            onClick={onBack}
            className="absolute left-0 flex items-center justify-center w-10 h-10 rounded-full text-slate-900 dark:text-white active:bg-gray-100 dark:active:bg-slate-800 transition-colors"
          >
            <span className="material-icons-round">close</span>
          </button>
          <h1 className="w-full text-center text-lg font-bold text-slate-900 dark:text-white">Selecionar Período</h1>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto flex flex-col gap-6 w-full">
        {/* Calendar Card */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)] p-5 border border-slate-50 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">Maio 2024</h2>
            <div className="flex gap-4">
              <button className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><span className="material-icons-round">chevron_left</span></button>
              <button className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><span className="material-icons-round">chevron_right</span></button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-300 dark:text-slate-600 py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {prevMonthDays.map(d => (
              <div key={`prev-${d}`} className="aspect-square flex items-center justify-center text-slate-300 dark:text-slate-700 text-sm font-medium">{d}</div>
            ))}
            {days.map(d => {
              const isStart = startDate === d;
              const isEnd = endDate === d;
              const highlighted = isInRange(d);
              
              return (
                <div 
                  key={d} 
                  onClick={() => handleDayClick(d)}
                  className={`relative aspect-square flex items-center justify-center text-sm font-medium cursor-pointer transition-all ${highlighted ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                >
                  {isStart && <div className="absolute inset-y-1.5 right-0 left-1/2 bg-blue-50 dark:bg-blue-900/20"></div>}
                  {isEnd && <div className="absolute inset-y-1.5 left-0 right-1/2 bg-blue-50 dark:bg-blue-900/20"></div>}
                  
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full relative z-10 transition-colors ${
                    isStart || isEnd ? 'bg-blue-500 text-white font-bold' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {d}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Shortcut Chips */}
        <section className="flex flex-wrap gap-2 px-1">
          {['Últimos 7 dias', 'Últimos 14 dias', 'Últimos 30 dias'].map(label => (
            <button 
              key={label}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-tight py-2.5 px-4 rounded-full active:scale-95 transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              {label}
            </button>
          ))}
        </section>

        {/* Selection Summary */}
        <section className="flex flex-col gap-2 px-1">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Período Selecionado</span>
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">De</span>
              <span className="text-base font-black text-slate-900 dark:text-white">{startDate ? `${startDate} de Maio` : '--'}</span>
            </div>
            <span className="material-icons-round text-slate-300 dark:text-slate-700">arrow_forward</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Até</span>
              <span className="text-base font-black text-slate-900 dark:text-white">{endDate ? `${endDate} de Maio` : '--'}</span>
            </div>
          </div>
          {startDate && endDate && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Você selecionou um intervalo de <span className="font-black text-blue-500 dark:text-blue-400">{endDate - startDate + 1} dias</span>.
            </p>
          )}
        </section>
      </main>

      {/* Action Button */}
      <div className="fixed bottom-[84px] left-0 right-0 p-6 bg-gradient-to-t from-[#F8FAFC] dark:from-slate-950 via-[#F8FAFC] dark:via-slate-950 to-transparent z-40">
        <div className="max-w-md mx-auto">
          <button 
            onClick={() => startDate && endDate && onApply(new Date(), new Date())}
            disabled={!startDate || !endDate}
            className="w-full bg-blue-500 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Aplicar Período
          </button>
        </div>
      </div>

      <BottomNav activeTab={Tab.CICLO} setActiveTab={() => {}} />
    </div>
  );
};

export default DateRangeSelectorView;
