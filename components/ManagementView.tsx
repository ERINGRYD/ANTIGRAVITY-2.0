
import React, { useState } from 'react';
import { Subject, Topic } from '../types';

interface ManagementViewProps {
  subjects: Subject[];
  onBack: () => void;
  onUpdate: (updatedSubjects: Subject[]) => void;
}

const COLORS = [
  { name: 'blue', value: '#3B82F6' },
  { name: 'green', value: '#10B981' },
  { name: 'orange', value: '#F59E0B' },
  { name: 'purple', value: '#8B5CF6' },
  { name: 'pink', value: '#EC4899' },
  { name: 'cyan', value: '#06B6D4' },
  { name: 'red', value: '#EF4444' },
  { name: 'indigo', value: '#6366F1' },
];

const ICONS = [
  'menu_book', 'functions', 'history_edu', 'public', 'bolt', 'science', 'language', 'palette', 'fitness_center', 'psychology', 'biotech', 'calculate', 'translate', 'draw'
];

const ManagementView: React.FC<ManagementViewProps> = ({ subjects, onBack, onUpdate }) => {
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [localSubjects, setLocalSubjects] = useState<Subject[]>(subjects);
  const [isPickingAppearance, setIsPickingAppearance] = useState(false);
  
  // Drag and Drop Subjects
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };
  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newSubjects = [...localSubjects];
      const [removed] = newSubjects.splice(draggedIndex, 1);
      newSubjects.splice(dragOverIndex, 0, removed);
      setLocalSubjects(newSubjects);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const editingSubject = localSubjects.find(s => s.id === editingSubjectId);

  const handleSave = () => {
    onUpdate(localSubjects);
    onBack();
  };

  const updateSubjectField = (id: string, field: keyof Subject, value: any) => {
    setLocalSubjects(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const updateTopicField = (subjectId: string, topicId: string, field: keyof Topic, value: any) => {
    setLocalSubjects(prev => prev.map(s => {
      if (s.id !== subjectId) return s;
      return {
        ...s,
        topics: s.topics.map(t => t.id === topicId ? { ...t, [field]: value } : t)
      };
    }));
  };

  const handleRemoveSubject = (id: string) => {
    // Removed window.confirm to avoid blocking issues in iframe environment.
    // Changes are local until "Salvar Tudo" is clicked.
    if (editingSubjectId === id) {
      setEditingSubjectId(null);
    }
    setLocalSubjects(prev => prev.filter(s => s.id !== id));
  };

  const handleAddNewSubject = () => {
    const newId = `subject-${crypto.randomUUID()}`;
    const newSubject: Subject = {
      id: newId,
      name: 'Nova Matéria',
      shortName: 'NEW',
      color: '#3B82F6',
      icon: 'menu_book',
      studiedMinutes: 0,
      totalMinutes: 600,
      topics: []
    };
    setLocalSubjects(prev => [...prev, newSubject]);
    setEditingSubjectId(newId);
  };

  const handleAddTopic = (subjectId: string) => {
    const newTopic: Topic = {
      id: `topic-${crypto.randomUUID()}`,
      name: 'Novo Tópico',
      isCompleted: false,
      icon: 'star',
      studiedMinutes: 0,
      totalMinutes: 60,
      totalQuestions: 10,
      completedQuestions: 0
    };
    setLocalSubjects(prev => prev.map(s => 
      s.id === subjectId ? { ...s, topics: [...s.topics, newTopic] } : s
    ));
  };

  const handleRemoveTopic = (subjectId: string, topicId: string) => {
    setLocalSubjects(prev => prev.map(s => 
      s.id === subjectId ? { ...s, topics: s.topics.filter(t => t.id !== topicId) } : s
    ));
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 dark:bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto no-scrollbar pb-32 transition-colors duration-300">
      {/* Overlay de Seleção de Ícone e Cor */}
      {isPickingAppearance && editingSubject && (
        <div className="fixed inset-0 z-[250] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-in zoom-in duration-300 transition-colors duration-300">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="material-icons-round text-blue-500">palette</span>
              Aparência
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Cor</label>
                <div className="grid grid-cols-5 gap-3">
                  {COLORS.map((color) => (
                    <button 
                      key={color.name}
                      onClick={() => updateSubjectField(editingSubject.id, 'color', color.value)}
                      className={`w-10 h-10 rounded-full transition-all relative border-2 ${editingSubject.color === color.value ? 'border-blue-500 scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: color.value }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Ícone</label>
                <div className="grid grid-cols-5 gap-3 max-h-[160px] overflow-y-auto p-1 no-scrollbar">
                  {ICONS.map((icon) => (
                    <button 
                      key={icon}
                      onClick={() => updateSubjectField(editingSubject.id, 'icon', icon)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2 ${editingSubject.icon === icon ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-500' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      <span className="material-icons-round text-xl">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setIsPickingAppearance(false)}
                className="w-full bg-slate-900 dark:bg-slate-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all mt-4"
              >
                Pronto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-5 py-4 shrink-0 transition-colors duration-300">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-12 h-12 flex items-center justify-center -ml-3 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95">
              <span className="material-icons-round text-2xl">arrow_back</span>
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Gerenciamento</h1>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Ajuste de Ciclos e Metas</p>
            </div>
          </div>
          <button 
            onClick={handleSave}
            className="bg-blue-500 text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            Salvar Tudo
          </button>
        </div>
      </header>

      <main className="px-5 py-8 max-w-4xl mx-auto w-full space-y-8">
        {!editingSubjectId ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Matérias Ativas</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {localSubjects.map((subject, index) => (
                <div 
                  key={subject.id} 
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnd={handleDragEnd}
                  className={`bg-white dark:bg-slate-800 rounded-3xl p-5 border shadow-sm flex items-center justify-between group hover:shadow-md transition-all ${
                    draggedIndex === index ? 'opacity-30 scale-95 grayscale' : 'opacity-100'
                  } ${dragOverIndex === index ? 'border-blue-500 border-2' : 'border-slate-100 dark:border-slate-700'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-slate-200 dark:text-slate-700 cursor-grab active:cursor-grabbing">
                      <span className="material-icons-round">drag_indicator</span>
                    </div>
                    <button 
                      onClick={() => { setEditingSubjectId(subject.id); setIsPickingAppearance(true); }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm hover:scale-110 active:scale-95 transition-all"
                      style={{ backgroundColor: subject.color }}
                    >
                      <span className="material-icons-round text-2xl">{subject.icon}</span>
                    </button>
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white leading-none mb-1">{subject.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">
                        Meta: {Math.floor(subject.totalMinutes / 60)}h • {subject.topics.length} tópicos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setEditingSubjectId(subject.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-500 transition-all"
                    >
                      <span className="material-icons-round text-xl">edit</span>
                    </button>
                    <button 
                      onClick={() => handleRemoveSubject(subject.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all"
                    >
                      <span className="material-icons-round text-xl">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={handleAddNewSubject}
              className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 dark:text-slate-600 font-bold text-xs uppercase tracking-widest hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-icons-round text-lg">add</span>
              Adicionar Matéria
            </button>
          </section>
        ) : (
          <div className="animate-in fade-in slide-in-from-right duration-300 space-y-8 pb-32">
            {/* Subject Editor */}
            <section className="bg-white dark:bg-slate-800 rounded-[40px] p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-8 transition-colors duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsPickingAppearance(true)}
                    className="w-14 h-14 rounded-[20px] flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all group relative"
                    style={{ backgroundColor: editingSubject?.color }}
                    title="Mudar Ícone e Cor"
                  >
                    <span className="material-icons-round text-3xl">{editingSubject?.icon}</span>
                    <div className="absolute inset-0 bg-black/10 rounded-[20px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="material-icons-round text-sm text-white">edit</span>
                    </div>
                  </button>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Editar {editingSubject?.name}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      handleRemoveSubject(editingSubject!.id);
                      setEditingSubjectId(null);
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
                    title="Excluir Matéria"
                  >
                    <span className="material-icons-round text-xl">delete</span>
                  </button>
                  <button 
                    onClick={() => setEditingSubjectId(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all"
                  >
                    Concluído
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2 col-span-1 md:col-span-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nome da Matéria</label>
                  <input 
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-blue-500 rounded-2xl px-5 py-4 focus:ring-0 transition-all text-slate-900 dark:text-white font-bold outline-none" 
                    value={editingSubject?.name}
                    onChange={(e) => updateSubjectField(editingSubject!.id, 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Abreviação (3 letras)</label>
                  <input 
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-blue-500 rounded-2xl px-5 py-4 focus:ring-0 transition-all text-slate-900 dark:text-white font-bold outline-none uppercase" 
                    maxLength={3}
                    placeholder="Ex: MAT"
                    value={editingSubject?.shortName}
                    onChange={(e) => updateSubjectField(editingSubject!.id, 'shortName', e.target.value.toUpperCase())}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Meta de Estudo (Minutos)</label>
                  <input 
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-blue-500 rounded-2xl px-5 py-4 focus:ring-0 transition-all text-slate-900 dark:text-white font-bold outline-none" 
                    type="number"
                    value={editingSubject?.totalMinutes}
                    onChange={(e) => updateSubjectField(editingSubject!.id, 'totalMinutes', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Topics Management */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tópicos e Tempos</h3>
                </div>
                <div className="flex flex-col gap-3">
                  {editingSubject?.topics.map(topic => (
                    <div key={topic.id} className="bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center gap-4 transition-colors duration-300">
                      <div className="flex-1 min-w-0">
                        <input 
                          className="bg-transparent border-none p-0 text-sm font-bold text-slate-900 dark:text-white focus:ring-0 w-full mb-1"
                          value={topic.name}
                          onChange={(e) => updateTopicField(editingSubject.id, topic.id, 'name', e.target.value)}
                        />
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">Tópico de Estudo</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <label className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter mb-1">Meta Questões</label>
                          <input 
                            className="w-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                            type="number"
                            value={topic.totalQuestions}
                            onChange={(e) => updateTopicField(editingSubject.id, topic.id, 'totalQuestions', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter mb-1">Meta de Estudo (Min)</label>
                          <input 
                            className="w-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                            type="number"
                            value={topic.totalMinutes}
                            onChange={(e) => updateTopicField(editingSubject.id, topic.id, 'totalMinutes', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <button 
                          onClick={() => handleRemoveTopic(editingSubject.id, topic.id)}
                          className="text-slate-300 dark:text-slate-700 hover:text-red-500 transition-colors p-1"
                        >
                          <span className="material-icons-round text-lg">remove_circle_outline</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => handleAddTopic(editingSubject!.id)}
                    className="w-full py-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-600 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-icons-round text-sm">add</span>
                    Novo Tópico
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManagementView;
