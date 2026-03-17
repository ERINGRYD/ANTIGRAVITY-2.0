
import React from 'react';
import { Subject } from '../types';

interface DonutChartProps {
  subjects: Subject[];
  totalTimeStr: string;
  percentage: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ subjects, totalTimeStr, percentage }) => {
  const radius = 38; 
  const circumference = 2 * Math.PI * radius;
  
  // Calcula o total de minutos planejados (metas) para as proporções do ciclo
  const totalPlanned = subjects.reduce((acc, s) => acc + Math.max(s.totalMinutes, 1), 0);
  
  // Variáveis para rastrear o progresso do arco
  let accumulatedOffset = 0;
  let accumulatedRatio = 0;

  return (
    <div className="relative w-64 h-64 mx-auto group">
      <svg className="transform -rotate-90 w-full h-full overflow-visible" viewBox="0 0 100 100">
        {/* Fundo do Círculo (Track) */}
        <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#f8fafc" strokeWidth="18" className="dark:stroke-slate-900" />
        
        {/* Segmentos das Matérias baseados no Planejamento (Ciclo) */}
        {subjects.map((subject) => {
          const plannedTime = Math.max(subject.totalMinutes, 1);
          const ratio = plannedTime / totalPlanned;
          const segmentValue = ratio * circumference;
          const currentOffset = accumulatedOffset;
          
          // Calcula o ângulo médio do segmento para posicionar o texto
          const startAnglePercent = accumulatedRatio;
          const midAnglePercent = startAnglePercent + (ratio / 2);
          const midAngleRad = (midAnglePercent * 360) * (Math.PI / 180);
          
          // Coordenadas para o texto centralizado no arco
          // Adicionamos um pequeno ajuste para o texto não ficar colado na borda interna
          const textX = 50 + radius * Math.cos(midAngleRad);
          const textY = 50 + radius * Math.sin(midAngleRad);
          
          // Atualiza acumuladores para o próximo item
          accumulatedOffset -= segmentValue;
          accumulatedRatio += ratio;

          return (
            <g key={subject.id} className="cursor-pointer">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={subject.color}
                strokeWidth="18"
                strokeDasharray={`${segmentValue} ${circumference}`}
                strokeDashoffset={currentOffset}
                className="transition-all duration-700 ease-in-out hover:stroke-[22px] hover:brightness-110"
              />
              {/* Rótulo dinâmico da matéria (Sigla) */}
              <text 
                x={textX} 
                y={textY} 
                textAnchor="middle" 
                dominantBaseline="middle"
                className="font-black text-[5px] fill-white pointer-events-none select-none transition-all duration-300"
                transform={`rotate(90 ${textX} ${textY})`}
              >
                {subject.shortName}
              </text>
            </g>
          );
        })}
      </svg>
      
      {/* Centro do Donut - Estatísticas Gerais */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{totalTimeStr}</span>
        <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-black mt-3">TEMPO TOTAL</span>
        <div className="flex items-center gap-1.5 mt-2 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/30">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
          <span className="text-sm font-black text-blue-500 tracking-tight">{percentage}%</span>
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
