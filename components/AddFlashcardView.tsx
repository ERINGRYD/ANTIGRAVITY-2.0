
import React, { useState } from 'react';
import { Topic } from '../types';
import { useApp } from '../contexts/AppContext';

interface AddFlashcardViewProps {
  topic: Topic;
  subjectName: string;
  subjectColor?: string;
  onBack: () => void;
  onSave: (data: any) => void;
}

const AddFlashcardView: React.FC<AddFlashcardViewProps> = ({ topic, subjectName, subjectColor = "#3B82F6", onBack, onSave }) => {
  const { isDarkMode } = useApp();
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (frontText.trim() && backText.trim()) {
      onSave({
        topicId: topic.id,
        front: frontText,
        back: backText,
        tags: tags.split(' ').filter(t => t.startsWith('#')),
      });
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom duration-300 min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col w-full pb-44">
      {/* Responsive Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3 w-full">
          <button 
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center -ml-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">arrow_back_ios_new</span>
          </button>
          <div className="flex flex-col min-w-0">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Novo Flashcard</h1>
            <span className="text-xs font-bold uppercase tracking-wide truncate" style={{ color: subjectColor }}>
              {topic.name} • {subjectName}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 w-full">
        {/* Front Section */}
        <section className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">FRENTE (Pergunta)</label>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 focus-within:ring-2 transition-all" style={{ '--tw-ring-color': `${subjectColor}40` } as any}>
            <textarea 
              value={frontText}
              onChange={(e) => setFrontText(e.target.value)}
              className="w-full min-h-[160px] border-none focus:ring-0 p-0 text-slate-700 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-none bg-transparent text-lg font-medium leading-relaxed outline-none" 
              placeholder="Digite a pergunta ou conceito..."
            ></textarea>
          </div>
        </section>

        {/* Back Section */}
        <section className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">VERSO (Resposta)</label>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 focus-within:ring-2 transition-all" style={{ '--tw-ring-color': `${subjectColor}40` } as any}>
            <textarea 
              value={backText}
              onChange={(e) => setBackText(e.target.value)}
              className="w-full min-h-[160px] border-none focus:ring-0 p-0 text-slate-700 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-none bg-transparent text-lg font-medium leading-relaxed outline-none" 
              placeholder="Digite a resposta ou explicação..."
            ></textarea>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98]">
            <span className="material-symbols-outlined text-xl">image</span>
            Adicionar Imagem
          </button>
          <button className="flex items-center justify-center gap-2 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98]">
            <span className="material-symbols-outlined text-xl">mic</span>
            Gravar Áudio
          </button>
        </section>

        {/* Tags Section */}
        <section className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Tags</label>
          <div className="relative flex items-center">
            <span className="absolute left-4 material-symbols-outlined text-slate-400 dark:text-slate-500 text-xl">tag</span>
            <input 
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold focus:ring-2 focus:border-transparent outline-none transition-all shadow-sm dark:text-white" 
              style={{ '--tw-ring-color': subjectColor } as any}
              placeholder="ex: #fórmulas #distância" 
              type="text"
            />
          </div>
        </section>
      </main>

      {/* Sticky Bottom Button */}
      <div className="fixed bottom-24 left-0 right-0 px-4 z-30 pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <button 
            onClick={handleSubmit}
            disabled={!frontText.trim() || !backText.trim()}
            style={{ 
              background: `linear-gradient(135deg, ${subjectColor}CC, ${subjectColor})`,
              boxShadow: isDarkMode ? 'none' : `0 8px 25px ${subjectColor}4D`
            }}
            className="w-full text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm tracking-widest shadow-lg dark:shadow-none"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Criar Flashcard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFlashcardView;
