
import React from 'react';

interface MiniDonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
  centerText?: string;
}

const MiniDonutChart: React.FC<MiniDonutChartProps> = ({ data, size = 40, strokeWidth = 6, centerText }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const total = data.reduce((acc, item) => acc + item.value, 0);
  if (total === 0) return null;

  let currentOffset = 0;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full" viewBox={`0 0 ${size} ${size}`}>
        {/* Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100 dark:text-slate-800"
        />
        
        {data.map((item, index) => {
          if (item.value === 0) return null;
          const percent = (item.value / total) * 100;
          const stroke = (percent / 100) * circumference;
          const offset = currentOffset;
          currentOffset -= stroke;

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${stroke} ${circumference}`}
              strokeDashoffset={offset}
              strokeLinecap={percent === 100 ? 'butt' : 'round'}
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
      {centerText && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[8px] font-black text-slate-400">{centerText}</span>
        </div>
      )}
    </div>
  );
};

export default MiniDonutChart;
