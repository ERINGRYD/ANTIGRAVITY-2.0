import React, { useState } from 'react';
import { Question } from '../types';
import { getStatusColors, getDifficultyColors } from '../utils/questionColors';

interface ManageQuestionsViewProps {
  topicId: string;
  topicName: string;
  subjectName: string;
  questions: Question[];
  onBack: () => void;
  onAddQuestion: () => void;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (id: string) => void;
}

const ManageQuestionsView: React.FC<ManageQuestionsViewProps> = ({ 
  topicId,
  topicName, 
  subjectName, 
  questions, 
  onBack, 
  onAddQuestion, 
  onEditQuestion,
  onDeleteQuestion 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<'TODOS' | 'FÁCIL' | 'MÉDIO' | 'DIFÍCIL'>('TODOS');
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setQuestionToDelete(id);
  };

  const confirmDelete = () => {
    if (questionToDelete) {
      onDeleteQuestion(questionToDelete);
      setQuestionToDelete(null);
    }
  };

  const cancelDelete = () => {
    setQuestionToDelete(null);
  };

  const filteredQuestions = questions.filter(q => {
    const matchesTopic = q.topic === topicId;
    const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'TODOS' || q.difficulty === filterDifficulty;
    return matchesTopic && matchesSearch && matchesDifficulty;
  });

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-[#F8FAFC] dark:bg-slate-950 pb-24 font-display animate-in slide-in-from-right duration-300">
      <header className="sticky top-0 z-40 bg-[#F8FAFC]/95 dark:bg-slate-950/95 backdrop-blur-md pt-4 px-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-md mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#0F172A] dark:text-white tracking-tight">{topicName}</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{subjectName} • 45 questões</p>
              </div>
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-[#1978e5] transition-colors">
              <span className="material-symbols-outlined">tune</span>
            </button>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </span>
            <input 
              className="w-full bg-white dark:bg-slate-900 border-none shadow-sm rounded-2xl py-3 pl-10 pr-4 text-sm font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-[#1978e5] transition-all outline-none" 
              placeholder="Buscar no tema..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 space-y-6">
        <section>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            <button 
              onClick={() => setFilterDifficulty('TODOS')}
              className={`flex-none px-4 py-2 rounded-full text-xs font-bold transition-colors ${filterDifficulty === 'TODOS' ? 'bg-[#1978e5] text-white shadow-sm shadow-blue-500/20' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setFilterDifficulty('FÁCIL')}
              className={`flex-none px-4 py-2 rounded-full text-xs font-semibold transition-colors ${filterDifficulty === 'FÁCIL' ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 border border-emerald-500' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-600'}`}
            >
              Fácil
            </button>
            <button 
              onClick={() => setFilterDifficulty('MÉDIO')}
              className={`flex-none px-4 py-2 rounded-full text-xs font-semibold transition-colors ${filterDifficulty === 'MÉDIO' ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20 border border-orange-500' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-orange-500 hover:text-orange-600'}`}
            >
              Médio
            </button>
            <button 
              onClick={() => setFilterDifficulty('DIFÍCIL')}
              className={`flex-none px-4 py-2 rounded-full text-xs font-semibold transition-colors ${filterDifficulty === 'DIFÍCIL' ? 'bg-red-500 text-white shadow-sm shadow-red-500/20 border border-red-500' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-red-500 hover:text-red-600'}`}
            >
              Difícil
            </button>
          </div>
        </section>

        <section className="space-y-4">
          {filteredQuestions.map((question, index) => {
            const diffColors = getDifficultyColors(question.difficulty);
            const statColors = getStatusColors(question.status);
            return (
            <div key={`${question.id}-${index}`} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${diffColors.bgColor} ${diffColors.color} border ${diffColors.borderColor}`}>
                    {question.difficulty}
                  </span>
                  <div className="flex items-center gap-1 text-slate-400">
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span className="text-[10px] font-semibold">{question.views}</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3 mb-4">
                  {question.text}
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide">{question.code}</span>
                  <span className={`px-2 py-1 rounded ${statColors.bgColor} ${statColors.color} border ${statColors.borderColor} text-[10px] font-bold uppercase tracking-wide flex items-center gap-1`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statColors.dotColor}`}></span> {question.status}
                  </span>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <button 
                  onClick={() => onEditQuestion(question)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#1978e5] hover:border-[#1978e5]/30 transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  Editar
                </button>
                <button 
                  onClick={() => handleDeleteClick(question.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  Excluir
                </button>
              </div>
            </div>
            );
          })}
          {filteredQuestions.length === 0 && (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400">
              <p className="text-sm font-medium">Nenhuma questão encontrada.</p>
            </div>
          )}
        </section>
      </main>

      {questionToDelete && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                <span className="material-symbols-outlined text-2xl">delete</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Excluir questão?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Esta ação não pode ser desfeita. A questão será removida permanentemente.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 shadow-sm shadow-red-500/20 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={onAddQuestion}
        className="fixed bottom-24 right-4 w-14 h-14 bg-[#1978e5] rounded-full shadow-lg shadow-blue-500/40 flex items-center justify-center text-white z-40 active:scale-90 transition-transform hover:bg-blue-600"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-2 py-2 pb-8 flex justify-between items-end z-50">
        <div className="flex-1 flex justify-center">
          <button className="flex flex-col items-center gap-1 py-1 text-slate-400 group">
            <span className="material-symbols-outlined text-[26px] group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">home</span>
            <span className="text-[10px] font-medium group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Início</span>
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          <button className="flex flex-col items-center gap-1 py-1 text-slate-400 group">
            <span className="material-symbols-outlined text-[26px] group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">donut_large</span>
            <span className="text-[10px] font-medium group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Ciclo</span>
          </button>
        </div>
        <div className="flex-1 flex justify-center relative">
          <div className="absolute -top-2 w-12 h-1 bg-[#1978e5] rounded-full"></div>
          <div className="flex flex-col items-center gap-1 -mt-4">
            <div className="bg-[#1978e5] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/40 border-4 border-white dark:border-slate-900 transition-transform active:scale-95">
              <span className="material-symbols-outlined text-2xl">swords</span>
            </div>
            <span className="text-[10px] font-bold text-[#1978e5]">Batalha</span>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <button className="flex flex-col items-center gap-1 py-1 text-slate-400 group">
            <span className="material-symbols-outlined text-[26px] group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">stadium</span>
            <span className="text-[10px] font-medium group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Coliseu</span>
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          <button className="flex flex-col items-center gap-1 py-1 text-slate-400 group">
            <span className="material-symbols-outlined text-[26px] group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">more_horiz</span>
            <span className="text-[10px] font-medium group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Mais</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default ManageQuestionsView;
