import React, { useMemo } from 'react';
import { BattleAttempt } from '../../types';
import {
  getErrorTypeDistribution,
  groupBySubject
} from '../../utils/statsCalculations';

interface StatsErrorsProps {
  attempts: BattleAttempt[];
}

const StatsErrors: React.FC<StatsErrorsProps> = ({ attempts }) => {
  const errors = attempts.filter(a => !a.isCorrect && a.errorType !== null);
  const distribution = getErrorTypeDistribution(attempts);

  const getRecommendation = (dist: { content: number, interpretation: number, distraction: number }): string => {
    const max = Math.max(dist.content, dist.interpretation, dist.distraction);
    if (dist.content === 0 && dist.interpretation === 0 && dist.distraction === 0) return 'Continue assim!';
    if (max === dist.content) return 'Revise a teoria antes de praticar';
    if (max === dist.interpretation) return 'Leia o enunciado duas vezes antes de responder';
    return 'Reduza o tempo de sessão — distração está alta';
  };

  const weaknessMap = useMemo(() => {
    const grouped = groupBySubject(errors);
    return Object.entries(grouped).map(([subjectId, subjectErrors]) => {
      const first = subjectErrors[0];
      const dist = getErrorTypeDistribution(subjectErrors);
      return {
        subjectId,
        subjectName: first.subjectName,
        subjectColor: first.subjectColor,
        distribution: dist,
        recommendation: getRecommendation(dist)
      };
    });
  }, [errors]);

  // Error evolution
  const errorEvolution = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const result = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);
      
      const dayErrors = errors.filter(a => {
        const attemptDate = new Date(a.attemptedAt);
        return attemptDate >= d && attemptDate < nextD;
      });
      
      const dayDist = getErrorTypeDistribution(dayErrors);
      
      result.push({
        date: days[d.getDay()],
        ...dayDist,
        total: dayErrors.length
      });
    }
    return result;
  }, [errors]);

  return (
    <div className="space-y-8">
      {/* Error distribution */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Distribuição de Erros</h3>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F1F5F9" strokeWidth="20" className="dark:stroke-slate-800" />
              
              {errors.length > 0 && (
                <>
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3B82F6" strokeWidth="20" strokeDasharray={`${(distribution.content / 100) * 251.2} 251.2`} strokeDashoffset="0" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#A855F7" strokeWidth="20" strokeDasharray={`${(distribution.interpretation / 100) * 251.2} 251.2`} strokeDashoffset={-((distribution.content / 100) * 251.2)} />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F97316" strokeWidth="20" strokeDasharray={`${(distribution.distraction / 100) * 251.2} 251.2`} strokeDashoffset={-(((distribution.content + distribution.interpretation) / 100) * 251.2)} />
                </>
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{errors.length}</span>
              <span className="text-[10px] font-bold text-slate-400">Erros</span>
            </div>
          </div>
          
          <div className="space-y-4 w-full md:w-auto">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                <div className="w-4 h-4 rounded-md bg-blue-500" /> Conteúdo
              </div>
              <span className="font-black text-blue-600 dark:text-blue-400">{distribution.content}%</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-6 -mt-3 mb-2">Falta de base teórica</p>
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                <div className="w-4 h-4 rounded-md bg-purple-500" /> Interpretação
              </div>
              <span className="font-black text-purple-600 dark:text-purple-400">{distribution.interpretation}%</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-6 -mt-3 mb-2">Não entendeu o enunciado</p>
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                <div className="w-4 h-4 rounded-md bg-orange-500" /> Distração
              </div>
              <span className="font-black text-orange-600 dark:text-orange-400">{distribution.distraction}%</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-6 -mt-3">Erro bobo em conteúdo dominado</p>
          </div>
        </div>
      </div>

      {/* Weakness map */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Mapa de Fraquezas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Matéria</th>
                <th className="p-4">Conteúdo</th>
                <th className="p-4">Interpretação</th>
                <th className="p-4">Distração</th>
                <th className="p-4">Recomendação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {weaknessMap.map(row => (
                <tr key={row.subjectId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-white border-l-4" style={{ borderLeftColor: row.subjectColor }}>
                    {row.subjectName}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${row.distribution.content}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{row.distribution.content}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${row.distribution.interpretation}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{row.distribution.interpretation}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500" style={{ width: `${row.distribution.distraction}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{row.distribution.distraction}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                    {row.recommendation}
                  </td>
                </tr>
              ))}
              {weaknessMap.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    Nenhum erro registrado no período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Error evolution */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Evolução de Erros</h3>
        
        <div className="h-48 flex items-end justify-between gap-2">
          {errorEvolution.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full relative h-full flex items-end justify-center">
                {day.total > 0 ? (
                  <>
                    <div 
                      className="absolute bottom-0 w-2 bg-blue-500 rounded-t-sm"
                      style={{ height: `${day.content}%` }}
                      title={`Conteúdo: ${Math.round(day.content)}%`}
                    />
                    <div 
                      className="absolute bottom-0 w-2 bg-purple-500 rounded-t-sm ml-4"
                      style={{ height: `${day.interpretation}%` }}
                      title={`Interpretação: ${Math.round(day.interpretation)}%`}
                    />
                    <div 
                      className="absolute bottom-0 w-2 bg-orange-500 rounded-t-sm ml-8"
                      style={{ height: `${day.distraction}%` }}
                      title={`Distração: ${Math.round(day.distraction)}%`}
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
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full" /> Conteúdo</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-purple-500 rounded-full" /> Interpretação</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-500 rounded-full" /> Distração</div>
        </div>
      </div>
    </div>
  );
};

export default StatsErrors;
