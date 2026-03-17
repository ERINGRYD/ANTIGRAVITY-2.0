import React, { useMemo } from 'react';
import { BattleAttempt } from '../../types';
import {
  groupBySubject,
  calculateWeightedScore
} from '../../utils/statsCalculations';

interface StatsTimeTotalProps {
  attempts: BattleAttempt[];
}

const StatsTimeTotal: React.FC<StatsTimeTotalProps> = ({ attempts }) => {
  const timeBySubject = useMemo(() => {
    const grouped = groupBySubject(attempts);
    return Object.entries(grouped).map(([subjectId, subjectAttempts]) => {
      const first = subjectAttempts[0];
      const totalSeconds = subjectAttempts.reduce((acc, a) => acc + a.timeSpentSeconds, 0);
      const score = calculateWeightedScore(subjectAttempts);
      return {
        subjectId,
        subjectName: first.subjectName,
        subjectColor: first.subjectColor,
        totalSeconds,
        totalHours: totalSeconds / 3600,
        score
      };
    }).sort((a, b) => b.totalSeconds - a.totalSeconds);
  }, [attempts]);

  const maxSeconds = Math.max(...timeBySubject.map(s => s.totalSeconds), 1);

  // Consistency calendar
  const calendarData = useMemo(() => {
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

  // Calculate streak
  const streak = useMemo(() => {
    let currentStreak = 0;
    for (let i = 27; i >= 0; i--) {
      if (calendarData[i] > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
    return currentStreak;
  }, [calendarData]);

  return (
    <div className="space-y-8">
      {/* Time per subject */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Tempo por Matéria</h3>
        <div className="space-y-4">
          {timeBySubject.map(subject => {
            const h = Math.floor(subject.totalSeconds / 3600);
            const m = Math.floor((subject.totalSeconds % 3600) / 60);
            const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
            
            return (
              <div key={subject.subjectId} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{subject.subjectName}</span>
                  <span>{timeStr}</span>
                </div>
                <div className="flex h-4 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${(subject.totalSeconds / maxSeconds) * 100}%`, 
                      backgroundColor: subject.subjectColor 
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Efficiency scatter plot */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Eficiência (Tempo × Score)</h3>
        <div className="relative h-64 border-l-2 border-b-2 border-slate-200 dark:border-slate-700">
          {/* Quadrant lines */}
          <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-slate-200 dark:border-slate-700" />
          <div className="absolute top-0 left-1/2 h-full border-l border-dashed border-slate-200 dark:border-slate-700" />
          
          {/* Quadrant labels */}
          <span className="absolute top-2 right-2 text-[10px] font-bold text-slate-400 uppercase">Consolidado ✅</span>
          <span className="absolute top-2 left-2 text-[10px] font-bold text-slate-400 uppercase">Talento ⭐</span>
          <span className="absolute bottom-2 right-2 text-[10px] font-bold text-slate-400 uppercase">Ineficiente ⚠️</span>
          <span className="absolute bottom-2 left-2 text-[10px] font-bold text-slate-400 uppercase">Negligenciado 📚</span>
          
          {/* Data points */}
          {timeBySubject.map(subject => {
            const maxHours = Math.max(...timeBySubject.map(s => s.totalHours), 1);
            const x = (subject.totalHours / maxHours) * 100;
            const y = subject.score; // 0-100
            
            return (
              <div
                key={subject.subjectId}
                className="absolute w-4 h-4 rounded-full -ml-2 -mb-2 shadow-sm border-2 border-white dark:border-slate-800 transition-transform hover:scale-150 cursor-pointer"
                style={{
                  left: `${x}%`,
                  bottom: `${y}%`,
                  backgroundColor: subject.subjectColor
                }}
                title={`${subject.subjectName}: ${subject.totalHours.toFixed(1)}h, Score: ${subject.score}`}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500 font-medium">
          <span>Menos tempo</span>
          <span>Mais tempo</span>
        </div>
      </div>

      {/* Consistency calendar */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Consistência (Últimos 28 dias)</h3>
          <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-xs font-bold">
            <span>🔥</span> {streak} dias seguidos
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {/* Days of week header */}
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
            <div key={i} className="text-center text-[10px] font-bold text-slate-400">{day}</div>
          ))}
          
          {/* Calendar cells */}
          {calendarData.map((count, i) => (
            <div 
              key={i} 
              className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-bold transition-colors ${
                count === 0 ? 'bg-slate-100 dark:bg-slate-800 text-transparent' :
                count <= 10 ? 'bg-blue-200 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' :
                count <= 30 ? 'bg-blue-400 dark:bg-blue-700/60 text-white' :
                'bg-blue-600 dark:bg-blue-500 text-white'
              }`}
              title={`${count} questões`}
            >
              {count > 0 ? count : ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsTimeTotal;
