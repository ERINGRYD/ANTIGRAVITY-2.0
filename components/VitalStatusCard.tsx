import React, { useMemo } from 'react';
import { UserStats, StudySession } from '../types';

interface VitalStatusCardProps {
  userStats: UserStats;
  studyHistory: StudySession[];
}

const VitalStatusCard: React.FC<VitalStatusCardProps> = ({ userStats, studyHistory }) => {
  // Calculate Accuracy from history
  const accuracy = useMemo(() => {
    if (studyHistory.length === 0) return 92; // Default/Mock from screenshot
    const sessionsWithQuestions = studyHistory.filter(s => s.questionsCompleted > 0);
    if (sessionsWithQuestions.length === 0) return 92;
    
    const totalAccuracy = sessionsWithQuestions.reduce((acc, s) => acc + s.accuracy, 0);
    return Math.round(totalAccuracy / sessionsWithQuestions.length);
  }, [studyHistory]);

  // Focus could be based on recent consistency or just mocked for now
  const focus = 65; // Mock from screenshot
  const confidence = 85; // Mock value for Confiança
  
  const hp = userStats?.hp ?? 1000;
  const stamina = userStats?.stamina ?? 100;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[32px] border-2 border-blue-500/30 p-6 shadow-sm flex flex-col gap-6">
      
      {/* Vida */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-500 font-black uppercase tracking-widest text-xs">
            <span className="material-symbols-outlined text-lg font-variation-fill">favorite</span>
            VIDA
          </div>
          <span className="text-red-500 font-black text-sm">
            {hp}<span className="opacity-60">/1000</span>
          </span>
        </div>
        <div className="h-4 bg-red-100 dark:bg-red-900/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-500 rounded-full transition-all duration-500"
            style={{ width: `${(hp / 1000) * 100}%` }}
          />
        </div>
      </div>

      {/* Energia */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-500 font-black uppercase tracking-widest text-xs">
            <span className="material-symbols-outlined text-lg font-variation-fill">bolt</span>
            ENERGIA
          </div>
          <span className="text-blue-500 font-black text-sm">
            {stamina}<span className="opacity-60">/100</span>
          </span>
        </div>
        <div className="h-4 bg-blue-100 dark:bg-blue-900/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${stamina}%` }}
          />
        </div>
      </div>

      {/* Foco */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-500 font-black uppercase tracking-widest text-xs">
            <span className="material-symbols-outlined text-lg">psychology</span>
            FOCO
          </div>
          <span className="text-indigo-500 font-black text-sm">
            {focus}%
          </span>
        </div>
        <div className="h-4 bg-indigo-100 dark:bg-indigo-900/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${focus}%` }}
          />
        </div>
      </div>

      {/* Confiança */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-500 font-black uppercase tracking-widest text-xs">
            <span className="material-symbols-outlined text-lg">verified</span>
            CONFIANÇA
          </div>
          <span className="text-amber-500 font-black text-sm">
            {confidence}%
          </span>
        </div>
        <div className="h-4 bg-amber-100 dark:bg-amber-900/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {/* Precisão */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-500 font-black uppercase tracking-widest text-xs">
            <span className="material-symbols-outlined text-lg">ads_click</span>
            PRECISÃO
          </div>
          <span className="text-emerald-500 font-black text-sm">
            {accuracy}%
          </span>
        </div>
        <div className="h-4 bg-emerald-100 dark:bg-emerald-900/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${accuracy}%` }}
          />
        </div>
      </div>

    </div>
  );
};

export default VitalStatusCard;
