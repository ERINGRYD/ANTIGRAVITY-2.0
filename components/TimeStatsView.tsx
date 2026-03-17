
import React, { useState } from 'react';
import { Subject } from '../types';

interface TimeStatsViewProps {
  onBack: () => void;
  onStartStudy: (subjectId: string) => void;
  onSelectSubject: (subjectId: string) => void;
  subjects: Subject[];
}

const TimeStatsView: React.FC<TimeStatsViewProps> = ({ onBack, onStartStudy, onSelectSubject, subjects }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const totalStudiedMinutes = subjects.reduce((acc, s) => acc + s.studiedMinutes, 0);
  const totalStudiedHours = (totalStudiedMinutes / 60).toFixed(1);
  const weeklyGoalHours = 50;
  const progressPercentage = Math.min(100, (parseFloat(totalStudiedHours) / weeklyGoalHours) * 100);
  const remainingHours = (weeklyGoalHours - parseFloat(totalStudiedHours)).toFixed(1);

  const sortedSubjects = [...subjects].sort((a, b) => a.studiedMinutes - b.studiedMinutes);
  const lowPresenceSubject = sortedSubjects[0];

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  const hoveredSubject = subjects.find(s => s.id === hoveredId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 px-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in duration-300 transition-colors duration-300">
        
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900 transition-colors duration-300">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Gestão de Tempo</h2>
          <button 
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center -mr-3 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors active:scale-95"
          >
            <span className="material-icons-round text-xl">close</span>
          </button>
        </div>

        <div className="px-6 py-6 overflow-y-auto no-scrollbar flex-1 space-y-8">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md cursor-default group">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Média Diária</p>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">5.2h</span>
                <span className="text-[10px] font-bold text-emerald-500 flex items-center leading-none">
                  <span className="material-icons-round text-[12px]">trending_up</span>15%
                </span>
              </div>
            </div>
            <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md cursor-default group">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Total Semana</p>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{totalStudiedHours}h</span>
                <span className="text-[10px] font-bold text-emerald-500 leading-none">+8h</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 ml-1">Meta Semanal</h3>
            <div className="flex justify-between items-end mb-2 px-1">
              <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{totalStudiedHours}h</span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{weeklyGoalHours}h</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-50 dark:border-slate-800 relative">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.2)]" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="mt-2 text-[11px] font-medium text-slate-400 dark:text-slate-500 px-1">
              Faltam <span className="text-blue-500 font-bold">{remainingHours}h</span> para atingir sua meta
            </p>
          </div>

          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-5 ml-1">Distribuição por Matéria</h3>
            <div className="flex flex-col items-center gap-8">
              <div className="relative w-44 h-44 shrink-0">
                <svg className="w-full h-full -rotate-90 overflow-visible" viewBox="0 0 100 100">
                  <defs>
                    <filter id="glow-large" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  
                  <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#F1F5F9" strokeWidth="14" className="dark:stroke-slate-800" />
                  
                  {subjects.map((s) => {
                    const ratio = s.studiedMinutes / Math.max(totalStudiedMinutes, 1);
                    if (ratio <= 0) return null;
                    const strokeDash = ratio * circumference;
                    const strokeOffset = -accumulatedPercent * circumference;
                    
                    const midAnglePercent = accumulatedPercent + (ratio / 2);
                    const angleRad = (midAnglePercent * 360) * (Math.PI / 180);
                    
                    const isHovered = hoveredId === s.id;
                    const isDimmed = hoveredId !== null && !isHovered;
                    
                    // Posição dinâmica do ícone (move para fora no hover)
                    const iconDistance = isHovered ? radius + 2 : radius;
                    const iconX = 50 + iconDistance * Math.cos(angleRad);
                    const iconY = 50 + iconDistance * Math.sin(angleRad);
                    
                    accumulatedPercent += ratio;
                    
                    return (
                      <g 
                        key={s.id}
                        className="cursor-pointer transition-all duration-500 ease-out"
                        onMouseEnter={() => setHoveredId(s.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => onSelectSubject(s.id)}
                      >
                        <circle 
                          cx="50" cy="50" fill="transparent" r={radius} 
                          stroke={s.color} 
                          strokeDasharray={`${strokeDash} ${circumference}`} 
                          strokeDashoffset={strokeOffset} 
                          strokeWidth={isHovered ? "22" : "14"} 
                          strokeLinecap="butt"
                          filter={isHovered ? "url(#glow-large)" : "none"}
                          style={{ 
                            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            opacity: isDimmed ? 0.3 : 1
                          }}
                        />
                        <text
                          x={iconX}
                          y={iconY}
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="material-icons-round fill-white pointer-events-none select-none"
                          style={{ 
                            fontSize: isHovered ? '14px' : '10px',
                            opacity: isHovered ? 1 : 0.9,
                            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            textShadow: isHovered ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
                          }}
                          transform={`rotate(90 ${iconX} ${iconY})`}
                        >
                          {s.icon || 'book'}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className={`flex flex-col items-center transition-all duration-500 ${hoveredId ? 'scale-110' : 'scale-100'}`}>
                    <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                      {hoveredSubject ? (hoveredSubject.studiedMinutes / 60).toFixed(1) + 'h' : totalStudiedHours + 'h'}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-[0.2em] mt-1 transition-colors duration-300 ${hoveredSubject ? '' : 'text-slate-400 dark:text-slate-500'}`} style={hoveredSubject ? { color: hoveredSubject.color } : {}}>
                      {hoveredSubject ? hoveredSubject.shortName : 'Total'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-4">
                {subjects.slice(0, 4).map((s) => {
                  const isHovered = hoveredId === s.id;
                  const topicPercentage = totalStudiedMinutes > 0 
                    ? Math.round((s.studiedMinutes / totalStudiedMinutes) * 100) 
                    : 0;

                  return (
                    <div 
                      key={s.id} 
                      className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        isHovered 
                        ? 'bg-white dark:bg-slate-800 shadow-lg -translate-y-1' 
                        : 'bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800'
                      }`}
                      style={isHovered ? { borderColor: `${s.color}33` } : {}}
                      onMouseEnter={() => setHoveredId(s.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => onSelectSubject(s.id)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${isHovered ? 'shadow-md scale-110' : 'bg-white dark:bg-slate-700'}`}
                          style={isHovered ? { backgroundColor: s.color, color: 'white' } : { color: s.color }}
                        >
                          <span className="material-icons-round text-sm">{s.icon}</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${isHovered ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                          {s.shortName}
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span 
                          className={`text-base font-black tabular-nums transition-colors ${isHovered ? '' : 'text-slate-900 dark:text-white'}`}
                          style={isHovered ? { color: s.color } : {}}
                        >
                          {Math.floor(s.studiedMinutes / 60)}h
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{topicPercentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-6 space-y-5 shadow-sm group hover:shadow-md transition-all duration-300">
            <div className="flex gap-4">
              <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center shrink-0 border border-amber-200 group-hover:scale-110 transition-transform duration-500">
                <span className="material-icons-round text-amber-500 text-2xl animate-pulse">priority_high</span>
              </div>
              <div className="space-y-1">
                <h4 className="text-[11px] font-black text-amber-800 uppercase tracking-widest">Foco Necessário</h4>
                <p className="text-sm font-medium text-slate-700 leading-snug">
                  <span className="font-bold text-slate-900">{lowPresenceSubject?.name}</span> é a matéria com menor presença no seu ciclo atual.
                </p>
              </div>
            </div>
            <button 
              onClick={() => onStartStudy(lowPresenceSubject.id)}
              className="w-full bg-[#F59E0B] text-white py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all hover:brightness-110 hover:shadow-amber-500/40"
            >
              <span className="material-icons-round text-xl">play_arrow</span>
              Estudar {lowPresenceSubject?.name} agora
            </button>
          </div>
        </div>

        <div className="px-6 py-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 transition-colors duration-300">
          <button 
            onClick={onBack}
            className="w-full bg-[#0F172A] dark:bg-slate-800 text-white font-bold py-4 rounded-2xl text-sm shadow-xl active:scale-[0.98] transition-all hover:bg-slate-800 dark:hover:bg-slate-700"
          >
            Fechar Detalhes
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeStatsView;
