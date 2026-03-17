
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Subject, Topic } from '../types';
import { useApp } from '../contexts/AppContext';

interface SubjectTopicSelectorProps {
  onBack: () => void;
  selectedSubjectIds: string[];
  selectedTopicIds: string[];
  onToggleSubject: (subjectId: string) => void;
  onToggleTopic: (topicId: string) => void;
}

const SubjectTopicSelector: React.FC<SubjectTopicSelectorProps> = ({
  onBack,
  selectedSubjectIds,
  selectedTopicIds,
  onToggleSubject,
  onToggleTopic
}) => {
  const { subjects } = useApp();
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);

  const isSubjectSelected = (id: string) => selectedSubjectIds.includes(id);
  const isTopicSelected = (id: string) => selectedTopicIds.includes(id);

  const toggleExpand = (id: string) => {
    setExpandedSubjectId(expandedSubjectId === id ? null : id);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-5 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:bg-white transition-all"
        >
          <span className="material-icons-round text-xl">arrow_back</span>
        </button>
        <div>
          <h1 className="text-lg font-bold leading-tight text-slate-900">Selecionar Conteúdo</h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em]">Personalize sua Batalha</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 no-scrollbar">
        {subjects.map((subject) => (
          <div key={subject.id} className="flex flex-col gap-2">
            <div 
              className={`p-4 rounded-[2rem] border-2 transition-all flex items-center justify-between cursor-pointer ${
                isSubjectSelected(subject.id) 
                  ? 'border-blue-500 bg-blue-50/30' 
                  : 'border-slate-50 bg-white hover:border-slate-100'
              }`}
              onClick={() => toggleExpand(subject.id)}
            >
              <div className="flex items-center gap-4 flex-1">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: subject.color }}
                >
                  <span className="material-icons-round text-xl">{subject.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-800 truncate">{subject.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    {subject.topics.length} Temas • {subject.studiedMinutes}/{subject.totalMinutes} min
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSubject(subject.id);
                  }}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSubjectSelected(subject.id) ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-200'
                  }`}
                >
                  {isSubjectSelected(subject.id) && <span className="material-icons-round text-xs">check</span>}
                </button>
                <span className={`material-icons-round text-slate-400 transition-transform ${expandedSubjectId === subject.id ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </div>
            </div>

            {expandedSubjectId === subject.id && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="ml-6 flex flex-col gap-2 overflow-hidden"
              >
                {subject.topics.map((topic) => (
                  <div 
                    key={topic.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isTopicSelected(topic.id) 
                        ? 'border-blue-200 bg-blue-50/50' 
                        : 'border-slate-50 bg-white hover:border-slate-100'
                    }`}
                    onClick={() => onToggleTopic(topic.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                        <span className="material-icons-round text-lg">{topic.icon}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-700">{topic.name}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      isTopicSelected(topic.id) ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-200'
                    }`}>
                      {isTopicSelected(topic.id) && <span className="material-icons-round text-[10px]">check</span>}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        ))}
      </main>

      <footer className="p-6 bg-white border-t border-slate-50">
        <button 
          onClick={onBack}
          className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
        >
          CONFIRMAR SELEÇÃO
        </button>
      </footer>
    </div>
  );
};

export default SubjectTopicSelector;
