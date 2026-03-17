import React, { useMemo } from 'react';
import { BattleAttempt } from '../../types';
import {
  calculateWeightedScore,
  calculateAccuracy,
  getWeeklyEvolution,
  groupByDayOfWeek
} from '../../utils/statsCalculations';

interface StatsGeralProps {
  attempts: BattleAttempt[];
}

const StatsGeral: React.FC<StatsGeralProps> = ({ attempts }) => {
  const totalQuestions = attempts.length;
  const correctAnswers = attempts.filter(a => a.isCorrect).length;
  const accuracy = calculateAccuracy(attempts);
  const weightedScore = calculateWeightedScore(attempts);
  const totalXP = attempts.reduce((acc, a) => acc + a.xpEarned, 0);

  const weeklyEvolution = useMemo(() => getWeeklyEvolution(attempts), [attempts]);

  // Room distribution
  const rooms = {
    reconhecimento: attempts.filter(a => a.room === 'reconhecimento').length,
    critica: attempts.filter(a => a.room === 'critica').length,
    alerta: attempts.filter(a => a.room === 'alerta').length,
    vencidos: attempts.filter(a => a.room === 'vencidos').length
  };

  // Activity heatmap
  const heatmapData = useMemo(() => {
    const data = Array(28).fill(0);
    const now = new Date();
    attempts.forEach(a => {
      const d = new Date(a.attemptedAt);
      const diffTime = Math.abs(now.getTime() - d.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 28) {
        data[27 - diffDays]++;
      }
    });
    return data;
  }, [attempts]);

  return (
    <div className="space-y-8">
      {/* Scorecard row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Total Questões</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{totalQuestions}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Acertos</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{correctAnswers} <span className="text-sm text-slate-400">({accuracy}%)</span></p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Score Ponderado</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{weightedScore}/100</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">XP Total</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{totalXP} XP</p>
        </div>
      </div>

      {/* Weekly evolution chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Evolução Semanal</h3>
        <div className="h-48 flex items-end justify-between gap-2">
          {weeklyEvolution.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full relative h-full flex items-end justify-center">
                {day.total > 0 ? (
                  <>
                    <div 
                      className="absolute bottom-0 w-2 bg-slate-200 dark:bg-slate-700 rounded-t-sm"
                      style={{ height: `${day.accuracy}%` }}
                    />
                    <div 
                      className="absolute bottom-0 w-2 bg-blue-500 rounded-t-sm"
                      style={{ height: `${day.weightedScore}%` }}
                    />
                  </>
                ) : (
                  <div className="w-2 h-2 bg-slate-100 dark:bg-slate-800 rounded-full" />
                )}
              </div>
              <span className="text-[10px] font-bold text-slate-400">{day.date}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full" /> Score Ponderado</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full" /> Acurácia</div>
        </div>
      </div>

      {/* Room distribution donut */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Distribuição por Sala</h3>
        <div className="flex items-center justify-center gap-8">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F1F5F9" strokeWidth="20" className="dark:stroke-slate-800" />
              {/* Simple representation - in a real app, calculate stroke-dasharray based on percentages */}
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#94A3B8" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="0" />
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#EF4444" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="62.8" />
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F59E0B" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="125.6" />
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#22C55E" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="188.4" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-slate-900 dark:text-white">{totalQuestions}</span>
              <span className="text-[10px] font-bold text-slate-400">Tópicos</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <div className="w-3 h-3 rounded-full bg-slate-400" /> Reconhecimento ({rooms.reconhecimento})
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <div className="w-3 h-3 rounded-full bg-red-500" /> Crítica ({rooms.critica})
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <div className="w-3 h-3 rounded-full bg-amber-500" /> Alerta ({rooms.alerta})
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <div className="w-3 h-3 rounded-full bg-green-500" /> Vencidos ({rooms.vencidos})
            </div>
          </div>
        </div>
      </div>

      {/* Activity heatmap */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Consistência de estudos — últimos 28 dias</h3>
        <div className="grid grid-cols-7 gap-1 mt-4">
          {heatmapData.map((count, i) => (
            <div 
              key={i} 
              className={`aspect-square rounded-sm ${
                count === 0 ? 'bg-slate-100 dark:bg-slate-800' :
                count < 5 ? 'bg-blue-200 dark:bg-blue-900/40' :
                count < 15 ? 'bg-blue-400 dark:bg-blue-700/60' :
                'bg-blue-600 dark:bg-blue-500'
              }`}
              title={`${count} questões`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsGeral;
