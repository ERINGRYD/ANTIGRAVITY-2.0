import React, { useState } from 'react';
import { Subject } from '../types';
import { useApp } from '../contexts/AppContext';

interface QuestionBankViewProps {
  subjects: Subject[];
  onBack: () => void;
  onAddQuestion: () => void;
  onManageTopic?: (topicId: string, subjectId: string) => void;
}

const QuestionBankView: React.FC<QuestionBankViewProps> = ({ subjects, onBack, onAddQuestion, onManageTopic }) => {
  const { questions } = useApp();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(subjects.length > 0 ? subjects[0].name : null);
  const [selectedFilters, setSelectedFilters] = useState<{
    subject: string[];
    difficulty: string[];
    status: string[];
  }>({
    subject: [],
    difficulty: [],
    status: []
  });

  const toggleFilter = (type: 'subject' | 'difficulty' | 'status', value: string) => {
    setSelectedFilters(prev => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  const getTopicQuestionCount = (topicId: string) => {
    return questions.filter(q => q.topic === topicId).length;
  };

  const filteredTopics = subjects.flatMap(subject => 
    subject.topics.map(topic => ({ ...topic, subjectName: subject.name, subjectId: subject.id, calculatedQuestions: getTopicQuestionCount(topic.id) }))
  ).filter(topic => {
    // Filter by selected subject (if any)
    if (selectedSubject && topic.subjectName !== selectedSubject) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return topic.name.toLowerCase().includes(query) || 
             topic.subjectName.toLowerCase().includes(query);
    }

    // Filter by active filters (subject)
    if (selectedFilters.subject.length > 0 && !selectedFilters.subject.includes(topic.subjectName)) {
      return false;
    }

    return true;
  });

  const currentSubject = subjects.find(s => s.name === selectedSubject);

  // Helper to get total questions for a subject
  const getSubjectQuestionCount = (subject: Subject) => {
    return subject.topics.reduce((acc, topic) => acc + getTopicQuestionCount(topic.id), 0);
  };

  // Helper to get total questions in the bank
  const totalQuestions = subjects.reduce((acc, subject) => acc + getSubjectQuestionCount(subject), 0);

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-[#F8FAFC] dark:bg-slate-950 pb-32 font-display animate-in slide-in-from-right duration-300">
      <header className="sticky top-0 z-40 bg-[#F8FAFC]/95 dark:bg-slate-950/95 backdrop-blur-md pt-4 px-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h1 className="text-xl font-bold text-[#0F172A] dark:text-white tracking-tight">Banco de Questões</h1>
            </div>
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isFilterOpen ? 'bg-[#1978e5] text-white shadow-lg shadow-blue-500/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-[#1978e5]'}`}
              >
                <span className="material-symbols-outlined">tune</span>
              </button>
              
              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
                  <div className="absolute right-0 top-12 z-50 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-4 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Filtrar por</h3>
                      <button onClick={() => setSelectedFilters({ subject: [], difficulty: [], status: [] })} className="text-[10px] font-bold text-[#1978e5] hover:underline">LIMPAR</button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Dificuldade</label>
                        <div className="flex flex-wrap gap-2">
                          {['Fácil', 'Médio', 'Difícil'].map(level => (
                            <button
                              key={level}
                              onClick={() => toggleFilter('difficulty', level)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                selectedFilters.difficulty.includes(level)
                                  ? 'bg-[#1978e5] text-white border-[#1978e5]'
                                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#1978e5]/50'
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Status</label>
                        <div className="flex flex-wrap gap-2">
                          {['Resolvidas', 'Pendentes', 'Erros'].map(status => (
                            <button
                              key={status}
                              onClick={() => toggleFilter('status', status)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                selectedFilters.status.includes(status)
                                  ? 'bg-[#1978e5] text-white border-[#1978e5]'
                                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#1978e5]/50'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Matéria</label>
                        <div className="flex flex-wrap gap-2">
                          {subjects.map(subject => (
                            <button
                              key={subject.name}
                              onClick={() => toggleFilter('subject', subject.name)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                selectedFilters.subject.includes(subject.name)
                                  ? 'bg-[#1978e5] text-white border-[#1978e5]'
                                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#1978e5]/50'
                              }`}
                            >
                              {subject.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => setIsFilterOpen(false)}
                      className="w-full mt-6 bg-[#1978e5] text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all text-xs uppercase tracking-wider"
                    >
                      Aplicar Filtros
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border-none shadow-sm rounded-2xl py-3 pl-10 pr-4 text-sm font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-[#1978e5] transition-all outline-none" 
              placeholder="Buscar matéria, tema ou código..." 
              type="text"
            />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6 w-full">
        <section className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-24 relative overflow-hidden">
            <div className="absolute right-0 top-0 p-2 opacity-10">
              <span className="material-symbols-outlined text-6xl text-[#1978e5]">folder_open</span>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#0F172A] dark:text-white">{totalQuestions}</span>
              <span className="text-xs font-medium text-slate-400">itens</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-24 relative overflow-hidden">
            <div className="absolute right-0 top-0 p-2 opacity-10">
              <span className="material-symbols-outlined text-6xl text-emerald-500">check_circle</span>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resolvidas</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">85%</span>
              <span className="text-xs font-medium text-emerald-600/60 dark:text-emerald-400/60">+2% hoje</span>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Matérias</h2>
            <button className="text-xs font-semibold text-[#1978e5]" onClick={() => setSelectedSubject(null)}>Ver todas</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {subjects.map((subject) => {
              const isSelected = selectedSubject === subject.name;
              const questionCount = getSubjectQuestionCount(subject);
              
              return (
                <div 
                  key={subject.name}
                  onClick={() => setSelectedSubject(subject.name)}
                  className={`group bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 border transition-all cursor-pointer relative overflow-hidden ${isSelected ? 'border-[#1978e5] ring-1 ring-[#1978e5]' : 'border-slate-100 dark:border-slate-800 hover:border-[#1978e5]/30 hover:shadow-md'}`}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors"
                    style={{ 
                      backgroundColor: isSelected ? subject.color : `${subject.color}20`,
                      color: isSelected ? '#fff' : subject.color 
                    }}
                  >
                    <span className="material-symbols-outlined">{subject.icon}</span>
                  </div>
                  <h3 className="font-bold text-[#0F172A] dark:text-white text-sm mb-1">{subject.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{questionCount} Questões</p>
                  {isSelected && <div className="absolute top-3 right-3 w-2 h-2 rounded-full" style={{ backgroundColor: subject.color }}></div>}
                </div>
              );
            })}
          </div>
        </section>

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500 text-lg">folder_open</span>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  {selectedSubject ? `Temas de ${selectedSubject}` : 'Todos os Temas'}
                </h3>
              </div>
              <button className="text-xs font-semibold text-[#1978e5]">Ver todos</button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTopics.length > 0 ? (
                filteredTopics.map((topic, index) => (
                  <div key={`${topic.subjectName}-${topic.name}-${index}`} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{topic.name}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{topic.calculatedQuestions || 0} Questões</span>
                    </div>
                    <button 
                      onClick={() => onManageTopic?.(topic.id, topic.subjectId)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#1978e5] hover:border-[#1978e5]/20 transition-all"
                    >
                      Gerenciar
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                  Nenhum tema encontrado.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <div className="fixed bottom-20 left-0 right-0 p-4 pointer-events-none z-30">
        <div className="max-w-5xl mx-auto pointer-events-auto">
          <button 
            onClick={onAddQuestion}
            className="w-full bg-[#1978e5] text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            ADICIONAR QUESTÃO
          </button>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-2 py-2 pb-8 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-end w-full">
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
        </div>
      </nav>
    </div>
  );
};

export default QuestionBankView;
