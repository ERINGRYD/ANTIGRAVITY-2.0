
import React, { useState } from 'react';
import { Topic, Subject } from '../types';
import { useApp } from '../contexts/AppContext';
import AddQuestionView from './AddQuestionView';

interface TopicManagerViewProps {
  topic: Topic;
  subjectName?: string;
  subjectColor?: string;
  subjects?: Subject[];
  onBack: () => void;
  // Added onUpdateTopic to notify parent of changes to topic data (like subItems)
  onUpdateTopic?: (updates: Partial<Topic>) => void;
}

const TopicManagerView: React.FC<TopicManagerViewProps> = ({ 
  topic, 
  subjectName = "Matemática", 
  subjectColor = "#3B82F6", 
  subjects = [],
  onBack,
  onUpdateTopic 
}) => {
  const { isDarkMode } = useApp();
  const [subItems, setSubItems] = useState<string[]>(topic.subItems || []);
  const [newItem, setNewItem] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<'manager' | 'add_question'>('manager');

  // Find the subject ID based on the subject name if possible, or just pass empty string if not found
  const subjectId = subjects.find(s => s.name === subjectName)?.id;

  const handleAddSubItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      const updated = [...subItems, newItem.trim()];
      setSubItems(updated);
      // Notify parent of the updated subItems list
      onUpdateTopic?.({ subItems: updated });
      setNewItem('');
    }
  };

  const handleRemoveSubItem = (index: number) => {
    const updated = subItems.filter((_, i) => i !== index);
    setSubItems(updated);
    // Notify parent of the updated subItems list
    onUpdateTopic?.({ subItems: updated });
  };

  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
  };

  const onDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const updatedItems = [...subItems];
    const itemToMove = updatedItems.splice(draggedIndex, 1)[0];
    updatedItems.splice(index, 0, itemToMove);

    setSubItems(updatedItems);
    // Notify parent of the updated subItems list
    onUpdateTopic?.({ subItems: updatedItems });
    setDraggedIndex(null);
  };

  if (activeView === 'add_question') {
    return (
      <AddQuestionView 
        subjects={subjects}
        initialSubjectId={subjectId}
        initialTopicId={topic.id}
        onBack={() => setActiveView('manager')} 
        onSave={(data) => {
          console.log('Question Saved:', data);
          setActiveView('manager');
        }}
      />
    );
  }

  return (
    <div className="animate-in slide-in-from-right duration-300 min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col w-full pb-32">
      {/* Responsive Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="w-12 h-12 flex items-center justify-center -ml-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">arrow_back_ios_new</span>
            </button>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate">{topic.name}</h1>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">settings</span>
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8 w-full">
        {/* Sub-topics Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Subtópicos do Tópico</h2>
            <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-tighter">Arraste para reordenar</span>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden border border-slate-100 dark:border-slate-800">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {subItems.length > 0 ? (
                subItems.map((item, index) => (
                  <div 
                    key={`${item}-${index}`} 
                    draggable
                    onDragStart={(e) => onDragStart(e, index)}
                    onDragOver={(e) => onDragOver(e, index)}
                    onDrop={(e) => onDrop(e, index)}
                    className={`flex items-center gap-3 p-4 bg-white dark:bg-slate-900 group hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-default ${
                      draggedIndex === index ? 'opacity-40 grayscale' : 'opacity-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 cursor-grab active:cursor-grabbing select-none">
                      drag_indicator
                    </span>
                    <span className="flex-1 font-medium text-slate-700 dark:text-slate-300 select-none text-sm">
                      {item}
                    </span>
                    <button 
                      onClick={() => handleRemoveSubItem(index)}
                      className="text-rose-500 opacity-80 hover:opacity-100 p-1 transition-all hover:scale-110"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center">
                  <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Nenhum subtópico cadastrado ainda.</p>
                </div>
              )}
            </div>
            
            <div className="p-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-800">
              <form onSubmit={handleAddSubItem} className="relative flex items-center">
                <input 
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 border rounded-xl py-2.5 pl-4 pr-12 text-sm focus:ring-2 transition-all outline-none shadow-sm font-medium dark:text-white" 
                  style={{ '--tw-ring-color': subjectColor } as any}
                  placeholder="Novo subtópico..." 
                  type="text"
                />
                <button 
                  type="submit"
                  disabled={!newItem.trim()}
                  style={{ backgroundColor: subjectColor }}
                  className="absolute right-1.5 text-white w-8 h-8 rounded-lg flex items-center justify-center shadow-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-xl">add</span>
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Action Cards Grid - Responsive grid for tablet/desktop */}
        <div className="grid grid-cols-1 gap-6">
          {/* Linked Questions Section */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">Questões Vinculadas</h2>
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm p-6 border border-slate-100 dark:border-slate-800 text-center flex flex-col h-full justify-between">
              <div className="mb-6">
                <span className="text-5xl font-bold text-slate-800 dark:text-white tracking-tight">42</span>
                <p className="text-slate-400 dark:text-slate-500 text-xs font-medium mt-2">Questões cadastradas neste tópico</p>
              </div>
              <button 
                onClick={() => setActiveView('add_question')}
                style={{ 
                  background: `linear-gradient(135deg, ${subjectColor} 0%, ${subjectColor}CC 100%)`,
                  boxShadow: isDarkMode ? 'none' : `0 8px 20px ${subjectColor}4D`
                }}
                className="w-full text-white font-bold py-4 px-6 rounded-2xl hover:brightness-110 active:scale-[0.97] transition-all flex items-center justify-center gap-3 shadow-lg dark:shadow-none"
              >
                <span className="material-symbols-outlined text-[24px]">post_add</span>
                <span className="tracking-tight uppercase text-xs">Adicionar Nova Questão</span>
              </button>
            </div>
          </section>
        </div>

        {/* Info Box */}
        <div className="flex items-start gap-4 p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-100/50 dark:border-blue-800/30">
          <div 
            className="p-2.5 rounded-2xl shrink-0"
            style={{ backgroundColor: `${subjectColor}1A`, color: subjectColor }}
          >
            <span className="material-symbols-outlined text-2xl">psychology</span>
          </div>
          <p className="text-xs font-semibold leading-relaxed" style={{ color: subjectColor }}>
            Organizar o tópico em subtópicos menores ajuda o seu cérebro a mapear melhor a estrutura da matéria e facilita revisões rápidas.
          </p>
        </div>
      </main>
    </div>
  );
};

export default TopicManagerView;
