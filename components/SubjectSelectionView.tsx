
import React, { useState, useMemo } from 'react';
import { Subject, Tab } from '../types';
import BottomNav from './BottomNav';
import { useApp } from '../contexts/AppContext';

interface SubjectSelectionViewProps {
  subjects: Subject[];
  onBack: () => void;
  onStartRevision: (selectedIds: string[]) => void;
  mode?: 'triagem' | 'defesa' | 'revisao';
}

const SubjectSelectionView: React.FC<SubjectSelectionViewProps> = ({ subjects, onBack, onStartRevision, mode = 'revisao' }) => {
  const { isDarkMode } = useApp();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [subjects, searchQuery]);

  const toggleSubject = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === subjects.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(subjects.map(s => s.id));
    }
  };

  const totalQuestionsEstimate = useMemo(() => {
    return subjects
      .filter(s => selectedIds.includes(s.id))
      .reduce((acc, s) => acc + s.topics.reduce((tAcc, t) => tAcc + t.totalQuestions, 0), 0);
  }, [subjects, selectedIds]);

  const getButtonLabel = () => {
    switch (mode) {
      case 'triagem': return 'Iniciar Triagem';
      case 'defesa': return 'Iniciar Defesa';
      default: return 'Iniciar Revisão';
    }
  };

  return (
    <div className="fixed inset-0 z-[210] bg-[#F8FAFC] dark:bg-slate-950 flex flex-col animate-in slide-in-from-right duration-500 overflow-y-auto no-scrollbar pb-48">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4 shrink-0">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-12 h-12 -ml-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
          >
            <span className="material-icons-round text-slate-900 dark:text-white">chevron_left</span>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">Revisão de Elite</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Selecione as frentes de combate</p>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm shrink-0">
            <img alt="User Avatar" className="w-full h-full object-cover" src="/default-avatar.svg"/>
          </div>
        </div>
      </header>

      <main className="px-4 py-5 max-w-md mx-auto w-full flex-1">
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xl">search</span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm text-slate-900 dark:text-white" 
              placeholder="Buscar matérias..." 
              type="text"
            />
          </div>
          <button 
            onClick={handleSelectAll}
            className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap tracking-wider shadow-sm"
          >
            {selectedIds.length === subjects.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filteredSubjects.map((subject) => {
            const isSelected = selectedIds.includes(subject.id);
            const totalQ = subject.topics.reduce((acc, t) => acc + t.totalQuestions, 0);
            
            return (
              <div 
                key={subject.id}
                onClick={() => toggleSubject(subject.id)}
                className={`relative bg-white dark:bg-slate-900 rounded-3xl border-2 p-4 flex flex-col items-center text-center gap-2 cursor-pointer transition-all duration-300 active:scale-95 ${
                  isSelected ? 'border-blue-500 shadow-[0_0_15px_-3px_rgba(59,130,246,0.4)]' : 'border-slate-100 dark:border-slate-800'
                }`}
              >
                <div className="absolute top-2.5 right-2.5">
                  <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                    isSelected ? 'bg-blue-500 border-blue-500 text-white shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                  }`}>
                    {isSelected && <span className="material-icons-round text-[12px] font-black">check</span>}
                  </div>
                </div>
                
                <div 
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-1 transition-transform ${isSelected ? 'scale-110' : ''}`}
                  style={{ backgroundColor: `${subject.color}${isDarkMode ? '30' : '15'}`, color: subject.color }}
                >
                  <span className="material-symbols-outlined text-3xl font-variation-fill-1">{subject.icon}</span>
                </div>
                
                <div className="min-h-[40px] flex items-center justify-center">
                  <h3 className="text-sm font-black text-slate-800 dark:text-white leading-tight">{subject.name}</h3>
                </div>
                
                <div className="w-full pt-2 border-t border-slate-100 dark:border-slate-800 mt-1">
                  <div className="flex justify-between text-[10px] mb-1.5">
                    <span className="text-slate-400 dark:text-slate-500 uppercase font-black tracking-tighter">Nível</span>
                    <span className="text-blue-500 dark:text-blue-400 font-black">NV. {Math.floor(Math.random() * 20) + 1}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400 dark:text-slate-500 uppercase font-black tracking-tighter">Questões</span>
                    <span className="text-slate-800 dark:text-slate-300 font-black">{totalQ}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Action Panel */}
      <div className="fixed bottom-[84px] left-0 right-0 px-4 pb-4 pt-6 bg-gradient-to-t from-[#F8FAFC] dark:from-slate-950 via-[#F8FAFC] dark:via-slate-950 to-transparent z-40 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 p-5 shadow-2xl flex flex-col gap-5 animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-center px-1">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Matérias selecionadas</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{selectedIds.length}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">de {subjects.length} disponíveis</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Estimativa</span>
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="material-icons-round text-base text-blue-500 dark:text-blue-400">quiz</span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-200">~{totalQuestionsEstimate} questões</span>
                </div>
              </div>
            </div>
            
            <button 
              disabled={selectedIds.length === 0}
              onClick={() => onStartRevision(selectedIds)}
              className="w-full py-5 rounded-2xl text-white font-black text-sm tracking-[0.2em] uppercase shadow-lg shadow-blue-500/30 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed bg-gradient-to-br from-blue-500 to-blue-700"
            >
              <span>{getButtonLabel()}</span>
              <span className="material-icons-round text-xl">bolt</span>
            </button>
          </div>
        </div>
      </div>

      <BottomNav activeTab={Tab.BATALHA} setActiveTab={() => {}} />
    </div>
  );
};

export default SubjectSelectionView;
