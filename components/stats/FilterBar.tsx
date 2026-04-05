import React from 'react';
import { StatsFilters } from '../../types/stats.types';
import { Filter, X, Calendar, BookOpen, Target, Activity } from 'lucide-react';

interface FilterBarProps {
  filters: StatsFilters;
  onFilterChange: (newFilters: StatsFilters) => void;
  subjects: Array<{ id: string; name: string }>;
  themes: Array<{ id: string; name: string; subjectId: string }>;
}

export function FilterBar({ filters, onFilterChange, subjects, themes }: FilterBarProps) {
  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, period: e.target.value as StatsFilters['period'] });
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subjectId = e.target.value === 'all' ? null : e.target.value;
    onFilterChange({ ...filters, subjectId, themeId: null }); // Reset theme when subject changes
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const themeId = e.target.value === 'all' ? null : e.target.value;
    onFilterChange({ ...filters, themeId });
  };

  const handleConfidenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const confidence = e.target.value === 'all' ? null : e.target.value as StatsFilters['confidence'];
    onFilterChange({ ...filters, confidence });
  };

  const handleSessionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sessionType = e.target.value === 'all' ? null : e.target.value as StatsFilters['sessionType'];
    onFilterChange({ ...filters, sessionType });
  };

  const clearFilters = () => {
    onFilterChange({
      period: '7d',
      subjectId: null,
      themeId: null,
      confidence: null,
      sessionType: null,
    });
  };

  const activeFilterCount = [
    filters.period !== '7d',
    filters.subjectId !== null,
    filters.themeId !== null,
    filters.confidence !== null,
    filters.sessionType !== null,
  ].filter(Boolean).length;

  const availableThemes = filters.subjectId 
    ? themes.filter(t => t.subjectId === filters.subjectId)
    : themes;

  return (
    <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-slate-500" />
          <h3 className="font-medium text-slate-800">Filtros</h3>
          {activeFilterCount > 0 && (
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button 
            onClick={clearFilters}
            className="text-sm text-slate-500 hover:text-slate-700 flex items-center"
          >
            <X className="w-4 h-4 mr-1" /> Limpar
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Period */}
        <div className="flex flex-col">
          <label className="text-xs text-slate-500 mb-1 flex items-center">
            <Calendar className="w-3 h-3 mr-1" /> Período
          </label>
          <select 
            value={filters.period} 
            onChange={handlePeriodChange}
            className="text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>

        {/* Subject */}
        <div className="flex flex-col">
          <label className="text-xs text-slate-500 mb-1 flex items-center">
            <BookOpen className="w-3 h-3 mr-1" /> Disciplina
          </label>
          <select 
            value={filters.subjectId || 'all'} 
            onChange={handleSubjectChange}
            className="text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all">Todas</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Theme */}
        <div className="flex flex-col">
          <label className="text-xs text-slate-500 mb-1 flex items-center">
            <Target className="w-3 h-3 mr-1" /> Tema
          </label>
          <select 
            value={filters.themeId || 'all'} 
            onChange={handleThemeChange}
            disabled={!filters.subjectId && availableThemes.length === 0}
            className="text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
          >
            <option value="all">Todos</option>
            {availableThemes.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Confidence */}
        <div className="flex flex-col">
          <label className="text-xs text-slate-500 mb-1 flex items-center">
            <Activity className="w-3 h-3 mr-1" /> Confiança
          </label>
          <select 
            value={filters.confidence || 'all'} 
            onChange={handleConfidenceChange}
            className="text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all">Todas</option>
            <option value="certain">Certeza</option>
            <option value="doubtful">Dúvida</option>
            <option value="guess">Chute</option>
          </select>
        </div>

        {/* Session Type */}
        <div className="flex flex-col">
          <label className="text-xs text-slate-500 mb-1 flex items-center">
            <Activity className="w-3 h-3 mr-1" /> Tipo
          </label>
          <select 
            value={filters.sessionType || 'all'} 
            onChange={handleSessionTypeChange}
            className="text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all">Todos</option>
            <option value="study">Estudo</option>
            <option value="simulation">Simulado</option>
          </select>
        </div>
      </div>
    </div>
  );
}
