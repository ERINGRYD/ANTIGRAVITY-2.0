import React from 'react';

interface CycleTimeIndicatorProps {
  percent: number;         // 0-100
  subjectColor: string;    // accent color
  showBar?: boolean;       // show a thin proportional bar
}

const CycleTimeIndicator: React.FC<CycleTimeIndicatorProps> = ({ percent, subjectColor, showBar = false }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center gap-1.5">
        <div 
          className="w-2 h-2 rounded-full" 
          style={{ backgroundColor: subjectColor }}
        />
        <span 
          className="text-sm font-medium" 
          style={{ color: subjectColor }}
        >
          {percent}%
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          do ciclo
        </span>
      </div>
      {showBar && (
        <div className="h-[3px] w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${Math.min(100, Math.max(0, percent))}%`, 
              backgroundColor: subjectColor 
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CycleTimeIndicator;
