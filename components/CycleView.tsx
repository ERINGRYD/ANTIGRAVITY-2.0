/**
 * UI/UX Improvements for Auto-Cycle Mode:
 * 
 * LAYER 1: Global Mode Indicator
 * - A persistent badge in the Cycle Control Bar (above the grid) shows 
 *   "CICLO AUTOMÁTICO ATIVO" with a loop icon when isAutoCycle is true.
 * - Uses a subtle blue background to be distinct but not overpowering.
 * 
 * LAYER 2: Visual Connection Between Cards
 * - Added directional arrows between cards to show the automatic progression flow.
 * - Responsive design: vertical arrows on mobile, right/down-left arrows on desktop grid.
 * - Added a dashed "loop back" arrow on the last card to represent cycle continuity.
 * - Connectors are hidden during Edit Mode to avoid visual clutter.
 * - Uses CSS animations (fade-in) for smooth transitions when toggling the mode.
 */
import React, { useMemo } from 'react';
import { Subject, Tab } from '../types';
import SubjectCard from './SubjectCard';
import EmptyState from './EmptyState';
import { calculateAllCyclePercents, calculateCombinedWeight, KnowledgeLevel } from '../utils/priorityUtils';

interface CycleViewProps {
  subjects: Subject[];
  isAutoCycle: boolean;
  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;
  onStartStudy: (subjectId?: string) => void;
  onAddSubject: () => void;
  onSelectSubject: (id: string) => void;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
  draggedSubjectIndex: number | null;
  dragOverSubjectIndex: number | null;
  onPriorityChange?: (subjectId: string, priority: number) => void;
  onLevelChange?: (subjectId: string, level: KnowledgeLevel) => void;
}

