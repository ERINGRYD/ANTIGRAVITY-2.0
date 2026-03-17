import React from 'react';
import { ConfidenceLevel } from '../utils/confidenceScoring';

interface ConfidenceSelectorProps {
  onSelect: (confidence: ConfidenceLevel) => void;
  isVisible: boolean;
  selectedValue: ConfidenceLevel | null;
}

const ConfidenceSelector: React.FC<ConfidenceSelectorProps> = ({ onSelect, isVisible, selectedValue }) => {
  if (!isVisible) return null;

  const handleSelect = (level: ConfidenceLevel) => {
    onSelect(level);
  };

  return (
    <div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider text-center">
        Nível de Confiança
      </h3>
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => handleSelect('certain')}
          className={`relative flex flex-col items-center justify-center p-3 rounded-xl transition-all shadow-sm ${
            selectedValue === 'certain'
              ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500 transform scale-[1.02]'
              : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/10 opacity-70 hover:opacity-100'
          }`}
        >
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">+5 XP</div>
          <span className={`material-symbols-outlined mb-1 ${selectedValue === 'certain' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>check_circle</span>
          <span className={`text-xs ${selectedValue === 'certain' ? 'font-bold text-green-700 dark:text-green-400' : 'font-medium text-gray-600 dark:text-gray-300'}`}>
            Certeza
          </span>
        </button>

        <button
          onClick={() => handleSelect('doubtful')}
          className={`relative flex flex-col items-center justify-center p-3 rounded-xl transition-all shadow-sm ${
            selectedValue === 'doubtful'
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 transform scale-[1.02]'
              : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 opacity-70 hover:opacity-100'
          }`}
        >
          <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">+3 XP</div>
          <span className={`material-symbols-outlined mb-1 ${selectedValue === 'doubtful' ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500'}`}>help</span>
          <span className={`text-xs ${selectedValue === 'doubtful' ? 'font-bold text-yellow-600 dark:text-yellow-400' : 'font-medium text-gray-600 dark:text-gray-300'}`}>
            Dúvida
          </span>
        </button>

        <button
          onClick={() => handleSelect('guess')}
          className={`relative flex flex-col items-center justify-center p-3 rounded-xl transition-all shadow-sm ${
            selectedValue === 'guess'
              ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 transform scale-[1.02]'
              : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 opacity-70 hover:opacity-100'
          }`}
        >
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">+1 XP</div>
          <span className={`material-symbols-outlined mb-1 ${selectedValue === 'guess' ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`}>sports_soccer</span>
          <span className={`text-xs ${selectedValue === 'guess' ? 'font-bold text-blue-600 dark:text-blue-400' : 'font-medium text-gray-600 dark:text-gray-300'}`}>
            Chute
          </span>
        </button>
      </div>
    </div>
  );
};

export default ConfidenceSelector;
