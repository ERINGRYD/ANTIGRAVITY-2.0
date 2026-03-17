
import React, { useMemo } from 'react';
import { Subject, StudySession, UserStats } from '../types';
import { useApp } from '../contexts/AppContext';
import ConfidenceCircle from './ConfidenceCircle';
import MiniDonutChart from './MiniDonutChart';

interface HistoryViewProps {
  onBack: () => void;
  subjects: Subject[];
  studyHistory: StudySession[];
  userStats: UserStats;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onBack, subjects, studyHistory, userStats }) => {
  const { isDarkMode } = useApp();
  const [showLegacyInfo, setShowLegacyInfo] = React.useState(false);

  const historyGroups = useMemo(() => {
    const groups: { [key: string]: StudySession[] } = {};
    const sortedHistory = [...studyHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    sortedHistory.forEach(session => {
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
  }, [studyHistory]);

  // Calculate HP and Stamina based on XP/Level for visual representation
  const maxHP = 1000;
  const currentHP = userStats.hp ?? 1000;
  const hpPercentage = (currentHP / maxHP) * 100;
  
  const maxStamina = 100;
  const currentStamina = userStats.stamina ?? 100;
  const staminaPercentage = (currentStamina / maxStamina) * 100;

  return (
    <div className="fixed inset-0 z-[150] bg-[#f6f7f8] dark:bg-[#111821] flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto no-scrollbar pb-32 font-display">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button onClick={onBack} className="flex items-center text-blue-600 dark:text-blue-400 font-semibold gap-1 hover:opacity-80 transition-opacity">
            <span className="material-icons-round text-xl">arrow_back_ios</span>
            <span className="text-[17px]">Voltar</span>
          </button>
          <h1 className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-white">Histórico de Sessões</h1>
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
            <button 
              className={`text-slate-500 hover:text-slate-300 transition-colors ${showLegacyInfo ? 'text-blue-400' : ''}`}
              onClick={() => setShowLegacyInfo(!showLegacyInfo)}
              title="Como funciona: Vida diminui se você não estudar, Energia é usada para batalhas."
            >
              <span className="material-icons-round text-sm">info</span>
            </button>
          </div>
          
          {showLegacyInfo && (
            <div className="mb-6 bg-slate-800/50 p-3 rounded-lg border border-slate-700 text-xs text-slate-300 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="mb-2"><strong className="text-rose-400">Vida (HP):</strong> Representa sua consistência. Diminui se você ficar dias sem estudar. Se chegar a zero, você perde seu nível!</p>
              <p><strong className="text-amber-400">Energia (Stamina):</strong> Usada para participar de Batalhas e Desafios no Coliseu. Recupera com o tempo ou completando sessões de estudo.</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-icons-round text-rose-500">favorite</span>
                <span className="text-sm font-bold text-slate-200">Vida</span>
              </div>
              <div className="h-3 w-full bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${hpPercentage}%` }}></div>
              </div>
              <span className="text-xs text-slate-400 font-mono font-medium">{Math.round(currentHP)}/{maxHP} HP</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-icons-round text-amber-400">bolt</span>
                <span className="text-sm font-bold text-slate-200">Energia</span>
              </div>
              <div className="h-3 w-full bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                <div className="h-full bg-amber-400 transition-all duration-1000" style={{ width: `${staminaPercentage}%` }}></div>
              </div>
              <span className="text-xs text-slate-400 font-mono font-medium">{currentStamina}% Stamina</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative flex flex-col gap-0 pb-10">
          {historyGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="material-icons-round text-4xl text-slate-300 mb-2">history</span>
              <p className="text-slate-500 font-medium">Nenhuma atividade registrada ainda.</p>
            </div>
          ) : (
            historyGroups.map((group, gIdx) => (
              <React.Fragment key={group.date}>
                <div className="flex items-center gap-4 mb-4 z-10 bg-[#f6f7f8] dark:bg-[#111821] py-2 sticky top-[72px]">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">{group.date}</span>
                  <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800"></div>
                </div>
                
                {group.items.map((session, sIdx) => {
                  const isEpic = session.xpEarned >= 100; // Logic for epic session
                  const subject = subjects.find(s => s.id === session.subjectId);
                  
                  return (
                    <TimelineItem 
                      key={session.id}
                      session={session}
                      subject={subject}
                      isEpic={isEpic}
                      isLast={gIdx === historyGroups.length - 1 && sIdx === group.items.length - 1}
                    />
                  );
                })}
              </React.Fragment>
            ))
          )}

          {historyGroups.length > 0 && (
            <div className="relative pl-16 mt-4">
              <div className="absolute left-[12px] top-0 w-4 h-4 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Início da Jornada</p>
            </div>
          )}
        </div>
      </main>

      {/* Navigation Reused - Visual only as per screenshot, but functional if needed */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-2 pb-8 pt-2 flex justify-around items-center z-50 h-[84px]">
        <NavButton icon="home" label="Início" />
        <div className="relative flex flex-col items-center justify-center w-16">
          <div className="absolute top-[-4px] left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
          <span className="material-icons-round text-2xl text-blue-500">donut_large</span>
          <span className="text-[10px] font-bold text-blue-500">Ciclo</span>
        </div>
        <NavButton icon="swords" label="Batalha" isSymbol />
        <NavButton icon="account_balance" label="Coliseu" isSymbol />
        <NavButton icon="more_horiz" label="Mais" />
      </nav>
    </div>
  );
};

const TimelineItem: React.FC<{ session: StudySession, subject?: Subject, isEpic: boolean, isLast: boolean }> = ({ session, subject, isEpic, isLast }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const date = new Date(session.date);
  const timeString = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  // Use subject color or fallback
  const subjectColor = subject?.color || '#F59E0B'; // Default to amber if no subject
  
  // Helper to get Tailwind classes based on color
  const getColorClasses = (color: string) => {
    return {
      border: color,
      bgLight: `${color}15`, // 15 is approx 8% opacity
      bgMedium: `${color}30`, // 30 is approx 20% opacity
      text: color
    };
  };

  const colors = getColorClasses(subjectColor);

  return (
    <div className="relative pl-16 pb-8">
      {!isLast && <div className="absolute top-0 bottom-0 left-[27px] w-0.5 bg-slate-200 dark:bg-slate-800 z-0"></div>}
      
      {/* Timeline Icon */}
      <div 
        className="absolute left-0 top-0 z-10 w-14 h-14 rounded-full border-2 flex items-center justify-center shadow-lg bg-white dark:bg-slate-900 cursor-pointer transition-transform active:scale-95"
        style={{ borderColor: colors.border, boxShadow: `0 0 0 4px ${colors.bgLight}` }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="material-icons-round text-2xl" style={{ color: colors.text }}>
          {subject?.icon || 'emoji_events'}
        </span>
      </div>

      {/* Card */}
      <div 
        className={`bg-white dark:bg-slate-900 rounded-xl shadow-lg ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-blue-100 dark:ring-blue-900' : ''}`}
      >
        
        {/* Card Header (Always Visible) */}
        <div 
          className="p-4 border-l-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" 
          style={{ borderLeftColor: colors.border, backgroundColor: isExpanded ? colors.bgLight : 'transparent' }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                {subject?.name || session.subjectName}
              </h3>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.text }}>
                {session.topicName}
              </p>
              
              {/* Collapsed State Info */}
              {!isExpanded && (
                <div className="flex items-center gap-3 mt-2 text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className="material-icons-round text-sm">timer</span>
                    <span className="text-xs font-medium">{session.minutesStudied}m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-icons-round text-sm">schedule</span>
                    <span className="text-xs font-medium">{timeString}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <span 
                className="text-xs font-black px-2 py-1 rounded"
                style={{ backgroundColor: colors.bgMedium, color: colors.text }}
              >
                +{session.xpEarned} XP
              </span>
              <span className={`material-icons-round text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            {/* Stats Grid */}
            <div className="px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <span className="material-icons-round text-blue-500 text-base">timer</span>
                  <span className="text-xs font-medium uppercase tracking-wide">Tempo</span>
                </div>
                <p className="text-lg font-bold text-slate-800 dark:text-white pl-6">{session.minutesStudied}m</p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <span className="material-icons-round text-blue-500 text-base">pause_circle</span>
                  <span className="text-xs font-medium uppercase tracking-wide">Pausa</span>
                </div>
                <p className="text-lg font-bold text-slate-800 dark:text-white pl-6">{session.pauseMinutes || 0}m</p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <span className="material-icons-round text-slate-400 text-base">assignment</span>
                  <span className="text-xs font-medium uppercase tracking-wide">Exercícios</span>
                </div>
                <p className="text-base font-semibold text-slate-800 dark:text-white pl-6">{session.questionsCompleted} Resolvidos</p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <span className="material-icons-round text-slate-400 text-base">auto_stories</span>
                  <span className="text-xs font-medium uppercase tracking-wide">Páginas</span>
                </div>
                <p className="text-base font-semibold text-slate-800 dark:text-white pl-6">{session.pagesRead || 0} Lidas</p>
              </div>
            </div>

            {/* Confidence & Errors (for battle sessions) */}
            {session.type === 'batalha' && (session.confidenceStats || (session.errorReasons && Object.keys(session.errorReasons).length > 0)) && (
              <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Tags Footer */}
            <div className="px-4 py-3 flex flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="material-icons-round text-slate-400 text-sm">calendar_today</span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Hoje, {timeString}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="material-icons-round text-slate-400 text-sm">school</span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{subject?.name || session.subjectName}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                <span className="material-icons-round text-emerald-500 text-sm">check_circle</span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Concluído</span>
              </div>
            </div>

            {/* Bottom Link */}
            <div className="px-4 py-3 bg-[#F8FAFC] dark:bg-slate-800/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">📍</span>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {session.stopPoint || session.topicName}
                </span>
              </div>
              <span className="material-icons-round text-slate-400 text-xl">chevron_right</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const NavButton: React.FC<{ icon: string, label: string, isSymbol?: boolean }> = ({ icon, label, isSymbol }) => (
  <button className="flex flex-col items-center justify-center gap-0.5 text-slate-400 dark:text-slate-500 w-16 hover:text-blue-500 transition-colors">
    {isSymbol ? (
      <span className="material-symbols-outlined text-2xl">{icon}</span>
    ) : (
      <span className="material-icons-round text-2xl">{icon}</span>
    )}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default HistoryView;
