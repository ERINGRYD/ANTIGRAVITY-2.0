import React, { useState, useMemo } from 'react';
import { BattleAttempt, Room } from '../../types';
import {
  groupByTopic,
  calculateWeightedScore,
  getErrorTypeDistribution
} from '../../utils/statsCalculations';

interface StatsByTopicProps {
  attempts: BattleAttempt[];
  onStartBattle: (topicId: string) => void;
}

const StatsByTopic: React.FC<StatsByTopicProps> = ({ attempts, onStartBattle }) => {
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [roomFilter, setRoomFilter] = useState<Room | null>(null);
  const [sortOrder, setSortOrder] = useState<'worst' | 'most' | 'misconceptions' | 'recent'>('worst');

  const topics = useMemo(() => {
    let filtered = attempts;
    if (subjectFilter) {
      filtered = filtered.filter(a => a.subjectId === subjectFilter);
    }
    if (roomFilter) {
      // Note: Room is not in BattleAttempt, assuming it's added or we filter by something else.
      // For now, we'll just ignore room filter if it's not in the data.
    }

    const grouped = groupByTopic(filtered);
    
    return Object.entries(grouped).map(([topicId, topicAttempts]) => {
      const first = topicAttempts[0];
      const score = calculateWeightedScore(topicAttempts);
      const misconceptions = topicAttempts.filter(a => !a.isCorrect && a.confidence === 'certain').length;
      const misconceptionRate = Math.round((misconceptions / topicAttempts.length) * 100);
      const accuracy = Math.round((topicAttempts.filter(a => a.isCorrect).length / topicAttempts.length) * 100);
      const isBlindSpot = first.confidence === 'certain' && accuracy < 50;
      const recentDate = new Date(Math.max(...topicAttempts.map(a => new Date(a.attemptedAt).getTime())));
      
      return {
        topicId,
        topicName: first.topicName,
        subjectName: first.subjectName,
        subjectColor: first.subjectColor,
        score,
        attempts: topicAttempts.length,
        misconceptionRate,
        isBlindSpot,
        errorDistribution: getErrorTypeDistribution(topicAttempts),
        recentDate
      };
    }).sort((a, b) => {
      if (sortOrder === 'worst') return a.score - b.score;
      if (sortOrder === 'most') return b.attempts - a.attempts;
      if (sortOrder === 'misconceptions') return b.misconceptionRate - a.misconceptionRate;
      if (sortOrder === 'recent') return b.recentDate.getTime() - a.recentDate.getTime();
      return 0;
    });
  }, [attempts, subjectFilter, roomFilter, sortOrder]);

  const uniqueSubjects = useMemo(() => {
    const subjects = new Map<string, string>();
    attempts.forEach(a => subjects.set(a.subjectId, a.subjectName));
    return Array.from(subjects.entries());
  }, [attempts]);

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <select 
          value={subjectFilter || ''} 
          onChange={e => setSubjectFilter(e.target.value || null)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas as matérias</option>
          {uniqueSubjects.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>

        <select 
          value={roomFilter || ''} 
          onChange={e => setRoomFilter((e.target.value as Room) || null)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas as salas</option>
          <option value="reconhecimento">Reconhecimento</option>
          <option value="critica">Crítica</option>
          <option value="alerta">Alerta</option>
          <option value="vencidos">Vencidos</option>
        </select>

        <select 
          value={sortOrder} 
          onChange={e => setSortOrder(e.target.value as any)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto"
        >
          <option value="worst">Pior score</option>
          <option value="most">Mais tentativas</option>
          <option value="misconceptions">Mais misconceptions</option>
          <option value="recent">Recente</option>
        </select>
      </div>

      {/* Topic list */}
      <div className="space-y-3">
        {topics.map(topic => (
          <div 
            key={topic.topicId}
            className="bg-white dark:bg-slate-800 p-4 rounded-2xl border-l-4 border-y border-r border-slate-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md"
            style={{ borderLeftColor: topic.subjectColor }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-slate-900 dark:text-white">{topic.topicName}</h3>
                {topic.isBlindSpot && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    ⚠️ Ponto cego
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">{topic.subjectName}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">Score:</span>
                  <span className={`font-bold ${topic.score < 50 ? 'text-red-500' : topic.score < 80 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {topic.score}/100
                  </span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">Tentativas:</span>
                  <span className="font-bold">{topic.attempts}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">Misconceptions:</span>
                  <span className={`font-bold ${topic.misconceptionRate > 20 ? 'text-red-500' : ''}`}>
                    {topic.misconceptionRate}%
                  </span>
                </div>
              </div>

              {/* Error distribution mini bar */}
              <div className="flex h-1.5 w-full max-w-xs bg-slate-100 dark:bg-slate-700 rounded-full mt-3 overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: `${topic.errorDistribution.content}%` }} title={`Conteúdo: ${topic.errorDistribution.content}%`} />
                <div className="bg-purple-500 h-full" style={{ width: `${topic.errorDistribution.interpretation}%` }} title={`Interpretação: ${topic.errorDistribution.interpretation}%`} />
                <div className="bg-amber-500 h-full" style={{ width: `${topic.errorDistribution.distraction}%` }} title={`Distração: ${topic.errorDistribution.distraction}%`} />
              </div>
            </div>

            <button
              onClick={() => onStartBattle(topic.topicId)}
              className="w-full sm:w-auto px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Iniciar Batalha <span className="material-icons-round text-[18px]">arrow_forward</span>
            </button>
          </div>
        ))}

        {topics.length === 0 && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            Nenhum tema encontrado com os filtros atuais.
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsByTopic;