const CycleView: React.FC<CycleViewProps> = ({
  subjects,
  isAutoCycle,
  isEditMode,
  setIsEditMode,
  onStartStudy,
  onAddSubject,
  onSelectSubject,
  onDragStart,
  onDragEnter,
  onDragEnd,
  draggedSubjectIndex,
  dragOverSubjectIndex,
  onPriorityChange,
  onLevelChange
}) => {
  
  // Calculate Stats
  const stats = useMemo(() => {
    const totalMinutes = subjects.reduce((acc, s) => acc + s.studiedMinutes, 0);
    const totalGoal = subjects.reduce((acc, s) => acc + s.totalMinutes, 0);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return {
      totalTimeStr: `${h}h ${m}m`,
      percentage: totalGoal > 0 ? Math.round((totalMinutes / totalGoal) * 100) : 0
    };
  }, [subjects]);

  // Donut Chart Logic
  const radius = 38; 
  const circumference = 2 * Math.PI * radius;
  
  // Calcula os pesos para as proporções do ciclo
  const subjectsWithWeights = useMemo(() => subjects.map(s => ({
    ...s,
    weight: calculateCombinedWeight(s.priority || 3, s.knowledgeLevel || 'intermediario')
  })), [subjects]);

  const totalWeight = useMemo(() => subjectsWithWeights.reduce((acc, s) => acc + s.weight, 0), [subjectsWithWeights]);
  
  let accumulatedOffset = 0;
  let accumulatedRatio = 0;

  // Calculate cycle percentages
  const cyclePercents = useMemo(() => {
    return calculateAllCyclePercents(subjects as any);
  }, [subjects]);

  return (
    <main className="px-6 py-8 flex flex-col gap-8 animate-in fade-in duration-300 pb-32 max-w-7xl mx-auto w-full">
      
      {/* Hero Section - Chart */}
      <section className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 p-8 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
        <div className="relative w-64 h-64 group">
          <svg className="transform -rotate-90 w-full h-full overflow-visible" viewBox="0 0 100 100">
            {/* Track */}
            <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="16" className="dark:stroke-slate-800" />
            
            {/* Segments */}
            {subjectsWithWeights.map((subject) => {
              const ratio = totalWeight > 0 ? subject.weight / totalWeight : 0;
              if (ratio === 0) return null;

              const segmentValue = ratio * circumference;
              const currentOffset = accumulatedOffset;
              
              // Text positioning
              const midAnglePercent = accumulatedRatio + (ratio / 2);
              const midAngleRad = (midAnglePercent * 360) * (Math.PI / 180);
              const textX = 50 + radius * Math.cos(midAngleRad);
              const textY = 50 + radius * Math.sin(midAngleRad);
              
              accumulatedOffset -= segmentValue;
              accumulatedRatio += ratio;

              return (
                <g key={subject.id} className="cursor-pointer hover:opacity-90 transition-opacity">
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke={subject.color}
                    strokeWidth="16"
                    strokeDasharray={`${segmentValue} ${circumference}`}
                    strokeDashoffset={currentOffset}
                    className="transition-all duration-500"
                  />
                  <text 
                    x={textX} 
                    y={textY} 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    className="font-bold text-[4px] fill-white pointer-events-none select-none uppercase"
                    transform={`rotate(${midAnglePercent * 360 + 90} ${textX} ${textY})`}
                  >
                    {subject.shortName || 'NEW'}
                  </text>
                </g>
              );
            })}
          </svg>
          
          {/* Center Stats */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">{stats.totalTimeStr}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-bold mt-2">TEMPO TOTAL</span>
            <div className="flex items-center gap-1.5 mt-3 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{stats.percentage}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cycle Control Bar */}
      <div className="flex items-center justify-between px-2 gap-2">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden md:block">
          CICLO ATUAL
        </span>

        {isAutoCycle && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-full">
            <span className="material-icons-round text-blue-500 text-sm">autorenew</span>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide whitespace-nowrap">
              <span className="hidden sm:inline">CICLO AUTOMÁTICO </span>ATIVO
            </span>
          </div>
        )}

        <div className="flex items-center gap-4 ml-auto md:ml-0">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden md:block">
            {subjects.filter(s => s.studiedMinutes >= s.totalMinutes).length} DE {subjects.length} MATÉRIAS
          </span>
          
          {subjects.length > 0 && (
            <button 
              onClick={() => setIsEditMode(!isEditMode)}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
              <span className="material-icons-round text-sm">{isEditMode ? 'check' : 'edit'}</span>
              <span className="hidden sm:inline">{isEditMode ? 'CONCLUÍDO' : 'EDITAR CICLO'}</span>
              <span className="sm:hidden">{isEditMode ? 'OK' : 'EDITAR'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Subjects Grid */}
      {subjects.length === 0 ? (
        <EmptyState onAddSubject={onAddSubject} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects.map((subject, index) => (
            <div key={subject.id} className="relative h-full">
              <SubjectCard 
                subject={subject} 
                isActive={!isEditMode && index === 0 && subject.studiedMinutes < subject.totalMinutes}
                onClick={!isEditMode ? onSelectSubject : undefined}
                onPlay={!isEditMode ? onStartStudy : undefined}
                draggable={isEditMode}
                onDragStart={() => isEditMode && onDragStart(index)}
                onDragEnter={() => isEditMode && onDragEnter(index)}
                onDragOver={(e) => isEditMode && e.preventDefault()}
                onDrop={isEditMode ? onDragEnd : undefined}
                isDragging={isEditMode && draggedSubjectIndex === index}
                isDropTarget={isEditMode && dragOverSubjectIndex === index}
                isEditMode={isEditMode}
                cardIndex={index}
                cyclePercent={cyclePercents[subject.id] || 0}
                onPriorityChange={onPriorityChange}
                onLevelChange={onLevelChange}
              />

              {/* Auto-Cycle Connectors (Layer 2) */}
              {isAutoCycle && !isEditMode && (
                <>
                  {/* Mobile Connector (Down) */}
                  {index < subjects.length - 1 && (
                    <div 
                      className="absolute z-10 md:hidden text-slate-300 dark:text-slate-600 animate-in fade-in duration-300"
                      style={{ bottom: '-12px', left: '50%', transform: 'translate(-50%, 50%)' }}
                    >
                      <span className="material-icons-round text-xl">arrow_downward</span>
                    </div>
                  )}
                  
                  {/* Desktop Connectors */}
                  {index < subjects.length - 1 && index % 2 === 0 && (
                    // Right arrow for even items (0 -> 1, 2 -> 3)
                    <div 
                      className="absolute z-10 hidden md:block text-slate-300 dark:text-slate-600 animate-in fade-in duration-300"
                      style={{ right: '-12px', top: '50%', transform: 'translate(50%, -50%)' }}
                    >
                      <span className="material-icons-round text-xl">arrow_forward</span>
                    </div>
                  )}
                  {index < subjects.length - 1 && index % 2 === 1 && (
                    // Down-left arrow for odd items (1 -> 2, 3 -> 4)
                    <div 
                      className="absolute z-10 hidden md:block text-slate-300 dark:text-slate-600 animate-in fade-in duration-300"
                      style={{ bottom: '-12px', left: '-12px', transform: 'translate(-50%, 50%)' }}
                    >
                      <span className="material-icons-round text-xl">subdirectory_arrow_left</span>
                    </div>
                  )}

                  {/* Last Card Loop Connector */}
                  {index === subjects.length - 1 && subjects.length > 1 && (
                    <div 
                      className="absolute z-10 text-slate-300 dark:text-slate-600 animate-in fade-in duration-300 opacity-60"
                      style={{ bottom: '-16px', left: '50%', transform: 'translate(-50%, 50%)' }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 9L9 4 4 9" />
                        <path d="M9 4v10.5A5.5 5.5 0 0 0 14.5 20h5.5" />
                      </svg>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {/* New Subject Placeholder */}
          <button
            onClick={onAddSubject}
            className="group flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-300 min-h-[180px]"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 flex items-center justify-center mb-4 transition-colors">
              <span className="material-icons-round text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors text-xl">add</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 group-hover:text-blue-500 uppercase tracking-widest transition-colors">
              NOVA MATÉRIA
            </span>
          </button>
        </div>
      )}

      {/* Context Footer Note */}
      <div className="flex items-start gap-3 p-4 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl mt-6 border border-dashed border-slate-200 dark:border-slate-800">
        <span className="material-symbols-outlined text-slate-400 text-sm mt-0.5">info</span>
        <p className="text-xs text-slate-500 italic leading-relaxed">
          Seu nível influencia o peso da matéria no cronograma. Matérias de nível "Iniciante" receberão mais blocos de estudo.
        </p>
      </div>
    </main>
  );
};

export default CycleView;
