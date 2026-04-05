import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;           // 1-5
  onChange?: (value: number) => void;
  readonly?: boolean;      // true = display only, no interaction
  size?: 'sm' | 'md';     // sm = 12px stars, md = 16px stars (default md)
  showLabel?: boolean;     // shows "Prioridade: X" below stars
  accentColor?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ value, onChange, readonly = false, size = 'md', showLabel = false, accentColor }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const isInteractive = !readonly && onChange !== undefined;
  const displayValue = hovered ?? value;

  const activeColor = accentColor || '#facc15'; // yellow-400

  return (
    <div className="flex flex-col items-start">
      <div
        className={`flex items-center ${size === 'sm' ? 'gap-0.5' : 'gap-1'}`}
        role={isInteractive ? 'radiogroup' : undefined}
        aria-label={isInteractive ? 'Prioridade' : `Prioridade: ${value} de 5`}
        onMouseLeave={() => isInteractive && setHovered(null)}
      >
        {[1, 2, 3, 4, 5].map(star => {
          const isFilled = star <= displayValue;
          return (
            <button
              key={star}
              type="button"
              disabled={!isInteractive}
              onClick={(e) => {
                e.stopPropagation();
                if (isInteractive) onChange?.(star);
              }}
              onMouseEnter={() => isInteractive && setHovered(star)}
              className={`
                ${!isInteractive ? 'cursor-default pointer-events-none' : 'cursor-pointer hover:scale-110'}
                focus:outline-none focus-visible:ring-1 focus-visible:ring-yellow-400
                rounded-sm transition-transform duration-100 flex items-center justify-center
              `}
              aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
              aria-pressed={isInteractive ? value === star : undefined}
              style={{ color: isFilled ? activeColor : undefined }}
            >
              <Star
                size={size === 'sm' ? 12 : 16}
                className={`transition-colors duration-100 ${isFilled ? 'fill-current' : 'text-slate-200 dark:text-slate-700 fill-transparent'}`}
                strokeWidth={isFilled ? 0 : 2}
              />
            </button>
          );
        })}
      </div>
      {showLabel && (
        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Prioridade: {value}/5
        </span>
      )}
    </div>
  );
};

export default StarRating;
