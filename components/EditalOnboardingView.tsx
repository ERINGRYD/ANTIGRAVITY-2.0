import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

interface EditalOnboardingViewProps {
  onComplete: () => void;
  onBack?: () => void;
}

const EditalOnboardingView: React.FC<EditalOnboardingViewProps> = ({ onComplete, onBack }) => {
  const { subjects } = useApp();
  const [weights, setWeights] = useState<Record<string, number>>({});

  useEffect(() => {
    const saved = localStorage.getItem('user_edital_weights');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure all current subjects have a weight
        const merged = { ...parsed };
        subjects.forEach(s => {
          if (merged[s.id] === undefined) {
            merged[s.id] = 1;
          }
        });
        setWeights(merged);
      } catch (e) {
        initializeWeights();
      }
    } else {
      initializeWeights();
    }
  }, [subjects]);

  const initializeWeights = () => {
    const initial: Record<string, number> = {};
    subjects.forEach(s => {
      initial[s.id] = 1;
    });
    setWeights(initial);
  };

  const handleWeightChange = (id: string, value: number) => {
    setWeights(prev => ({ ...prev, [id]: Math.max(0, value) }));
  };

  const handleSave = () => {
    localStorage.setItem('user_edital_weights', JSON.stringify(weights));
    localStorage.setItem('has_completed_onboarding', 'true');
    onComplete();
  };

  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0) || 1;

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB] dark:bg-[#0B1120] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="p-4 md:p-6 lg:p-8 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 bg-white dark:bg-slate-900/50 sticky top-0 z-20 backdrop-blur-sm">
        {onBack && (
          <button 
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-500 dark:text-gray-400"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-500">assignment</span>
            Perfil do Edital
          </h1>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">
            Configure o peso das matérias
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 lg:p-8 overflow-y-auto flex-1 max-w-3xl mx-auto w-full">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-3xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-800/50 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <span className="material-symbols-outlined">tune</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-indigo-900 dark:text-indigo-300">Personalize seu Simulado</h2>
              <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-2 leading-relaxed">
                Defina o peso (importância) de cada matéria no seu concurso. O Coliseu usará esses dados no modo <strong>"Estilo Prova"</strong> para sortear a quantidade exata de questões de cada disciplina, simulando a sua prova real.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Matérias do Edital</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {subjects.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Nenhuma matéria cadastrada ainda.
              </div>
            ) : (
              subjects.map(subject => {
                const weight = weights[subject.id] || 0;
                const percentage = Math.round((weight / totalWeight) * 100) || 0;
                
                return (
                  <div key={subject.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: subject.color }}
                        />
                        <h4 className="font-bold text-gray-900 dark:text-white">{subject.name}</h4>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                        Representa <strong className="text-indigo-600 dark:text-indigo-400">{percentage}%</strong> da prova
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 sm:w-1/2">
                      <span className="text-xs font-bold text-gray-400 w-8 text-right">0</span>
                      <input 
                        type="range" 
                        min="0" 
                        max="10" 
                        step="1"
                        value={weight}
                        onChange={(e) => handleWeightChange(subject.id, parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <span className="text-xs font-bold text-gray-400 w-8">10</span>
                      
                      <div className="w-12 h-10 bg-gray-100 dark:bg-slate-900 rounded-xl flex items-center justify-center font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
                        {weight}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleSave}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined">check_circle</span>
            Salvar e Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditalOnboardingView;
