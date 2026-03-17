
import React, { useMemo } from 'react';
import { Subject, StudySession, UserStats } from '../types';
import { useApp } from '../contexts/AppContext';
import ConfidenceCircle from './ConfidenceCircle';
import MiniDonutChart from './MiniDonutChart';

interface BattleHistoryViewProps {
  onBack: () => void;
  subjects: Subject[];
  studyHistory: StudySession[];
  userStats: UserStats;
}

const BattleHistoryView: React.FC<BattleHistoryViewProps> = ({ onBack, subjects, studyHistory, userStats }) => {
  const { isDarkMode } = useApp();

  const battleHistory = useMemo(() => {
    return studyHistory
      .filter(session => session.type === 'batalha')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [studyHistory]);

  const historyGroups = useMemo(() => {
    const groups: { [key: string]: StudySession[] } = {};

    battleHistory.forEach(session => {
      const date = new Date(session.date);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      let dateString = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
      
      if (date.toDateString() === today.toDateString()) {
        dateString = 'Hoje';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateString = 'Ontem';
      }

      if (!groups[dateString]) {
        groups[dateString] = [];
      }
      groups[dateString].push(session);
    });

    return Object.entries(groups).map(([date, items]) => ({
      date,
      items
    }));
  }, [battleHistory]);

  return (
    <div className="fixed inset-0 z-[150] bg-[#f6f7f8] dark:bg-[#0B1120] flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto no-scrollbar pb-32 font-display">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button onClick={onBack} className="flex items-center text-blue-600 dark:text-blue-400 font-semibold gap-1 hover:opacity-80 transition-opacity">
            <span className="material-icons-round text-xl">arrow_back_ios</span>
            <span className="text-[17px]">Voltar</span>
          </button>
          <h1 className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-white">Histórico de Batalhas</h1>
          <div className="w-16"></div>
        </div>
      </header>

      <main className="px-4 py-6 w-full max-w-3xl mx-auto flex flex-col gap-6">
        {/* Legacy Card */}
        <div className="bg-slate-900 rounded-xl shadow-lg p-6 text-white relative overflow-hidden ring-1 ring-slate-800">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-icons-round text-9xl">military_tech</span>
          </div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Seu Legado</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-icons-round text-rose-500">favorite</span>
                <span className="text-sm font-bold text-slate-200">Vida</span>
              </div>
              <div className="h-3 w-full bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${(userStats.hp / 1000) * 100}%` }}></div>
              </div>
              <span className="text-xs text-slate-400 font-mono font-medium">{Math.round(userStats.hp)}/1000 HP</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-icons-round text-amber-400">bolt</span>
                <span className="text-sm font-bold text-slate-200">Energia</span>
              </div>
              <div className="h-3 w-full bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                <div className="h-full bg-amber-400 transition-all duration-1000" style={{ width: `${userStats.stamina}%` }}></div>
              </div>
              <span className="text-xs text-slate-400 font-mono font-medium">{userStats.stamina}% Stamina</span>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Total de Batalhas</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{battleHistory.length}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Precisão Média</span>
            <span className="text-2xl font-black text-emerald-500">
              {battleHistory.length > 0 
                ? Math.round(battleHistory.reduce((acc, s) => acc + s.accuracy, 0) / battleHistory.length) 
                : 0}%
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative flex flex-col gap-0 pb-10">
          {historyGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-700 mb-4">swords</span>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhuma batalha registrada ainda.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Vença inimigos no Campo de Batalha para ver seu histórico aqui.</p>
            </div>
          ) : (
            historyGroups.map((group, gIdx) => (
              <React.Fragment key={group.date}>
                <div className="flex items-center gap-4 mb-4 z-10 bg-[#f6f7f8] dark:bg-[#0B1120] py-2 sticky top-[72px]">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">{group.date}</span>
                  <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800"></div>
                </div>
                
                {group.items.map((session, sIdx) => {
                  const subject = subjects.find(s => s.id === session.subjectId);
                  
                  return (
                    <BattleTimelineItem 
                      key={session.id}
                      session={session}
                      subject={subject}
                      isLast={gIdx === historyGroups.length - 1 && sIdx === group.items.length - 1}
                    />
                  );
                })}
              </React.Fragment>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

const BattleTimelineItem: React.FC<{ session: StudySession, subject?: Subject, isLast: boolean }> = ({ session, subject, isLast }) => {
  const date = new Date(session.date);
  const timeString = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  const subjectColor = subject?.color || '#3B82F6';

  return (
    <div className="relative pl-12 pb-8">
      {!isLast && <div className="absolute top-0 bottom-0 left-[19px] w-0.5 bg-slate-200 dark:bg-slate-800 z-0"></div>}
      
      {/* Timeline Icon */}
      <div 
        className="absolute left-0 top-0 z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-sm bg-white dark:bg-slate-900"
        style={{ borderColor: subjectColor }}
      >
        <span className="material-symbols-outlined text-xl" style={{ color: subjectColor }}>
          {subject?.icon || 'swords'}
        </span>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ backgroundColor: `${subjectColor}15`, color: subjectColor }}>
                {subject?.name || session.subjectName}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{timeString}</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">
              {session.topicName}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-sm font-black text-blue-500">+{session.xpEarned} XP</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50 dark:border-slate-800">
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Precisão</span>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${session.accuracy >= 70 ? 'bg-emerald-500' : session.accuracy >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${session.accuracy}%` }}
                ></div>
              </div>
              <span className={`text-xs font-black ${session.accuracy >= 70 ? 'text-emerald-500' : session.accuracy >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                {session.accuracy}%
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Questões</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {session.questionsCompleted} Resolvidas
            </span>
          </div>
        </div>

        {/* Confidence & Errors */}
        {(session.confidenceStats || (session.errorReasons && Object.keys(session.errorReasons).length > 0)) && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50 dark:border-slate-800">
            {session.confidenceStats && (
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">CONFIANÇA</span>
                <div className="flex items-center gap-3">
                  <ConfidenceCircle stats={session.confidenceStats} size={36} strokeWidth={5} />
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">{session.confidenceStats.certeza}% Certeza</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                      <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">{session.confidenceStats.duvida}% Dúvida</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">{session.confidenceStats.chute}% Chute</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {session.errorReasons && Object.keys(session.errorReasons).length > 0 && (
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">ANÁLISE DE ERROS</span>
                <div className="flex items-center gap-3">
                  <MiniDonutChart 
                    data={Object.entries(session.errorReasons).map(([reason, count]) => {
                      let color = '#64748b'; // Default Outro
                      if (reason === 'Interpretação') color = '#3b82f6';
                      if (reason === 'Conteúdo') color = '#f59e0b';
                      if (reason === 'Distração') color = '#ef4444';
                      return { label: reason, value: count, color };
                    })} 
                    size={36} 
                    strokeWidth={5} 
                  />
                  <div className="flex flex-col gap-0.5">
                    {Object.entries(session.errorReasons).map(([reason, count]) => {
                      const totalErrors = Object.values(session.errorReasons!).reduce((a, b) => a + b, 0);
                      const percent = Math.round((count / totalErrors) * 100);
                      let color = 'bg-slate-500';
                      if (reason === 'Interpretação') color = 'bg-blue-500';
                      if (reason === 'Conteúdo') color = 'bg-amber-500';
                      if (reason === 'Distração') color = 'bg-red-500';
                      
                      return (
                        <div key={reason} className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${color}`}></div>
                          <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">
                            {percent}% {reason}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleHistoryView;
