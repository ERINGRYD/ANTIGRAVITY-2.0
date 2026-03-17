import React from 'react';
import { Subject, UserStats } from '../types';
import DonutChart from './DonutChart';

interface DashboardHeroProps {
  subjects: Subject[];
  userStats: UserStats;
  isAutoCycle: boolean;
  onStatsClick: () => void;
}

const DashboardHero: React.FC<DashboardHeroProps> = ({
  subjects,
  userStats,
  isAutoCycle,
  onStatsClick
}) => {
  // Calculate total stats for the chart
  const totalMinutes = subjects.reduce((acc, s) => acc + s.studiedMinutes, 0);
  const totalGoal = subjects.reduce((acc, s) => acc + s.totalMinutes, 0);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const totalTimeStr = `${h}h ${m}m`;
  const percentage = totalGoal > 0 ? Math.round((totalMinutes / totalGoal) * 100) : 0;

  return (
    <section 
      onClick={onStatsClick}
      className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden cursor-pointer group transition-all hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/30"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        
        {/* Left: Chart */}
        <div className="flex-shrink-0 relative">
          <DonutChart 
            subjects={subjects} 
            totalTimeStr={totalTimeStr} 
            percentage={percentage} 
          />
          
          {/* Auto Cycle Badge (Desktop: Absolute near chart) */}
          {isAutoCycle && (
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-blue-500/20 flex items-center gap-1 animate-in slide-in-from-bottom-2 fade-in duration-500">
              <span className="material-icons-round text-xs animate-spin-slow">autorenew</span>
              Ciclo Auto
            </div>
          )}
        </div>

        {/* Right: Stats Grid */}
        <div className="flex-1 w-full grid grid-cols-2 gap-3 md:gap-4">
          
          {/* Stat 1: Level */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 border border-slate-100 dark:border-slate-700/50 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10 transition-colors">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-1">
              <span className="material-icons-round text-lg">military_tech</span>
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {userStats.level}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Nível
            </span>
          </div>

          {/* Stat 2: XP */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 border border-slate-100 dark:border-slate-700/50 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/10 transition-colors">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-1">
              <span className="material-icons-round text-lg">bolt</span>
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {userStats.xp}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              XP Total
            </span>
          </div>

          {/* Stat 3: Streak */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 border border-slate-100 dark:border-slate-700/50 group-hover:bg-rose-50/50 dark:group-hover:bg-rose-900/10 transition-colors">
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-1">
              <span className="material-icons-round text-lg">local_fire_department</span>
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {userStats.dailyStreak}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Dias Seguidos
            </span>
          </div>

          {/* Stat 4: Focus */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 border border-slate-100 dark:border-slate-700/50 group-hover:bg-emerald-50/50 dark:group-hover:bg-emerald-900/10 transition-colors">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-1">
              <span className="material-icons-round text-lg">self_improvement</span>
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {userStats.stamina ?? 100}%
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Energia
            </span>
          </div>

        </div>
      </div>
    </section>
  );
};

export default DashboardHero;
