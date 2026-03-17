
import React from 'react';

interface ConfidenceCircleProps {
  stats: {
    certeza: number;
    duvida: number;
    chute: number;
  };
  size?: number;
  strokeWidth?: number;
}

const ConfidenceCircle: React.FC<ConfidenceCircleProps> = ({ stats, size = 40, strokeWidth = 6 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const total = stats.certeza + stats.duvida + stats.chute;
  if (total === 0) return null;

  const certaintyPercent = (stats.certeza / total) * 100;
  const doubtPercent = (stats.duvida / total) * 100;
  const guessPercent = (stats.chute / total) * 100;

  const certaintyStroke = (certaintyPercent / 100) * circumference;
  const doubtStroke = (doubtPercent / 100) * circumference;
  const guessStroke = (guessPercent / 100) * circumference;

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
        
        {/* Certainty */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#22c55e" // green-500
          strokeWidth={strokeWidth}
          strokeDasharray={`${certaintyStroke} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
        
        {/* Doubt */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#f59e0b" // amber-500
          strokeWidth={strokeWidth}
          strokeDasharray={`${doubtStroke} ${circumference}`}
          strokeDashoffset={-certaintyStroke}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
        
        {/* Guess */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#3b82f6" // blue-500
          strokeWidth={strokeWidth}
          strokeDasharray={`${guessStroke} ${circumference}`}
          strokeDashoffset={-(certaintyStroke + doubtStroke)}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[8px] font-black text-slate-400">{total}%</span>
      </div>
    </div>
  );
};

export default ConfidenceCircle;
