import React, { useMemo } from 'react';
import { QuestionAttempt } from '../../types/stats.types';
import { 
  getPerformanceMetrics, 
  getConfidenceMatrix, 
  getMetricsBySubject, 
  getWeightedScoreEvolution,
  getErrorDistribution
} from '../../utils/cycleStats';
import { CheckCircle2, XCircle, Target, Activity } from 'lucide-react';

interface TabQuestoesProps {
  attempts: QuestionAttempt[];
}

export function TabQuestoes({ attempts }: TabQuestoesProps) {
  const metrics = useMemo(() => getPerformanceMetrics(attempts), [attempts]);
  const confidenceMatrix = useMemo(() => getConfidenceMatrix(attempts), [attempts]);
  const bySubject = useMemo(() => getMetricsBySubject(attempts), [attempts]);
  const evolution = useMemo(() => getWeightedScoreEvolution(attempts), [attempts]);
  const errors = useMemo(() => getErrorDistribution(attempts), [attempts]);

  return (
    <div className="space-y-6">
      {/* Scorecards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center text-slate-500 mb-2">
            <Target className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Acertos</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{metrics.correct}</div>
          <div className="text-xs text-slate-500 mt-1">de {metrics.total} questões</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center text-slate-500 mb-2">
            <XCircle className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Erros</span>
          </div>
          <div className="text-2xl font-bold text-rose-600">{metrics.wrong}</div>
          <div className="text-xs text-slate-500 mt-1">de {metrics.total} questões</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center text-slate-500 mb-2">
            <Activity className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Precisão</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">{metrics.accuracy.toFixed(1)}%</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center text-slate-500 mb-2">
            <Target className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Nota Ponderada</span>
          </div>
          <div className="text-2xl font-bold text-indigo-600">{metrics.weightedScore.toFixed(1)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolution Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Evolução da Nota</h3>
          <div className="h-64 flex items-end space-x-2">
            {evolution.map((day, i) => {
              const height = `${day.weightedScore}%`;
              return (
                <div key={i} className="flex-1 flex flex-col justify-end items-center group relative">
                  <div 
                    className="w-full bg-indigo-500 rounded-t-sm transition-all hover:bg-indigo-600"
                    style={{ height }}
                  />
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 transition-opacity">
                    {day.date}: {day.weightedScore.toFixed(1)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Confidence Matrix */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Matriz de Confiança</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-3 grid grid-cols-3 gap-4 mb-2">
              <div className="text-center text-xs font-medium text-slate-500">Certeza</div>
              <div className="text-center text-xs font-medium text-slate-500">Dúvida</div>
              <div className="text-center text-xs font-medium text-slate-500">Chute</div>
            </div>
            {/* Correct Row */}
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-center">
              <div className="text-lg font-bold text-emerald-700">{confidenceMatrix['correct-certain']?.percent.toFixed(1)}%</div>
              <div className="text-xs text-emerald-600">Acerto Consciente</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-center opacity-80">
              <div className="text-lg font-bold text-emerald-700">{confidenceMatrix['correct-doubtful']?.percent.toFixed(1)}%</div>
              <div className="text-xs text-emerald-600">Acerto Inseguro</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-center opacity-60">
              <div className="text-lg font-bold text-emerald-700">{confidenceMatrix['correct-guess']?.percent.toFixed(1)}%</div>
              <div className="text-xs text-emerald-600">Acerto Sorte</div>
            </div>
            {/* Wrong Row */}
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-center">
              <div className="text-lg font-bold text-rose-700">{confidenceMatrix['wrong-certain']?.percent.toFixed(1)}%</div>
              <div className="text-xs text-rose-600">Erro Crítico</div>
            </div>
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-center opacity-80">
              <div className="text-lg font-bold text-rose-700">{confidenceMatrix['wrong-doubtful']?.percent.toFixed(1)}%</div>
              <div className="text-xs text-rose-600">Erro Inseguro</div>
            </div>
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-center opacity-60">
              <div className="text-lg font-bold text-rose-700">{confidenceMatrix['wrong-guess']?.percent.toFixed(1)}%</div>
              <div className="text-xs text-rose-600">Erro Chute</div>
            </div>
          </div>
        </div>
      </div>

      {/* By Subject Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Desempenho por Disciplina</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 px-4 text-sm font-medium text-slate-500">Disciplina</th>
                <th className="py-3 px-4 text-sm font-medium text-slate-500">Questões</th>
                <th className="py-3 px-4 text-sm font-medium text-slate-500">Acertos</th>
                <th className="py-3 px-4 text-sm font-medium text-slate-500">Precisão</th>
                <th className="py-3 px-4 text-sm font-medium text-slate-500">Nota</th>
              </tr>
            </thead>
            <tbody>
              {bySubject.map(sub => (
                <tr key={sub.subjectId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.subjectColor }} />
                      <span className="text-sm font-medium text-slate-700">{sub.subjectName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">{sub.total}</td>
                  <td className="py-3 px-4 text-sm text-emerald-600 font-medium">{sub.correct}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{sub.accuracy.toFixed(1)}%</td>
                  <td className="py-3 px-4 text-sm text-indigo-600 font-bold">{sub.weightedScore.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
