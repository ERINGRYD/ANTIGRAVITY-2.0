import React, { useMemo } from 'react';
import { BattleAttempt } from '../../types';
import {
  avgTimePerQuestion,
  groupBySubject,
  calculateFatigueCurve
} from '../../utils/statsCalculations';

interface StatsTimePerQuestionProps {
  attempts: BattleAttempt[];
}

const StatsTimePerQuestion: React.FC<StatsTimePerQuestionProps> = ({ attempts }) => {
  const overallAvg = avgTimePerQuestion(attempts);

  const timeBySubject = useMemo(() => {
    const grouped = groupBySubject(attempts);
    return Object.entries(grouped).map(([subjectId, subjectAttempts]) => {
      const first = subjectAttempts[0];
      return {
        subjectId,
        subjectName: first.subjectName,
        subjectColor: first.subjectColor,
        avgTime: avgTimePerQuestion(subjectAttempts)
      };
    }).sort((a, b) => b.avgTime - a.avgTime);
  }, [attempts]);

  const fastestSubject = timeBySubject.length > 0 ? timeBySubject[timeBySubject.length - 1] : null;
  const slowestSubject = timeBySubject.length > 0 ? timeBySubject[0] : null;

  const maxAvgTime = Math.max(...timeBySubject.map(s => s.avgTime), overallAvg, 1);

  // Fatigue curve
  const fatigueCurve = calculateFatigueCurve(attempts);

  // Time by confidence
  const timeByConfidence = useMemo(() => {
    const certain = attempts.filter(a => a.confidence === 'certain');
    const doubtful = attempts.filter(a => a.confidence === 'doubtful');
    const guess = attempts.filter(a => a.confidence === 'guess');
    
    return {
      certain: avgTimePerQuestion(certain),
      doubtful: avgTimePerQuestion(doubtful),
      guess: avgTimePerQuestion(guess)
    };
  }, [attempts]);

  return (
    <div className="space-y-8">
      {/* Average time metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Média Geral</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{overallAvg}s</p>
          <p className="text-xs font-medium text-slate-400 mt-1">por questão</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Mais Rápido</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{fastestSubject ? fastestSubject.avgTime : 0}s</p>
          <p className="text-xs font-medium text-slate-400 mt-1 truncate" title={fastestSubject ? fastestSubject.subjectName : ''}>{fastestSubject ? fastestSubject.subjectName : '-'}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Mais Lento</p>
          <p className="text-2xl font-black text-red-600 dark:text-red-400">{slowestSubject ? slowestSubject.avgTime : 0}s</p>
          <p className="text-xs font-medium text-slate-400 mt-1 truncate" title={slowestSubject ? slowestSubject.subjectName : ''}>{slowestSubject ? slowestSubject.subjectName : '-'}</p>
        </div>
      </div>

      {/* Time by subject (bar chart) */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Tempo Médio por Matéria</h3>
        <div className="space-y-4 relative">
          {/* Reference line */}
          <div 
            className="absolute top-0 bottom-0 border-l-2 border-dashed border-slate-300 dark:border-slate-600 z-10"
            style={{ left: `${(overallAvg / maxAvgTime) * 100}%` }}
          >
            <div className="absolute -top-4 -translate-x-1/2 bg-slate-100 dark:bg-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300 whitespace-nowrap">
              Média {overallAvg}s
            </div>
          </div>
          
          {timeBySubject.map(subject => (
            <div key={subject.subjectId} className="flex flex-col gap-1 relative z-0">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>{subject.subjectName}</span>
                <span>{subject.avgTime}s</span>
              </div>
              <div className="flex h-4 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${(subject.avgTime / maxAvgTime) * 100}%`, 
                    backgroundColor: subject.subjectColor 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fatigue curve */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Curva de Fadiga</h3>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-6">Compara o tempo das primeiras 5 questões com as últimas 5 por sessão.</p>
        
        {fatigueCurve ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Início da Sessão</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{fatigueCurve.firstQuestions}s</span>
              </div>
              
              <div className="flex-1 flex flex-col items-center px-4">
                <div className="w-full h-0.5 bg-slate-200 dark:bg-slate-700 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 px-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${fatigueCurve.dropPercent > 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                      {fatigueCurve.dropPercent > 0 ? '+' : ''}{fatigueCurve.dropPercent}% tempo
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Fim da Sessão</span>
                <span className={`text-2xl font-black ${fatigueCurve.dropPercent > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{fatigueCurve.lastQuestions}s</span>
              </div>
            </div>
            
            {fatigueCurve.dropPercent > 20 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-xl flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <p className="text-xs font-medium text-amber-800 dark:text-amber-400">
                  Sinal de fadiga detectado. Considere fazer pausas mais frequentes.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
            Dados insuficientes para calcular curva de fadiga. Complete mais sessões de batalha.
          </div>
        )}
      </div>

      {/* Time by confidence */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Tempo por Nível de Confiança</h3>
        <div className="flex items-end justify-around h-40 gap-4">
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full max-w-[60px] relative h-full flex items-end justify-center">
              <div 
                className="w-full bg-emerald-500 rounded-t-lg transition-all duration-500"
                style={{ height: `${(timeByConfidence.certain / Math.max(timeByConfidence.certain, timeByConfidence.doubtful, timeByConfidence.guess, 1)) * 100}%` }}
              />
            </div>
            <span className="text-lg font-black text-slate-900 dark:text-white">{timeByConfidence.certain}s</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Certeza</span>
          </div>
          
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full max-w-[60px] relative h-full flex items-end justify-center">
              <div 
                className="w-full bg-slate-400 dark:bg-slate-500 rounded-t-lg transition-all duration-500"
                style={{ height: `${(timeByConfidence.doubtful / Math.max(timeByConfidence.certain, timeByConfidence.doubtful, timeByConfidence.guess, 1)) * 100}%` }}
              />
            </div>
            <span className="text-lg font-black text-slate-900 dark:text-white">{timeByConfidence.doubtful}s</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dúvida</span>
          </div>
          
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full max-w-[60px] relative h-full flex items-end justify-center">
              <div 
                className="w-full bg-amber-500 rounded-t-lg transition-all duration-500"
                style={{ height: `${(timeByConfidence.guess / Math.max(timeByConfidence.certain, timeByConfidence.doubtful, timeByConfidence.guess, 1)) * 100}%` }}
              />
            </div>
            <span className="text-lg font-black text-slate-900 dark:text-white">{timeByConfidence.guess}s</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chute</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsTimePerQuestion;
