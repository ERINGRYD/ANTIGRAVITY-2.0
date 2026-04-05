import React from 'react';
import { BookOpen, TrendingUp, Award } from 'lucide-react';
import { KnowledgeLevel } from '../utils/priorityUtils';

interface KnowledgeLevelSelectorProps {
  value: KnowledgeLevel;
  onChange?: (level: KnowledgeLevel) => void;  // undefined = read-only
  size?: 'sm' | 'md';
}

const KnowledgeLevelSelector: React.FC<KnowledgeLevelSelectorProps> = ({ value, onChange, size = 'sm' }) => {
  const isInteractive = onChange !== undefined;

  const renderBars = (level: KnowledgeLevel, isSelected: boolean) => {
    const barConfigs = {
      iniciante: [
        { height: 'h-2', color: isSelected ? 'bg-red-500' : 'bg-red-400/50' },
        { height: 'h-3', color: 'bg-slate-200 dark:bg-slate-700' },
        { height: 'h-4', color: 'bg-slate-200 dark:bg-slate-700' },
      ],
      intermediario: [
        { height: 'h-2', color: isSelected ? 'bg-amber-400' : 'bg-amber-400/50' },
        { height: 'h-3', color: isSelected ? 'bg-amber-400' : 'bg-amber-400/50' },
        { height: 'h-4', color: 'bg-slate-200 dark:bg-slate-700' },
      ],
      avancado: [
        { height: 'h-2', color: isSelected ? 'bg-emerald-500' : 'bg-emerald-500/50' },
        { height: 'h-3', color: isSelected ? 'bg-emerald-500' : 'bg-emerald-500/50' },
        { height: 'h-4', color: isSelected ? 'bg-emerald-500' : 'bg-emerald-500/50' },
      ],
    };

    const bars = barConfigs[level];

    return (
      <div className="flex gap-0.5 h-4 items-end">
        {bars.map((bar, i) => (
          <div 
            key={i} 
            className={`w-1.5 ${bar.height} rounded-sm ${bar.color}`} 
          />
        ))}
      </div>
    );
  };

  const levels: KnowledgeLevel[] = ['iniciante', 'intermediario', 'avancado'];
  const labels = {
    iniciante: 'Iniciante',
    intermediario: 'Intermediário',
    avancado: 'Avançado'
  };

  return (
    <div className={isInteractive ? "grid grid-cols-3 gap-2" : "flex justify-start"}>
      {levels.map((level) => {
        const isSelected = value === level;
        
        // If not interactive, only show the selected level
        if (!isInteractive && !isSelected) return null;

        return (
          <button
            key={level}
            type="button"
            onClick={(e) => { e.stopPropagation(); if (isInteractive) onChange(level); }}
            disabled={!isInteractive}
            className={`flex flex-col items-center gap-2 p-2 rounded-xl border transition-all duration-200 ${
              isSelected 
                ? 'border-transparent bg-transparent' 
                : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300'
            } ${isInteractive ? 'cursor-pointer w-full' : 'cursor-default px-0'}`}
          >
            {renderBars(level, isSelected)}
            <span className={`text-[8px] font-bold uppercase tracking-tighter ${
              isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-500'
            }`}>
              {labels[level]}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default KnowledgeLevelSelector;
