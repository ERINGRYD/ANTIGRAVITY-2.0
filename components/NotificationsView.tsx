
import React, { useState } from 'react';
import { Tab } from '../types';
import BottomNav from './BottomNav';
import { useApp } from '../contexts/AppContext';

interface NotificationsViewProps {
  onBack: () => void;
}

const NotificationsView: React.FC<NotificationsViewProps> = ({ onBack }) => {
  const { isDarkMode } = useApp();
  const [preferences, setPreferences] = useState({
    dailyReminder: true,
    weeklyReport: true,
    riskGoals: false,
    battleAlert: true,
    achievements: true,
    levelUp: true,
  });

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 z-[80] bg-[#F8FAFC] dark:bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto no-scrollbar pb-32">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-4 py-4">
        <div className="flex items-center max-w-md mx-auto relative w-full">
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-12 h-12 -ml-3 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
          >
            <span className="material-icons-round text-2xl text-slate-900 dark:text-white">chevron_left</span>
          </button>
          <h1 className="text-lg font-bold flex-1 text-center pr-8 text-slate-900 dark:text-white">Alertas e Notificações</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-md mx-auto flex flex-col gap-6 w-full">
        {/* Alertas de Estudo */}
        <section>
          <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Alertas de Estudo</h2>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)] p-6 flex flex-col gap-6 border border-slate-50 dark:border-slate-800">
            <NotificationItem 
              title="Lembrete Diário" 
              desc="Notificações para manter sua sequência de estudos ativa." 
              checked={preferences.dailyReminder}
              onChange={() => togglePreference('dailyReminder')}
            />
            <div className="h-px bg-slate-50 dark:bg-slate-800 w-full"></div>
            <NotificationItem 
              title="Relatório Semanal" 
              desc="Resumo do seu progresso e horas estudadas no domingo." 
              checked={preferences.weeklyReport}
              onChange={() => togglePreference('weeklyReport')}
            />
            <div className="h-px bg-slate-50 dark:bg-slate-800 w-full"></div>
            <NotificationItem 
              title="Metas em Risco" 
              desc="Alertas quando você estiver atrasado em relação ao ciclo." 
              checked={preferences.riskGoals}
              onChange={() => togglePreference('riskGoals')}
            />
          </div>
        </section>

        {/* Gamificação */}
        <section>
          <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Gamificação</h2>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)] p-6 flex flex-col gap-6 border border-slate-50 dark:border-slate-800">
            <NotificationItem 
              title="Aviso de Batalha" 
              desc="Seja avisado quando um desafio no Coliseu estiver disponível." 
              checked={preferences.battleAlert}
              onChange={() => togglePreference('battleAlert')}
            />
            <div className="h-px bg-slate-50 dark:bg-slate-800 w-full"></div>
            <NotificationItem 
              title="Conquistas Desbloqueadas" 
              desc="Receba notificações ao ganhar novos emblemas e troféus." 
              checked={preferences.achievements}
              onChange={() => togglePreference('achievements')}
            />
            <div className="h-px bg-slate-50 dark:bg-slate-800 w-full"></div>
            <NotificationItem 
              title="Subida de Nível" 
              desc="Comemore quando seu avatar subir de nível no ranking." 
              checked={preferences.levelUp}
              onChange={() => togglePreference('levelUp')}
            />
          </div>
        </section>

        {/* Action Button */}
        <footer className="mt-4">
          <button 
            onClick={onBack}
            className="w-full bg-blue-500 text-white text-sm font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all hover:brightness-110"
          >
            Salvar Preferências
          </button>
        </footer>
      </main>

      <BottomNav activeTab={Tab.MAIS} setActiveTab={() => {}} />
    </div>
  );
};

const NotificationItem: React.FC<{ title: string; desc: string; checked: boolean; onChange: () => void }> = ({ title, desc, checked, onChange }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex flex-col gap-0.5 flex-1">
      <span className="text-sm font-bold text-slate-900 dark:text-white">{title}</span>
      <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{desc}</span>
    </div>
    <label className="relative inline-block w-11 h-6 shrink-0 cursor-pointer">
      <input 
        type="checkbox" 
        className="sr-only peer" 
        checked={checked} 
        onChange={onChange}
      />
      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 dark:after:border-slate-600 after:border after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:bg-blue-500 after:shadow-sm"></div>
    </label>
  </div>
);

export default NotificationsView;
