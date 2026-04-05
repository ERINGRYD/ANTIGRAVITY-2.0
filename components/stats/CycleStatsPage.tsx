import React, { useState, useMemo } from 'react';
import { StatsFilters, StudySession, QuestionAttempt } from '../../types/stats.types';
import { FilterBar } from './FilterBar';
import { TabCiclo } from './TabCiclo';
import { TabQuestoes } from './TabQuestoes';
import { TabSimulados } from './TabSimulados';
import { TabIntegrado } from './TabIntegrado';
import { BarChart2, CheckCircle2, Target, Activity } from 'lucide-react';

interface CycleStatsPageProps {
  sessions: StudySession[];
  attempts: QuestionAttempt[];
  subjects: Array<{ id: string; name: string }>;
  themes: Array<{ id: string; name: string; subjectId: string }>;
}

export function CycleStatsPage({ sessions, attempts, subjects, themes }: CycleStatsPageProps) {
  const [activeTab, setActiveTab] = useState<'ciclo' | 'questoes' | 'simulados' | 'integrado'>('ciclo');
  const [filters, setFilters] = useState<StatsFilters>({
    period: '7d',
    subjectId: null,
    themeId: null,
    confidence: null,
    sessionType: null,
  });

  // Filter logic
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      // Period filter
      const sessionDate = new Date(s.startedAt).getTime();
      const now = new Date().getTime();
      const daysDiff = (now - sessionDate) / (1000 * 3600 * 24);
      
      if (filters.period === '7d' && daysDiff > 7) return false;
      if (filters.period === '30d' && daysDiff > 30) return false;
      if (filters.period === '90d' && daysDiff > 90) return false;
      // custom period logic could go here

      if (filters.subjectId && s.subjectId !== filters.subjectId) return false;
      if (filters.themeId && s.themeId !== filters.themeId) return false;
      if (filters.sessionType && s.sessionType !== filters.sessionType) return false;

      return true;
    });
  }, [sessions, filters]);

  const filteredAttempts = useMemo(() => {
    return attempts.filter(a => {
      // Period filter
      const attemptDate = new Date(a.attemptedAt).getTime();
      const now = new Date().getTime();
      const daysDiff = (now - attemptDate) / (1000 * 3600 * 24);
      
      if (filters.period === '7d' && daysDiff > 7) return false;
      if (filters.period === '30d' && daysDiff > 30) return false;
      if (filters.period === '90d' && daysDiff > 90) return false;

      if (filters.subjectId && a.subjectId !== filters.subjectId) return false;
      if (filters.themeId && a.topicId !== filters.themeId) return false;
      if (filters.confidence && a.confidence !== filters.confidence) return false;
      if (filters.sessionType && a.sessionType !== filters.sessionType) return false;

      return true;
    });
  }, [attempts, filters]);

  // Heatmap data (always 28 days, ignoring period filter but respecting others)
  const heatmapSessions = useMemo(() => {
    return sessions.filter(s => {
      const sessionDate = new Date(s.startedAt).getTime();
      const now = new Date().getTime();
      const daysDiff = (now - sessionDate) / (1000 * 3600 * 24);
      
      if (daysDiff > 28) return false;
      if (filters.subjectId && s.subjectId !== filters.subjectId) return false;
      if (filters.themeId && s.themeId !== filters.themeId) return false;
      if (filters.sessionType && s.sessionType !== filters.sessionType) return false;

      return true;
    });
  }, [sessions, filters.subjectId, filters.themeId, filters.sessionType]);

  const tabs = [
    { id: 'ciclo', label: 'Ciclo', icon: BarChart2, count: filteredSessions.length },
    { id: 'questoes', label: 'Questões', icon: CheckCircle2, count: filteredAttempts.filter(a => a.sessionType === 'study').length },
    { id: 'simulados', label: 'Simulados', icon: Target, count: filteredAttempts.filter(a => a.sessionType === 'simulation').length },
    { id: 'integrado', label: 'Integrado', icon: Activity, count: null },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-slate-800">Estatísticas</h1>
        <p className="text-sm text-slate-500 mt-1">Acompanhe seu desempenho e evolução</p>
      </div>

      <FilterBar 
        filters={filters} 
        onFilterChange={setFilters} 
        subjects={subjects} 
        themes={themes} 
      />

      <div className="px-6 py-4">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl mb-6 overflow-x-auto hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}`} />
              {tab.label}
              {tab.count !== null && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pb-20">
          {activeTab === 'ciclo' && (
            <TabCiclo sessions={filteredSessions} heatmapSessions={heatmapSessions} />
          )}
          {activeTab === 'questoes' && (
            <TabQuestoes attempts={filteredAttempts.filter(a => a.sessionType === 'study')} />
          )}
          {activeTab === 'simulados' && (
            <TabSimulados attempts={filteredAttempts.filter(a => a.sessionType === 'simulation')} />
          )}
          {activeTab === 'integrado' && (
            <TabIntegrado sessions={filteredSessions} attempts={filteredAttempts} />
          )}
        </div>
      </div>
    </div>
  );
}
