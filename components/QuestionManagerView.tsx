import React, { useState } from 'react';
import { Subject, Topic } from '../types';

interface QuestionManagerViewProps {
  subjects: Subject[];
  onBack: () => void;
}

const QuestionManagerView: React.FC<QuestionManagerViewProps> = ({ subjects, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | 'all'>('all');

  // Mock data for demonstration
  const [questions, setQuestions] = useState([
    { id: '1', text: 'Qual é a capital do Brasil?', subjectId: subjects[0]?.id, topicId: subjects[0]?.topics[0]?.id, type: 'multipla' },
    { id: '2', text: 'A mitocôndria é a casa de força da célula.', subjectId: subjects[0]?.id, topicId: subjects[0]?.topics[0]?.id, type: 'certo_errado' },
  ]);

  const handleDelete = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom duration-300 overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="w-12 h-12 flex items-center justify-center -ml-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
            >
              <span className="material-icons-round text-slate-600 dark:text-slate-400">close</span>
            </button>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Banco de Questões</h1>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Gerenciamento</p>
            </div>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2">
            <span className="material-icons-round text-sm">add</span>
            <span className="hidden sm:inline">Nova Questão</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input 
                type="text" 
                placeholder="Buscar questões..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <select 
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
            >
              <option value="all">Todas as Matérias</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {questions.map((q, index) => (
              <div key={`${q.id}-${index}`} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:shadow-md transition-all">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      {q.type === 'multipla' ? 'Múltipla Escolha' : 'Certo/Errado'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                    {q.text}
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-4 sm:pt-0 mt-2 sm:mt-0">
                  <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-colors">
                    <span className="material-icons-round text-xl">edit</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(q.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <span className="material-icons-round text-xl">delete</span>
                  </button>
                </div>
              </div>
            ))}
            
            {questions.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons-round text-3xl text-slate-400">inventory_2</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Nenhuma questão encontrada</h3>
                <p className="text-sm text-slate-500">Tente ajustar os filtros ou adicione uma nova questão.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default QuestionManagerView;
