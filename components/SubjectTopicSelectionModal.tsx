import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Subject } from '../types';

interface SubjectTopicSelectionModalProps {
  onClose: () => void;
  subjects: Subject[];
}

const SubjectTopicSelectionModal: React.FC<SubjectTopicSelectionModalProps> = ({ onClose, subjects }) => {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId]
    );
  };

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Selecionar Matérias e Temas</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <span className="material-icons-round">close</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {subjects.map(subject => (
            <div key={subject.id} className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selectedSubjects.includes(subject.id)}
                  onChange={() => toggleSubject(subject.id)}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-bold text-slate-800">{subject.name}</span>
              </label>
              
              {selectedSubjects.includes(subject.id) && (
                <div className="ml-8 space-y-1">
                  {subject.topics.map(topic => (
                    <label key={topic.id} className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedTopics.includes(topic.id)}
                        onChange={() => toggleTopic(topic.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-400"
                      />
                      <span className="text-sm text-slate-600">{topic.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </main>

        <footer className="p-6 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="w-full bg-blue-600 text-white font-black py-4 rounded-[1.5rem] hover:bg-blue-700 transition-all"
          >
            CONFIRMAR
          </button>
        </footer>
      </motion.div>
    </motion.div>
  );
};

export default SubjectTopicSelectionModal;
