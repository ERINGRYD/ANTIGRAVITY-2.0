import React, { useMemo, useState } from 'react';
import { BattleAttempt } from '../../types';
import {
  groupBySubject,
  calculateWeightedScore,
  calculateAccuracy,
  calculateLuckIndex,
  calculateEfficiency,
  getErrorTypeDistribution
} from '../../utils/statsCalculations';

interface StatsBySubjectProps {
  attempts: BattleAttempt[];
}

const StatsBySubject: React.FC<StatsBySubjectProps> = ({ attempts }) => {
  const [sortField, setSortField] = useState<'weightedScore' | 'accuracy' | 'luckIndex' | 'totalQuestions' | 'totalMinutes' | 'efficiency'>('weightedScore');
  const [sortAsc, setSortAsc] = useState(true);

  const subjectRows = useMemo(() => {
    const grouped = groupBySubject(attempts);
    return Object.entries(grouped).map(([subjectId, subjectAttempts]) => {
      const first = subjectAttempts[0];
      const totalMinutes = subjectAttempts.reduce((acc, a) => acc + a.timeSpentSeconds, 0) / 60;
      
      return {
        subjectId,
        subjectName: first.subjectName,
        subjectColor: first.subjectColor,
        weightedScore: calculateWeightedScore(subjectAttempts),
        accuracy: calculateAccuracy(subjectAttempts),
        luckIndex: calculateLuckIndex(subjectAttempts),
        totalQuestions: subjectAttempts.length,
        totalMinutes: Math.round(totalMinutes),
        efficiency: calculateEfficiency(subjectAttempts),
        errorDistribution: getErrorTypeDistribution(subjectAttempts)
      };
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
  }, [attempts, sortField, sortAsc]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-8">
      {/* Sortable table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => handleSort('weightedScore')}>Matéria</th>
                <th className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => handleSort('weightedScore')}>Score Pond.</th>
                <th className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => handleSort('accuracy')}>Acurácia</th>
                <th className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => handleSort('luckIndex')}>Δ Sorte</th>
                <th className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => handleSort('totalQuestions')}>Questões</th>
                <th className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => handleSort('totalMinutes')}>Tempo</th>
                <th className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => handleSort('efficiency')}>Eficiência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {subjectRows.map(row => (
                <tr key={row.subjectId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                  <td className="p-4 border-l-4" style={{ borderLeftColor: row.subjectColor }}>
                    <div className="font-bold text-slate-900 dark:text-white">{row.subjectName}</div>
                    <div className="flex h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: `${row.errorDistribution.content}%` }} title={`Conteúdo: ${row.errorDistribution.content}%`} />
                      <div className="bg-purple-500 h-full" style={{ width: `${row.errorDistribution.interpretation}%` }} title={`Interpretação: ${row.errorDistribution.interpretation}%`} />
                      <div className="bg-amber-500 h-full" style={{ width: `${row.errorDistribution.distraction}%` }} title={`Distração: ${row.errorDistribution.distraction}%`} />
                    </div>
                  </td>
                  <td className="p-4 font-black">{row.weightedScore}/100</td>
                  <td className="p-4 font-medium">{row.accuracy}%</td>
                  <td className={`p-4 font-bold ${row.luckIndex > 0 ? 'text-emerald-500' : row.luckIndex < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                    {row.luckIndex > 0 ? '+' : ''}{row.luckIndex}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{row.totalQuestions}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{row.totalMinutes}m</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{row.efficiency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quadrant chart (Tempo × Score) */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Matriz Tempo × Score</h3>
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
          {subjectRows.map(row => {
            const maxTime = Math.max(...subjectRows.map(r => r.totalMinutes), 1);
            const x = (row.totalMinutes / maxTime) * 100;
            const y = row.weightedScore; // 0-100
            
            return (
              <div
                key={row.subjectId}
                className="absolute w-4 h-4 rounded-full -ml-2 -mb-2 shadow-sm border-2 border-white dark:border-slate-800 transition-transform hover:scale-150 cursor-pointer"
                style={{
                  left: `${x}%`,
                  bottom: `${y}%`,
                  backgroundColor: row.subjectColor
                }}
                title={`${row.subjectName}: ${row.totalMinutes}m, Score: ${row.weightedScore}`}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500 font-medium">
          <span>Menos tempo</span>
          <span>Mais tempo</span>
        </div>
      </div>
    </div>
  );
};

export default StatsBySubject;
