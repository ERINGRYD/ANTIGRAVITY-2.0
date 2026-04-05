import React, { useMemo } from 'react';
import { StudySession, QuestionAttempt } from '../../types/stats.types';
import { 
  getOptimalSessionDuration, 
  getStudyTimeVsScore, 
  getConfidenceVsStudyTime, 
  getStudyROI 
} from '../../utils/cycleStats';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TabIntegradoProps {
  sessions: StudySession[];
  attempts: QuestionAttempt[];
}

export function TabIntegrado({ sessions, attempts }: TabIntegradoProps) {
  const optimalDuration = useMemo(() => getOptimalSessionDuration(sessions, attempts), [sessions, attempts]);
  const timeVsScore = useMemo(() => getStudyTimeVsScore(sessions, attempts), [sessions, attempts]);
  const confidenceVsTime = useMemo(() => getConfidenceVsStudyTime(sessions, attempts), [sessions, attempts]);
  const roi = useMemo(() => getStudyROI(sessions, attempts), [sessions, attempts]);

  // Check if we have enough data to show meaningful correlations
  const hasEnoughData = sessions.length >= 5 && attempts.length >= 20;

  if (!hasEnoughData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
        <Activity className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-800">Dados insuficientes</h3>
        <p className="text-sm text-slate-500 text-center mt-2 max-w-md">
          Continue estudando e resolvendo questões. Precisamos de pelo menos 5 sessões e 20 questões resolvidas para gerar correlações significativas.
        </p>
      </div>
    );
  }

  const renderTrendIcon = (trend: string) => {
    if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-rose-500" />;
    if (trend === 'stable') return <Minus className="w-4 h-4 text-slate-400" />;
    return <span className="text-xs text-slate-400">-</span>;
  };

  const renderROIBadge = (roiValue: string) => {
    if (roiValue === 'high') return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Alto</span>;
    if (roiValue === 'medium') return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Médio</span>;
    if (roiValue === 'low') return <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">Baixo</span>;
    return <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">-</span>;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Optimal Session Duration */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Duração Ideal da Sessão</h3>
          <p className="text-sm text-slate-500 mb-4">
            Relação entre o tempo de estudo e a nota nas questões resolvidas nas 24h seguintes.
          </p>
          <div className="space-y-4">
            {optimalDuration.map((bucket, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 font-medium">{bucket.durationBucket}</span>
                  <span className="text-slate-800 font-bold">{bucket.avgWeightedScore.toFixed(1)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full" 
                    style={{ width: `${bucket.avgWeightedScore}%` }} 
                  />
                </div>
                <div className="text-xs text-slate-400 mt-1 text-right">
                  {bucket.sessionCount} sessões, {bucket.attemptsCount} questões
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence vs Study Time */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Confiança vs Tempo de Estudo</h3>
          <p className="text-sm text-slate-500 mb-4">
            Como sua confiança nas respostas varia de acordo com o tempo total estudado no tema.
          </p>
          <div className="space-y-4">
            {confidenceVsTime.map((bucket, i) => (
              <div key={i} className="flex items-center">
                <div className="w-20 text-sm font-medium text-slate-600">{bucket.studyTimeBucket}</div>
                <div className="flex-1 flex h-4 rounded-full overflow-hidden bg-slate-100">
                  {bucket.attemptsCount > 0 ? (
                    <>
                      <div className="bg-emerald-500 h-full" style={{ width: `${bucket.certainPercent}%` }} title={`Certeza: ${bucket.certainPercent.toFixed(1)}%`} />
                      <div className="bg-amber-400 h-full" style={{ width: `${bucket.doubtfulPercent}%` }} title={`Dúvida: ${bucket.doubtfulPercent.toFixed(1)}%`} />
                      <div className="bg-rose-400 h-full" style={{ width: `${bucket.guessPercent}%` }} title={`Chute: ${bucket.guessPercent.toFixed(1)}%`} />
                    </>
                  ) : (
                    <div className="w-full h-full bg-slate-200" />
                  )}
                </div>
                <div className="w-16 text-right text-xs text-slate-400 ml-2">{bucket.attemptsCount} q.</div>
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-4 mt-4 text-xs text-slate-500">
            <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-1" /> Certeza</div>
            <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-amber-400 mr-1" /> Dúvida</div>
            <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-rose-400 mr-1" /> Chute</div>
          </div>
        </div>
      </div>

      {/* ROI Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Retorno sobre Investimento (ROI) por Tema</h3>
        <p className="text-sm text-slate-500 mb-4">
          Quais temas estão rendendo mais nota por hora de estudo.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 px-4 text-sm font-medium text-slate-500">Tema</th>
                <th className="py-3 px-4 text-sm font-medium text-slate-500">Tempo (h)</th>
                <th className="py-3 px-4 text-sm font-medium text-slate-500">Nota</th>
                <th className="py-3 px-4 text-sm font-medium text-slate-500">Tendência</th>
                <th className="py-3 px-4 text-sm font-medium text-slate-500">ROI</th>
              </tr>
            </thead>
            <tbody>
              {roi.map(item => {
                const trendItem = timeVsScore.find(t => t.themeId === item.themeId);
                return (
                  <tr key={item.themeId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-800">{item.themeName}</span>
                        <div className="flex items-center mt-1">
                          <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: item.subjectColor }} />
                          <span className="text-xs text-slate-500">{item.subjectName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">{item.studyHours.toFixed(1)}h</td>
                    <td className="py-3 px-4 text-sm font-bold text-indigo-600">
                      {trendItem ? trendItem.weightedScore.toFixed(1) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {renderTrendIcon(trendItem ? trendItem.trend : 'insufficient')}
                    </td>
                    <td className="py-3 px-4">
                      {renderROIBadge(item.roi)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
