import React, { useMemo } from 'react';
import { BattleAttempt } from '../../types';
import {
  getConfidenceDistribution,
  calculateMetacognitionIndex,
  groupBySubject
} from '../../utils/statsCalculations';

interface StatsConfidenceProps {
  attempts: BattleAttempt[];
}

const StatsConfidence: React.FC<StatsConfidenceProps> = ({ attempts }) => {
  const total = attempts.length;
  
  const matrix = useMemo(() => {
    const data = {
      certain: { correct: 0, wrong: 0 },
      doubtful: { correct: 0, wrong: 0 },
      guess: { correct: 0, wrong: 0 }
    };
    
    attempts.forEach(a => {
      if (a.isCorrect) {
        data[a.confidence].correct++;
      } else {
        data[a.confidence].wrong++;
      }
    });
    
    return data;
  }, [attempts]);

  const metacognitionIndex = calculateMetacognitionIndex(attempts);
  
  const correctGuessRate = total > 0 ? (matrix.guess.correct / total) * 100 : 0;
  const wrongCertainRate = total > 0 ? (matrix.certain.wrong / total) * 100 : 0;

  // Calibration evolution
  const calibrationData = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const result = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);
      
      const dayAttempts = attempts.filter(a => {
        const attemptDate = new Date(a.attemptedAt);
        return attemptDate >= d && attemptDate < nextD;
      });
      
      const dayTotal = dayAttempts.length;
      const certainRate = dayTotal > 0 ? (dayAttempts.filter(a => a.confidence === 'certain').length / dayTotal) * 100 : 0;
      const correctRate = dayTotal > 0 ? (dayAttempts.filter(a => a.isCorrect).length / dayTotal) * 100 : 0;
      
      result.push({
        date: days[d.getDay()],
        certainRate,
        correctRate,
        total: dayTotal
      });
    }
    return result;
  }, [attempts]);

  // Confidence by subject
  const subjectConfidence = useMemo(() => {
    const grouped = groupBySubject(attempts);
    return Object.entries(grouped).map(([subjectId, subjectAttempts]) => {
      const first = subjectAttempts[0];
      return {
        subjectId,
        subjectName: first.subjectName,
        subjectColor: first.subjectColor,
        distribution: getConfidenceDistribution(subjectAttempts)
      };
    });
  }, [attempts]);

  return (
    <div className="space-y-8">
      {/* Pattern alerts */}
      <div className="space-y-3">
        {correctGuessRate > 20 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">🎲</span>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
              Você acerta muito por chute — <span className="font-bold">{Math.round(correctGuessRate)}%</span> das respostas.
            </p>
          </div>
        )}
        {wrongCertainRate > 15 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-sm font-medium text-red-800 dark:text-red-400">
              Alto índice de excesso de confiança — <span className="font-bold">{Math.round(wrongCertainRate)}%</span> de certeza incorreta.
            </p>
          </div>
        )}
        {metacognitionIndex >= 75 && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400">
              Excelente calibração — você sabe bem o que domina.
            </p>
          </div>
        )}
      </div>

      {/* Confidence matrix */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-x-auto">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Matriz de Confiança</h3>
        <table className="w-full text-center border-collapse min-w-[400px]">
          <thead>
            <tr>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700"></th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 text-sm font-bold text-emerald-600 dark:text-emerald-400">ACERTO</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 text-sm font-bold text-red-600 dark:text-red-400">ERRO</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-4 border-b border-slate-100 dark:border-slate-700/50 text-sm font-bold text-slate-700 dark:text-slate-300">CERTEZA</td>
              <td className="p-4 border-b border-slate-100 dark:border-slate-700/50 bg-emerald-50 dark:bg-emerald-900/10">
                <div className="flex flex-col items-center">
                  <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">✅ {matrix.certain.correct}</span>
                  <span className="text-xs font-medium text-emerald-600/70 dark:text-emerald-400/70">({total > 0 ? Math.round((matrix.certain.correct / total) * 100) : 0}%)</span>
                </div>
              </td>
              <td className={`p-4 border-b border-slate-100 dark:border-slate-700/50 ${wrongCertainRate > 15 ? 'bg-red-100 dark:bg-red-900/30' : ''}`}>
                <div className="flex flex-col items-center">
                  <span className={`text-lg font-black ${wrongCertainRate > 15 ? 'text-red-700 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>❌ {matrix.certain.wrong}</span>
                  <span className={`text-xs font-medium ${wrongCertainRate > 15 ? 'text-red-600/70 dark:text-red-400/70' : 'text-slate-500'}`}>({total > 0 ? Math.round((matrix.certain.wrong / total) * 100) : 0}%)</span>
                </div>
              </td>
            </tr>
            <tr>
              <td className="p-4 border-b border-slate-100 dark:border-slate-700/50 text-sm font-bold text-slate-700 dark:text-slate-300">DÚVIDA</td>
              <td className="p-4 border-b border-slate-100 dark:border-slate-700/50">
                <div className="flex flex-col items-center">
                  <span className="text-lg font-black text-slate-700 dark:text-slate-300">✅ {matrix.doubtful.correct}</span>
                  <span className="text-xs font-medium text-slate-500">({total > 0 ? Math.round((matrix.doubtful.correct / total) * 100) : 0}%)</span>
                </div>
              </td>
              <td className="p-4 border-b border-slate-100 dark:border-slate-700/50">
                <div className="flex flex-col items-center">
                  <span className="text-lg font-black text-slate-700 dark:text-slate-300">❌ {matrix.doubtful.wrong}</span>
                  <span className="text-xs font-medium text-slate-500">({total > 0 ? Math.round((matrix.doubtful.wrong / total) * 100) : 0}%)</span>
                </div>
              </td>
            </tr>
            <tr>
              <td className="p-4 text-sm font-bold text-slate-700 dark:text-slate-300">CHUTE</td>
              <td className={`p-4 ${correctGuessRate > 20 ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}>
                <div className="flex flex-col items-center">
                  <span className={`text-lg font-black ${correctGuessRate > 20 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>✅ {matrix.guess.correct}</span>
                  <span className={`text-xs font-medium ${correctGuessRate > 20 ? 'text-amber-600/70 dark:text-amber-400/70' : 'text-slate-500'}`}>({total > 0 ? Math.round((matrix.guess.correct / total) * 100) : 0}%)</span>
                </div>
              </td>
              <td className="p-4">
                <div className="flex flex-col items-center">
                  <span className="text-lg font-black text-slate-700 dark:text-slate-300">❌ {matrix.guess.wrong}</span>
                  <span className="text-xs font-medium text-slate-500">({total > 0 ? Math.round((matrix.guess.wrong / total) * 100) : 0}%)</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Calibration evolution */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Evolução da Calibração</h3>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-6">Quanto mais próximas as linhas, melhor.</p>
        
        <div className="h-48 flex items-end justify-between gap-2">
          {calibrationData.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full relative h-full flex items-end justify-center">
                {day.total > 0 ? (
                  <>
                    <div 
                      className="absolute bottom-0 w-2 bg-emerald-500 rounded-t-sm"
                      style={{ height: `${day.correctRate}%` }}
                      title={`Acertos: ${Math.round(day.correctRate)}%`}
                    />
                    <div 
                      className="absolute bottom-0 w-2 bg-blue-500 rounded-t-sm ml-4"
                      style={{ height: `${day.certainRate}%` }}
                      title={`Certeza: ${Math.round(day.certainRate)}%`}
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
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded-full" /> % Acertos</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full" /> % Certeza</div>
        </div>
      </div>

      {/* Confidence by subject */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Confiança por Matéria</h3>
        <div className="space-y-4">
          {subjectConfidence.map(subject => (
            <div key={subject.subjectId} className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>{subject.subjectName}</span>
              </div>
              <div className="flex h-4 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full flex items-center justify-center text-[8px] font-bold text-white" 
                  style={{ width: `${subject.distribution.certain}%`, backgroundColor: subject.subjectColor }}
                  title={`Certeza: ${subject.distribution.certain}%`}
                >
                  {subject.distribution.certain > 10 ? `${subject.distribution.certain}%` : ''}
                </div>
                <div 
                  className="h-full flex items-center justify-center text-[8px] font-bold text-white/80" 
                  style={{ width: `${subject.distribution.doubtful}%`, backgroundColor: `${subject.subjectColor}80` }}
                  title={`Dúvida: ${subject.distribution.doubtful}%`}
                >
                  {subject.distribution.doubtful > 10 ? `${subject.distribution.doubtful}%` : ''}
                </div>
                <div 
                  className="h-full flex items-center justify-center text-[8px] font-bold text-white/50" 
                  style={{ width: `${subject.distribution.guess}%`, backgroundColor: `${subject.subjectColor}40` }}
                  title={`Chute: ${subject.distribution.guess}%`}
                >
                  {subject.distribution.guess > 10 ? `${subject.distribution.guess}%` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-6 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-800 dark:bg-slate-200 rounded-sm" /> Certeza</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-400 dark:bg-slate-500 rounded-sm" /> Dúvida</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded-sm" /> Chute</div>
        </div>
      </div>
    </div>
  );
};

export default StatsConfidence;
