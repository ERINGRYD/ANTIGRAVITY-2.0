import React, { useState, useMemo } from 'react';
import { BattleAttempt, StatsFilters } from '../../types';
import {
  filterAttempts,
  calculateMetacognitionIndex,
  findBiggestBlindSpot,
  calculateIdealBattleDuration,
  findPeakHour
} from '../../utils/statsCalculations';
import InsightCard from './InsightCard';
import StatsGeral from './StatsGeral';
import StatsBySubject from './StatsBySubject';
import StatsByTopic from './StatsByTopic';
import StatsConfidence from './StatsConfidence';
import StatsErrors from './StatsErrors';
import StatsTimeTotal from './StatsTimeTotal';
import StatsTimePerQuestion from './StatsTimePerQuestion';

interface StatsPageProps {
  attempts: BattleAttempt[];
  onStartBattle: (topicId: string) => void;
  onExport: () => void;
  onBack: () => void;
}

const TABS = [
  'Geral',
  'Matérias',
  'Temas',
  'Confiança',
  'Erros',
  'Tempo Total',
  'Tempo/Questão'
];

const StatsPage: React.FC<StatsPageProps> = ({ attempts, onStartBattle, onExport, onBack }) => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [filters, setFilters] = useState<StatsFilters>({ period: '7d', subjectId: null });

  const filteredAttempts = useMemo(() => filterAttempts(attempts, filters), [attempts, filters]);

  // Calculate insights
  const metacognitionIndex = calculateMetacognitionIndex(filteredAttempts);
  const blindSpot = findBiggestBlindSpot(filteredAttempts);
  const idealDuration = calculateIdealBattleDuration(filteredAttempts);
  const peakHour = findPeakHour(filteredAttempts);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Estatísticas</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onExport}
            className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
          >
            Exportar <span className="material-icons-round text-[16px]">download</span>
          </button>
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {(['7d', '30d', '90d', 'all'] as const).map(period => (
              <button
                key={period}
                onClick={() => setFilters(prev => ({ ...prev, period }))}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  filters.period === period 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {period === '7d' ? '7 dias' : period === '30d' ? '30 dias' : period === '90d' ? '90 dias' : 'Tudo'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* INSIGHTS */}
        <div className="px-4 py-6">
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x">
            <InsightCard
              icon="🧠"
              label="Índice de Metacognição"
              value={`${metacognitionIndex}/100`}
              description={
                metacognitionIndex >= 80 ? "Você sabe o que sabe — excelente calibração" :
                metacognitionIndex >= 60 ? "Calibração boa — continue ajustando" :
                metacognitionIndex >= 40 ? "Calibração moderada — confie mais no que domina" :
                "Calibração baixa — revise sua autoavaliação"
              }
              severity={
                metacognitionIndex >= 80 ? 'success' :
                metacognitionIndex >= 60 ? 'info' :
                metacognitionIndex >= 40 ? 'warning' : 'danger'
              }
            />
            
            <InsightCard
              icon="⚠️"
              label="Maior Ponto Cego"
              value={blindSpot ? blindSpot.topicName : "Nenhum ponto cego"}
              description={blindSpot ? `${blindSpot.subjectName} · ${blindSpot.rate}% certeza incorreta` : "Continue assim!"}
              severity={blindSpot ? (blindSpot.rate > 30 ? 'danger' : 'warning') : 'success'}
              ctaLabel={blindSpot ? "Revisar agora" : undefined}
              onCta={blindSpot ? () => onStartBattle(blindSpot.topicName) : undefined}
            />

            <InsightCard
              icon="⏱️"
              label="Batalha Ideal"
              value={idealDuration ? `${idealDuration} minutos` : "Dados insuficientes"}
              description={idealDuration ? "Performance cai após este ponto por distração" : "Continue batalhas para calcular"}
              severity="info"
            />

            <InsightCard
              icon="🎯"
              label="Horário de Pico"
              value={peakHour ? `${peakHour.hour}h - ${peakHour.hour + 2}h` : "Dados insuficientes"}
              description={peakHour ? `${peakHour.distractionRate}% menos erros de distração neste período` : "Responda mais questões para calcular"}
              severity={peakHour ? 'success' : 'info'}
            />
          </div>
        </div>

        {/* TABS */}
        <div className="px-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex gap-6 overflow-x-auto no-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab 
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="p-4 pb-24">
          {filteredAttempts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-6xl mb-4">📊</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Nenhuma batalha nos últimos {filters.period === '7d' ? '7 dias' : filters.period === '30d' ? '30 dias' : filters.period === '90d' ? '90 dias' : 'tempos'}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Resolva questões para ver suas estatísticas</p>
              <button 
                onClick={onBack}
                className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors"
              >
                Ir para Campo de Batalha →
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'Geral' && <StatsGeral attempts={filteredAttempts} />}
              {activeTab === 'Matérias' && <StatsBySubject attempts={filteredAttempts} />}
              {activeTab === 'Temas' && <StatsByTopic attempts={filteredAttempts} onStartBattle={onStartBattle} />}
              {activeTab === 'Confiança' && <StatsConfidence attempts={filteredAttempts} />}
              {activeTab === 'Erros' && <StatsErrors attempts={filteredAttempts} />}
              {activeTab === 'Tempo Total' && <StatsTimeTotal attempts={filteredAttempts} />}
              {activeTab === 'Tempo/Questão' && <StatsTimePerQuestion attempts={filteredAttempts} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
