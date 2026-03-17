import React from 'react';

interface InsightCardProps {
  icon: string;
  label: string;
  value: string;
  description: string;
  severity: 'info' | 'warning' | 'danger' | 'success';
  ctaLabel?: string;
  onCta?: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({
  icon,
  label,
  value,
  description,
  severity,
  ctaLabel,
  onCta
}) => {
  const colors = {
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    danger: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
  };

  return (
    <div className={`flex-shrink-0 w-72 p-4 rounded-2xl border ${colors[severity]} snap-center`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-sm font-bold opacity-80">{label}</h3>
        </div>
      </div>
      <div className="mb-2">
        <span className="text-2xl font-black tracking-tight">{value}</span>
      </div>
      <p className="text-xs font-medium opacity-80 leading-snug mb-3">
        {description}
      </p>
      {ctaLabel && onCta && (
        <button
          onClick={onCta}
          className="w-full py-2 px-3 bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 rounded-lg text-xs font-bold transition-colors"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
};

export default InsightCard;
