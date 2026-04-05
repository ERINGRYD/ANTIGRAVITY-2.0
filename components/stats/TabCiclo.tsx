import React, { useMemo } from 'react';
import { StudySession } from '../../types/stats.types';
import { 
  getTotalStudyTime, 
  getStudyEvolutionByDay, 
  getTimeBySubject, 
  getPeakStudyHours 
} from '../../utils/cycleStats';
import { Clock, PlayCircle, PauseCircle, Target } from 'lucide-react';

interface TabCicloProps {
  sessions: StudySession[];
  heatmapSessions: StudySession[];
}

export function TabCiclo({ sessions, heatmapSessions }: TabCicloProps) {
  const { studyMinutes, pauseMinutes, totalMinutes, focusRatio } = useMemo(() => getTotalStudyTime(sessions), [sessions]);
  const evolution = useMemo(() => getStudyEvolutionByDay(sessions), [sessions]);
  const bySubject = useMemo(() => getTimeBySubject(sessions), [sessions]);
  const peakHours = useMemo(() => getPeakStudyHours(sessions).slice(0, 3), [sessions]);

  const formatHours = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = Math.floor(mins % 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      {/* Scorecards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center text-slate-500 mb-2">
            <Clock className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Tempo Líquido</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">{formatHours(studyMinutes)}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center text-slate-500 mb-2">
            <PauseCircle className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Tempo de Pausa</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">{formatHours(pauseMinutes)}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center text-slate-500 mb-2">
            <PlayCircle className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Sessões</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">{sessions.length}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center text-slate-500 mb-2">
            <Target className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Foco</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">{(focusRatio * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Evolução */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Evolução Diária</h3>
          <div className="h-64 flex items-end space-x-2">
            {evolution.map((day, i) => {
              const maxMinutes = Math.max(...evolution.map(e => e.studyMinutes), 1);
              const height = `${(day.studyMinutes / maxMinutes) * 100}%`;
              return (
                <div key={i} className="flex-1 flex flex-col justify-end items-center group relative">
                  <div 
                    className="w-full bg-indigo-500 rounded-t-sm transition-all hover:bg-indigo-600"
                    style={{ height }}
                  />
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 transition-opacity">
                    {day.date}: {formatHours(day.studyMinutes)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Subject Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Por Disciplina</h3>
          <div className="space-y-4">
            {bySubject.map(sub => (
              <div key={sub.subjectId} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.subjectColor }} />
                  <span className="text-sm font-medium text-slate-700">{sub.subjectName}</span>
                </div>
                <div className="text-sm text-slate-600 font-medium">
                  {formatHours(sub.studyMinutes)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Peak Hours & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Horários de Pico</h3>
          <div className="flex space-x-4">
            {peakHours.map((h, i) => (
              <div key={i} className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-indigo-600">{h.hour}h</span>
                <span className="text-xs text-slate-500 mt-1">{formatHours(h.totalMinutes)} totais</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Mapa de Calor (28 dias)</h3>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 28 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (27 - i));
              const dateStr = d.toISOString().split('T')[0];
              const daySessions = heatmapSessions.filter(s => s.startedAt.startsWith(dateStr));
              const mins = daySessions.reduce((acc, s) => acc + s.studyMinutes, 0);
              
              let bg = 'bg-slate-100';
              if (mins > 0) bg = 'bg-indigo-200';
              if (mins > 60) bg = 'bg-indigo-400';
              if (mins > 120) bg = 'bg-indigo-600';
              if (mins > 240) bg = 'bg-indigo-800';

              return (
                <div 
                  key={i} 
                  className={`aspect-square rounded-md ${bg} flex items-center justify-center group relative`}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 transition-opacity">
                    {dateStr}: {formatHours(mins)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
