
import React, { useState } from 'react';
import { Subject, Topic } from '../types';
import { useApp } from '../contexts/AppContext';

interface SubjectStatsViewProps {
  subject: Subject;
  onBack: () => void;
  onClose: () => void;
  onStartStudy: (subjectId: string) => void;
}

const SubjectStatsView: React.FC<SubjectStatsViewProps> = ({ subject, onBack, onClose, onStartStudy }) => {
  const { isDarkMode } = useApp();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalSubjectMinutes = subject.studiedMinutes || 1; 
  const totalSubjectHours = (totalSubjectMinutes / 60).toFixed(1);
  const weeklyGoalHours = 50; 
  const progressPercentage = Math.min(100, (parseFloat(totalSubjectHours) / weeklyGoalHours) * 100);
  const remainingHours = (weeklyGoalHours - parseFloat(totalSubjectHours)).toFixed(1);

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  
  // Pegamos os tópicos reais da matéria para exibir
  const displayTopics = subject.topics.length > 0 ? subject.topics.slice(0, 3) : [];
  
  // Função para gerar variações de tonalidade baseadas na cor da matéria
  const getTopicColor = (index: number) => {
    const opacities = ['FF', 'B3', '66']; 
    const baseColor = subject.color.startsWith('#') ? subject.color : `#${subject.color}`;
    return `${baseColor}${opacities[index % opacities.length]}`;
  };

  let accumulatedPercent = 0;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 px-4">
      <style>{`
        @keyframes pulse-soft {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        .glow-filter {
          filter: drop-shadow(0 0 8px currentColor);
        }
      `}</style>
      
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in duration-300 border border-slate-100 dark:border-slate-800">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 shrink-0 bg-white dark:bg-slate-900">
          <button 
            onClick={onBack}
            className="w-12 h-12 -ml-3 flex items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors active:scale-95"
          >
            <span className="material-icons-round text-xl">arrow_back</span>
          </button>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">Gestão de Tempo - {subject.name}</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 ml-auto flex items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors"
          >
            <span className="material-icons-round text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto no-scrollbar flex-1 space-y-8">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm group cursor-default">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Média Diária</p>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">2.1h</span>
                <span className="text-[10px] font-bold text-emerald-500 flex items-center leading-none">
                  <span className="material-icons-round text-[12px]">trending_up</span>8%
                </span>
              </div>
            </div>
            <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm group cursor-default">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Total Semana</p>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{totalSubjectHours}h</span>
                <span className="text-[10px] font-bold text-emerald-500 leading-none">+2.4h</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 ml-1">Meta Semanal</h3>
            <div className="flex justify-between items-end mb-2 px-1">
              <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{totalSubjectHours}h</span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{weeklyGoalHours}h</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-50 dark:border-slate-700 relative">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.3)]" 
                style={{ width: `${progressPercentage}%`, backgroundColor: subject.color }}
              ></div>
            </div>
            <p className="mt-2 text-[11px] font-medium text-slate-400 dark:text-slate-500 px-1">
              Faltam <span className="text-slate-900 dark:text-white font-bold">{remainingHours}h</span> para atingir sua meta
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] ml-1">Distribuição por Tópico</h3>
            <div className="flex items-center gap-8">
              <div className="relative w-36 h-36 shrink-0 group">
                <svg className="w-full h-full -rotate-90 overflow-visible" viewBox="0 0 100 100">
                  <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  
                  <circle cx="50" cy="50" r={radius} fill="transparent" stroke={isDarkMode ? "#1E293B" : "#F1F5F9"} strokeWidth="14" />
                  
                  {displayTopics.map((topic, index) => {
                    const ratio = 1 / Math.max(displayTopics.length, 1);
                    const strokeDash = ratio * circumference;
                    const strokeOffset = -accumulatedPercent * circumference;
                    const color = getTopicColor(index);
                    
                    const midAnglePercent = accumulatedPercent + (ratio / 2);
                    const angleRad = (midAnglePercent * 360) * (Math.PI / 180);
                    
                    // Efeito de "expansão" da fatia: move o ícone um pouco mais para fora no hover
                    const iconDistance = hoveredIndex === index ? radius + 2 : radius;
                    const iconX = 50 + iconDistance * Math.cos(angleRad);
                    const iconY = 50 + iconDistance * Math.sin(angleRad);
                    
                    accumulatedPercent += ratio;
                    const isHovered = hoveredIndex === index;

                    return (
                      <g 
                        key={topic.id} 
                        className="cursor-pointer transition-all duration-300"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        <circle 
                          cx="50" cy="50" r={radius} fill="transparent" 
                          stroke={color} 
                          strokeDasharray={`${strokeDash} ${circumference}`} 
                          strokeDashoffset={strokeOffset} 
                          strokeWidth={isHovered ? "20" : "14"} 
                          strokeLinecap="butt"
                          filter={isHovered ? "url(#glow)" : "none"}
                          style={{ 
                            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            opacity: hoveredIndex !== null && !isHovered ? 0.6 : 1
                          }}
                        />
                        <text
                          x={iconX}
                          y={iconY}
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="material-icons-round fill-white pointer-events-none select-none"
                          style={{ 
                            fontSize: isHovered ? '16px' : '11px',
                            opacity: isHovered ? 1 : 0.9,
                            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            textShadow: isHovered ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
                          }}
                          transform={`rotate(90 ${iconX} ${iconY})`}
                        >
                          {topic.icon || 'star'}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-transform duration-500">
                  <span className={`text-2xl font-black text-slate-900 dark:text-white tracking-tighter transition-all duration-300 ${hoveredIndex !== null ? 'scale-110' : ''}`}>
                    {hoveredIndex !== null ? (displayTopics[hoveredIndex].studiedMinutes / 60).toFixed(1) + 'h' : totalSubjectHours + 'h'}
                  </span>
                  <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">
                    {/* Fixed error: Property 'shortName' does not exist on type 'Topic'. Using substring of name instead. */}
                    {hoveredIndex !== null ? displayTopics[hoveredIndex].name.substring(0, 5) : subject.name}
                  </span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-4">
                {displayTopics.map((topic, index) => {
                  const color = getTopicColor(index);
                  const topicHours = (topic.studiedMinutes / 60).toFixed(1);
                  const topicPercentage = totalSubjectMinutes > 0 
                    ? Math.round((topic.studiedMinutes / totalSubjectMinutes) * 100) 
                    : (100 / displayTopics.length);
                  const isHovered = hoveredIndex === index;

                  return (
                    <div 
                      key={topic.id} 
                      className={`flex flex-col gap-1.5 transition-all duration-500 cursor-pointer ${isHovered ? 'translate-x-2' : ''}`}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <div className="flex items-center gap-2 min-w-0">
                          <div 
                            className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-300 ${isHovered ? 'shadow-lg scale-125' : 'bg-slate-50 dark:bg-slate-800'}`}
                            style={isHovered ? { backgroundColor: color, color: 'white' } : { color: color }}
                          >
                            <span className="material-icons-round text-[12px]">{topic.icon || 'star'}</span>
                          </div>
                          <span className={`truncate uppercase tracking-tight transition-all duration-300 ${isHovered ? 'text-slate-900 dark:text-white font-black' : 'text-slate-500 dark:text-slate-400'}`}>
                            {topic.name}
                          </span>
                        </div>
                        <span className={`shrink-0 ml-1 transition-all duration-300 ${isHovered ? 'text-blue-500 dark:text-blue-400 scale-125 font-black' : 'text-slate-900 dark:text-white'}`}>
                          {topicHours}h
                        </span>
                      </div>
                      <div className="h-2 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-100/50 dark:border-slate-700/50">
                        <div 
                          className="h-full rounded-full transition-all duration-500 ease-out" 
                          style={{ 
                            width: `${topicPercentage}%`, 
                            backgroundColor: color,
                            boxShadow: isHovered ? `0 0 12px ${color}66` : 'none',
                            filter: isHovered ? 'brightness(1.1)' : 'none'
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-3xl p-6 space-y-5 shadow-sm group hover:shadow-md transition-all duration-300">
            <div className="flex gap-4">
              <div className="bg-amber-100 dark:bg-amber-900/30 w-12 h-12 rounded-full flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800 group-hover:scale-110 transition-transform duration-500">
                <span className="material-icons-round text-amber-500 text-2xl animate-pulse">priority_high</span>
              </div>
              <div className="space-y-1">
                <h4 className="text-[11px] font-black text-amber-800 dark:text-amber-500 uppercase tracking-widest">Foco Necessário</h4>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {displayTopics[displayTopics.length - 1]?.name || 'Tópico'}
                  </span> é o tópico com menor evolução nesta semana dentro de {subject.name}.
                </p>
              </div>
            </div>
            <button 
              onClick={() => onStartStudy(subject.id)}
              className="w-full bg-[#F59E0B] text-white py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all hover:brightness-110 hover:shadow-amber-500/40"
            >
              <span className="material-icons-round text-xl">play_arrow</span>
              Estudar {displayTopics[displayTopics.length - 1]?.name || 'agora'}
            </button>
          </div>
        </div>

        <div className="px-6 py-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button 
            onClick={onBack}
            className="w-full bg-[#0F172A] dark:bg-slate-800 text-white font-bold py-4 rounded-2xl text-sm shadow-xl active:scale-[0.98] transition-all hover:bg-slate-800 dark:hover:bg-slate-700"
          >
            Voltar ao Ciclo Geral
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubjectStatsView;
