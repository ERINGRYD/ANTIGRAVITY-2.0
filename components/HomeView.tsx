import React from 'react';
import { Subject, Goal, UserStats, StudySession } from '../types';
import VitalStatusCard from './VitalStatusCard';

interface HomeViewProps {
  subjects: Subject[];
  goals: Goal[];
  userStats: UserStats;
  studyHistory: StudySession[];
  onStartStudy: (id: string) => void;
  onNavigateToTab: (tab: any) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ subjects, goals, userStats, studyHistory, onStartStudy, onNavigateToTab }) => {
  const nextSubject = subjects[0];
  const completedGoals = goals.filter(g => g.isCompleted).length;
  const progress = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0;
  const totalStudyTime = subjects.reduce((sum, subject) => sum + subject.studiedMinutes, 0);

  return (
    <main className="px-6 py-8 flex flex-col gap-8 animate-in fade-in duration-500 pb-32 max-w-7xl mx-auto w-full">
      <VitalStatusCard userStats={userStats} studyHistory={studyHistory} />

      <section className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[32px] p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Sequência Atual</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black">{userStats.dailyStreak} Dias</span>
              <div className="bg-white/20 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase">Fogo! 🔥</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">XP Acumulado</span>
            <span className="text-2xl font-black tabular-nums">{userStats.xp.toLocaleString()}</span>
          </div>
        </div>
        <div className="mt-6 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full w-[65%] shadow-sm"></div>
        </div>
      </section>

      {nextSubject && (
        <section className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Próxima Matéria</h3>
            <span 
              className="text-[10px] font-black px-2 py-1 rounded-lg"
              style={{ color: nextSubject.color, backgroundColor: `${nextSubject.color}1A` }}
            >
              Ciclo Ativo
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: nextSubject.color }}
            >
              <span className="material-icons-round text-3xl">{nextSubject.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-black text-slate-900 dark:text-white truncate">{nextSubject.name}</h4>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Último estudo: {userStats.lastStudyDate ? new Date(userStats.lastStudyDate).toLocaleDateString() : 'Ainda não iniciado'}</p>
            </div>
            <button 
              onClick={() => onStartStudy(nextSubject.id)}
              className="w-12 h-12 text-white rounded-full flex items-center justify-center active:scale-95 transition-all"
              style={{ 
                backgroundColor: nextSubject.color,
                boxShadow: `0 8px 16px ${nextSubject.color}4D`
              }}
            >
              <span className="material-icons-round text-2xl">play_arrow</span>
            </button>
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3 transition-colors duration-300">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
            <span className="material-icons-round">schedule</span>
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{Math.round(totalStudyTime / 60)}h</span>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tempo Total</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3 transition-colors duration-300">
          <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
            <span className="material-icons-round">bolt</span>
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{userStats.level}</span>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nível Atual</p>
          </div>
        </div>
      </div>

      <section className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-6 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
              <span className="material-icons-round">task_alt</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Metas Semanais</h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{completedGoals} de {goals.length} concluídas</p>
            </div>
          </div>
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-700"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 transition-all duration-1000 ease-out"
                strokeDasharray={`${progress}, 100`}
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-black text-slate-900 dark:text-white">{progress}%</span>
          </div>
        </div>

        {goals.length > 0 ? (
          <div className="flex flex-col gap-4">
            {goals.map(goal => {
              const goalProgress = Math.min(100, Math.round((goal.currentMinutes / goal.targetMinutes) * 100));
              return (
                <div key={goal.id} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{goal.title}</span>
                    <span className="font-medium text-slate-500 dark:text-slate-400">{Math.round(goal.currentMinutes / 60)}h / {Math.round(goal.targetMinutes / 60)}h</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${goal.isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`}
                      style={{ width: `${goalProgress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma meta definida para esta semana.</p>
            <button 
              onClick={() => onNavigateToTab('mais')} 
              className="mt-2 text-sm font-bold text-blue-500 hover:text-blue-600"
            >
              Definir Metas
            </button>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide px-1">Atividades Recomendadas</h3>
        <div className="flex flex-col gap-3">
          <RecommendationItem 
            icon="psychology" 
            title="Revisar Flashcards" 
            desc="Matemática: Geometria Analítica" 
            color="text-indigo-500" 
            bg="bg-indigo-50"
            darkBg="dark:bg-indigo-500/10"
          />
          <RecommendationItem 
            icon="swords" 
            title="Desafio Diário" 
            desc="Ganhe bônus de 200 XP agora" 
            color="text-red-500" 
            bg="bg-red-50"
            darkBg="dark:bg-red-500/10"
          />
        </div>
      </section>
    </main>
  );
};

const RecommendationItem: React.FC<{ icon: string; title: string; desc: string; color: string; bg: string; darkBg: string }> = ({ icon, title, desc, color, bg, darkBg }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group">
    <div className={`w-12 h-12 ${bg} ${darkBg} ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
      <span className="material-icons-round">{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h4>
      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{desc}</p>
    </div>
    <span className="material-icons-round text-slate-300 dark:text-slate-600">chevron_right</span>
  </div>
);

export default HomeView;