import React, { useState } from 'react';
import { Achievement, UserStats } from '../types';
import { useApp } from '../contexts/AppContext';

interface AchievementsViewProps {
  userStats: UserStats;
  onBack: () => void;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    title: 'Primeiros Passos',
    description: 'Completou sua primeira sessão de estudo de 25 minutos.',
    icon: 'rocket_launch',
    rarity: 'common',
    isUnlocked: true,
    unlockedAt: '12 Out 2023',
  },
  {
    id: '2',
    title: 'Foco Inabalável',
    description: 'Completou 4 sessões seguidas no Modo Estrito.',
    icon: 'shield',
    rarity: 'rare',
    isUnlocked: true,
    unlockedAt: '15 Out 2023',
  },
  {
    id: '3',
    title: 'Maratonista Noturno',
    description: 'Estudou por mais de 3 horas após às 22:00.',
    icon: 'dark_mode',
    rarity: 'rare',
    isUnlocked: false,
    progress: 65,
    currentValue: '2h',
    goalValue: '3h',
  },
  {
    id: '4',
    title: 'Mestre do Ciclo',
    description: 'Mantenha todas as matérias acima de 50% de progresso.',
    icon: 'loop',
    rarity: 'epic',
    isUnlocked: false,
    progress: 40,
    currentValue: '2/5',
    goalValue: '5/5',
  },
  {
    id: '5',
    title: 'Lenda do Coliseu',
    description: 'Vença 50 batalhas contra o tempo sem errar questões.',
    icon: 'workspace_premium',
    rarity: 'legendary',
    isUnlocked: false,
    progress: 10,
    currentValue: '5',
    goalValue: '50',
  },
  {
    id: '6',
    title: 'Semana Perfeita',
    description: 'Bateu todas as metas diárias por 7 dias consecutivos.',
    icon: 'calendar_month',
    rarity: 'epic',
    isUnlocked: false,
    progress: 85,
    currentValue: '6',
    goalValue: '7',
  },
];

const AchievementsView: React.FC<AchievementsViewProps> = ({ userStats, onBack }) => {
  const { isDarkMode } = useApp();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const filteredAchievements = ACHIEVEMENTS.filter(a => {
    if (filter === 'unlocked') return a.isUnlocked;
    if (filter === 'locked') return !a.isUnlocked;
    return true;
  });

  const getRarityStyles = (rarity: Achievement['rarity'], unlocked: boolean) => {
    if (!unlocked) return {
      bg: isDarkMode ? 'bg-slate-800' : 'bg-slate-100',
      text: isDarkMode ? 'text-slate-500' : 'text-slate-400',
      border: isDarkMode ? 'border-slate-700' : 'border-slate-200',
      iconBg: isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
    };

    switch (rarity) {
      case 'common': return { bg: isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', iconBg: 'bg-orange-500' };
      case 'rare': return { bg: isDarkMode ? 'bg-slate-800' : 'bg-slate-50', text: isDarkMode ? 'text-slate-400' : 'text-slate-600', border: isDarkMode ? 'border-slate-700' : 'border-slate-300', iconBg: 'bg-slate-400' };
      case 'epic': return { bg: isDarkMode ? 'bg-amber-900/20' : 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', iconBg: 'bg-amber-500' };
      case 'legendary': return { bg: isDarkMode ? 'bg-emerald-900/20' : 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', iconBg: 'bg-emerald-500' };
      default: return { bg: isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', iconBg: 'bg-blue-500' };
    }
  };

  const nextLevelXP = userStats.level * 100;
  const currentLevelXPProgress = userStats.xp % 100;
  const progressPercent = (currentLevelXPProgress / 100) * 100;

  return (
    <div className="fixed inset-0 z-[150] bg-slate-50 dark:bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto no-scrollbar pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-100 dark:border-slate-800 px-5 py-4 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <span className="material-icons-round text-2xl">arrow_back</span>
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Conquistas</h1>
              <p className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest">Nível {userStats.level} • {userStats.xp.toLocaleString()} XP</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-800">
            <span className="material-icons-round text-blue-500 text-sm">emoji_events</span>
            <span className="text-sm font-black text-blue-600 dark:text-blue-400">{userStats.unlockedAchievements.length}/15</span>
          </div>
        </div>
      </header>

      <main className="px-5 py-8 max-w-4xl mx-auto w-full space-y-8">
        {/* Progress Card */}
        <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                  <span className="text-2xl font-black">{userStats.level}</span>
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Mestre Aprendiz</h2>
                  <p className="text-sm font-medium text-slate-400 dark:text-slate-500">Faltam {100 - currentLevelXPProgress} XP para o Nível {userStats.level + 1}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full shadow-sm transition-all duration-700" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <span>{currentLevelXPProgress} XP</span>
                  <span>100 XP</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl text-center min-w-[100px]">
                <span className="block text-2xl font-black text-slate-900 dark:text-white">{userStats.dailyStreak.toString().padStart(2, '0')}</span>
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Sequência</span>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-4 rounded-2xl text-center min-w-[100px]">
                <span className="block text-2xl font-black text-amber-600">{Math.floor(userStats.xp / 100)}</span>
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Prestígio</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm self-start">
          <button 
            onClick={() => setFilter('all')}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${filter === 'all' ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            Todas
          </button>
          <button 
            onClick={() => setFilter('unlocked')}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${filter === 'unlocked' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            Atingidas
          </button>
          <button 
            onClick={() => setFilter('locked')}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${filter === 'locked' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            Futuras
          </button>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAchievements.map((achievement) => {
            const styles = getRarityStyles(achievement.rarity, achievement.isUnlocked);
            return (
              <div 
                key={achievement.id}
                className={`group relative bg-white dark:bg-slate-900 rounded-[32px] p-6 border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${achievement.isUnlocked ? styles.border : 'border-slate-100 dark:border-slate-800 opacity-90'}`}
              >
                {!achievement.isUnlocked && (
                  <div className="absolute top-4 right-4 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg text-slate-400 dark:text-slate-500">
                    <span className="material-icons-round text-sm">lock</span>
                  </div>
                )}
                
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg transition-transform group-hover:scale-110 ${styles.iconBg} ${!achievement.isUnlocked ? 'grayscale' : ''}`}>
                  <span className="material-icons-round text-2xl">{achievement.icon}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-black text-sm leading-tight ${achievement.isUnlocked ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                      {achievement.title}
                    </h3>
                  </div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {achievement.description}
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800">
                  {achievement.isUnlocked ? (
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-black uppercase tracking-widest ${styles.text}`}>
                        {achievement.rarity}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        {achievement.unlockedAt}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        <span>{achievement.progress}%</span>
                        <span>{achievement.currentValue}/{achievement.goalValue}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-400 rounded-full transition-all duration-1000" 
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default AchievementsView;