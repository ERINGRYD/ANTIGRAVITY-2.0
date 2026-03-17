import React, { useState } from 'react';
import { Subject } from '../types';
import { useApp } from '../contexts/AppContext';

interface SubjectSelectorOverlayProps {
  subjects: Subject[];
  currentSubjectId?: string;
  onSelectSubject: (subjectId: string, topicIndex: number) => void;
  onClose: () => void;
  isRequired?: boolean; // Se true, não permite fechar sem selecionar
}

const SubjectSelectorOverlay: React.FC<SubjectSelectorOverlayProps> = ({
  subjects,
  currentSubjectId,
  onSelectSubject,
  onClose,
  isRequired = false
}) => {
  const { isDarkMode } = useApp();
  const [selectedSubjectId, setSelectedSubjectId] = useState(currentSubjectId || subjects[0]?.id || '');
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  const handleConfirm = () => {
    if (selectedSubject) {
      onSelectSubject(selectedSubjectId, selectedTopicIndex);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500">
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black">
                {isRequired ? '🎯 Selecione uma Matéria' : 'Trocar Matéria'}
              </h2>
              <p className="text-sm text-blue-100 mt-1">
                {isRequired 
                  ? 'Escolha a matéria e tópico para iniciar o foco' 
                  : 'Selecione uma matéria e tópico para focar'}
              </p>
            </div>
            {!isRequired && (
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-all active:scale-95"
              >
                <span className="material-icons-round">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)] no-scrollbar">
          
          {/* Lista de Matérias */}
          <div className="space-y-3 mb-6">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="material-icons-round text-sm">library_books</span>
              Escolha a Matéria
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subjects.map((subject) => {
                const isSelected = subject.id === selectedSubjectId;
                const completedTopics = subject.topics.filter(t => t.isCompleted).length;
                const progress = subject.topics.length > 0 
                  ? (completedTopics / subject.topics.length) * 100 
                  : 0;
                
                return (
                  <button
                    key={subject.id}
                    onClick={() => {
                      setSelectedSubjectId(subject.id);
                      setSelectedTopicIndex(0); // Reset para primeiro tópico
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-[1.02]' 
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110"
                        style={{ 
                          backgroundColor: isDarkMode ? `${subject.color}30` : `${subject.color}20`, 
                          color: subject.color,
                          border: isSelected ? `2px solid ${subject.color}` : 'none'
                        }}
                      >
                        <span className="material-icons-round text-2xl">{subject.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold text-sm truncate mb-1 ${
                          isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'
                        }`}>
                          {subject.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="material-icons-round text-sm">topic</span>
                          <span>{subject.topics.length} tópicos</span>
                        </div>
                        
                        {/* Barra de Progresso */}
                        <div className="mt-2 bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                          {completedTopics}/{subject.topics.length} concluídos • {Math.round(progress)}%
                        </p>
                      </div>
                      {isSelected && (
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 shrink-0 animate-in zoom-in duration-200">
                          <span className="material-icons-round text-white text-sm">check</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lista de Tópicos da Matéria Selecionada */}
          {selectedSubject && selectedSubject.topics.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="material-icons-round text-sm">checklist</span>
                Escolha o Tópico de {selectedSubject.name}
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                {selectedSubject.topics.map((topic, index) => {
                  const isSelectedTopic = index === selectedTopicIndex;
                  
                  return (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopicIndex(index)}
                      className={`w-full p-3 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
                        isSelectedTopic
                          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-sm scale-[1.01]'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelectedTopic 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className={`text-sm font-semibold truncate ${
                          isSelectedTopic ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'
                        }`}>
                          {topic.name}
                        </p>
                        {topic.isCompleted && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                            <span className="material-icons-round text-xs">check_circle</span>
                            Concluído
                          </p>
                        )}
                      </div>
                      {isSelectedTopic && (
                        <span className="material-icons-round text-blue-500 dark:text-blue-400 animate-pulse">
                          radio_button_checked
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer com botões */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex gap-3">
          {!isRequired && (
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={!selectedSubject}
            className={`${isRequired ? 'w-full' : 'flex-1'} px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRequired ? 'Começar a Estudar' : 'Confirmar Mudança'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubjectSelectorOverlay;