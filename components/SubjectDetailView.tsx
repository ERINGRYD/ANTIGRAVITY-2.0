import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Subject, Topic, Theme, isSubjectCompleted } from '../types';
import { useApp } from '../contexts/AppContext';
import ThemeCreationForm from './ThemeCreationForm';
import StarRating from './StarRating';
import { sortThemesByPriority } from '../utils/themePriority';

interface SubjectDetailViewProps {
  subject: Subject;
  onBack: () => void;
  onEditSubject: () => void;
  onAddTopic: () => void;
  onDeleteTopic: (topicId: string) => void;
  onTopicClick: (topic: Topic, index: number) => void;
  onUpdateTopics: (subjectId: string, newTopics: Topic[]) => void;
  onThemeCreated?: (theme: Theme) => void; // Optional for now until fully integrated
}

// ✨ COMPONENTE DE CARD DE TÓPICO ARRASTÁVEL ATUALIZADO (Master v1.5)
const DraggableTopicCard: React.FC<{
  topic: Topic;
  index: number;
  subjectColor: string;
  isDarkMode: boolean;
  onTopicClick: (topic: Topic, index: number) => void;
  onToggleComplete: (topicId: string) => void;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
  onPriorityChange: (topicId: string, priority: 1|2|3|4|5) => void;
  isDragging: boolean;
  isDropTarget: boolean;
  isEditMode?: boolean;
}> = ({
  topic,
  index,
  subjectColor,
  isDarkMode,
  onTopicClick,
  onToggleComplete,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onPriorityChange,
  isDragging,
  isDropTarget,
  isEditMode = false,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const progress = (topic.totalMinutes || 0) > 0
    ? ((topic.studiedMinutes || 0) / (topic.totalMinutes || 0)) * 100
    : 0;

  const formatTime = (minutes: number) => {
    const mins = minutes || 0;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}H ${m.toString().padStart(2, '0')}M`;
  };

  return (
    <div
      draggable={isEditMode}
      onDragStart={(e) => {
        if (!isEditMode) return;
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(index);
      }}
      onDragEnter={(e) => {
        if (!isEditMode) return;
        e.preventDefault();
        onDragEnter(index);
      }}
      onDragOver={(e) => {
        if (!isEditMode) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }}
      onDragEnd={onDragEnd}
      className={`relative transition-all duration-300 ${
        isDragging ? 'opacity-30 scale-95 grayscale' : 'opacity-100'
      } ${isEditMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      {/* Indicador de posição (Badge conforme Print) */}
      <div 
        className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg z-20 border-[3px] border-white dark:border-[#0B1120]"
        style={{ backgroundColor: subjectColor }}
      >
        {index + 1}
      </div>

      {/* Indicador de drop zone */}
      {isDropTarget && !isDragging && isEditMode && (
        <div className="absolute -inset-1 bg-blue-500/10 border-2 border-blue-500 border-dashed rounded-[32px] animate-pulse pointer-events-none z-10" />
      )}

      {/* Edit Mode Drag Handle Overlay */}
      {isEditMode && (
        <div className="absolute top-2 right-2 p-2 text-slate-300 dark:text-slate-600 z-30">
          <span className="material-icons-round text-xl">drag_indicator</span>
        </div>
      )}

      {/* Card do tópico */}
      <motion.div 
        layout
        initial={false}
        animate={{ 
          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
          borderColor: isDarkMode ? '#334155' : '#f1f5f9',
          scale: isDragging ? 0.95 : 1,
          opacity: isDragging ? 0.3 : 1
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`rounded-3xl shadow-sm border overflow-hidden flex flex-col h-full ${
          !isDragging && !isEditMode ? 'hover:shadow-xl hover:-translate-y-1' : ''
        }`}
      >
        
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.div 
                animate={{ 
                  scale: topic.isCompleted && !isEditMode ? [1, 1.1, 1] : 1,
                  rotate: topic.isCompleted && !isEditMode ? [0, 5, -5, 0] : 0
                }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
                style={{ backgroundColor: subjectColor }}
              >
                <span className="material-icons-round text-2xl">{topic.icon || 'menu_book'}</span>
              </motion.div>
              <div className="min-w-0">
                <motion.h3 
                  animate={{ color: isDarkMode ? '#f8fafc' : '#0f172a' }}
                  className="text-sm font-bold leading-tight truncate flex items-center gap-2"
                >
                  {topic.name}
                  
                  <div className="relative inline-flex items-center">
                    <button
                      onMouseEnter={() => setShowInfo(true)}
                      onMouseLeave={() => setShowInfo(false)}
                      className="p-1 -m-1 text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                    >
                      <span className="material-icons-round text-[14px]">info</span>
                    </button>
                    
                    <AnimatePresence>
                      {showInfo && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 pointer-events-none"
                        >
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Informações</p>
                          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                            {topic.description || `Meta de estudo: ${formatTime(topic.totalMinutes)}`}
                          </p>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white dark:border-t-slate-800" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.h3>
                <div className="mt-1.5 flex items-center gap-2">
                  <StarRating 
                    value={topic.priority || 1} 
                    onChange={(val) => onPriorityChange(topic.id, val as any)}
                    readonly={!isEditMode}
                    size="sm"
                    accentColor={subjectColor}
                  />
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {formatTime(topic.studiedMinutes)}
                  </p>
                </div>
              </div>
            </div>
            
            {!isEditMode && (
              <div className="flex items-center gap-2 shrink-0 ml-2 mt-1">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete(topic.id);
                  }}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    topic.isCompleted 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-blue-500 dark:hover:border-blue-500'
                  }`}
                  style={topic.isCompleted ? { backgroundColor: subjectColor, borderColor: subjectColor } : {}}
                >
                  {topic.isCompleted && <span className="material-icons-round text-[12px]">check</span>}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2 mt-auto">
            <div className="flex justify-between items-end mb-1.5">
              <motion.span 
                className="text-xs font-bold"
                style={{ color: subjectColor }}
              >
                {Math.round(progress)}%
              </motion.span>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {formatTime(topic.studiedMinutes)} / {formatTime(topic.totalMinutes)}
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${progress}%`, 
                  backgroundColor: subjectColor 
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Rodapé do Card */}
        <button
          onClick={() => !isEditMode && onTopicClick(topic, index)}
          className="w-full py-3.5 bg-slate-50 dark:bg-[#0f172a] border-t border-slate-100 dark:border-slate-800/50 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          style={{ '--hover-color': subjectColor } as any}
          onMouseEnter={(e) => (e.currentTarget.style.color = subjectColor)}
          onMouseLeave={(e) => (e.currentTarget.style.color = '')}
          disabled={isEditMode}
        >
          {isEditMode ? 'Arraste para mover' : 'Ver Detalhes'}
        </button>
      </motion.div>
    </div>
  );
};

// ✨ COMPONENTE PRINCIPAL
const SubjectDetailView: React.FC<SubjectDetailViewProps> = ({
  subject,
  onBack,
  onEditSubject,
  onAddTopic,
  onDeleteTopic,
  onTopicClick,
  onUpdateTopics,
}) => {
  const { isDarkMode } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'todos' | 'pendentes'>('todos');
  const [isThemeFormOpen, setIsThemeFormOpen] = useState(false);
  
  // Drag and Drop States
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [themeOrderMode, setThemeOrderMode] = useState<'by-priority' | 'manual'>('by-priority');

  // Check if subject is completed (all topics are completed)
  const isCompleted = useMemo(() => {
    if (!subject.topics || subject.topics.length === 0) return false;
    return subject.topics.every(t => t.isCompleted);
  }, [subject.topics]);

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newTopics = [...subject.topics];
      const [removed] = newTopics.splice(draggedIndex, 1);
      newTopics.splice(dragOverIndex, 0, removed);
      
      // Update order field for all topics to reflect new manual order
      const updatedTopics = newTopics.map((t, i) => ({ ...t, order: i }));
      
      onUpdateTopics(subject.id, updatedTopics);
      setThemeOrderMode('manual');
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleToggleComplete = (topicId: string) => {
    const newTopics = subject.topics.map(t => 
      t.id === topicId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    onUpdateTopics(subject.id, newTopics);
  };

  const handlePriorityChange = (topicId: string, priority: 1|2|3|4|5) => {
    const newTopics = subject.topics.map(t => 
      t.id === topicId ? { ...t, priority } : t
    );
    
    // Trigger priority sort and set mode to by-priority
    const sortedTopics = sortThemesByPriority(newTopics);
    onUpdateTopics(subject.id, sortedTopics);
    setThemeOrderMode('by-priority');
  };

  const handleRestorePriorityOrder = () => {
    const sortedTopics = sortThemesByPriority(subject.topics);
    onUpdateTopics(subject.id, sortedTopics);
    setThemeOrderMode('by-priority');
  };

  // Cálculos de Estatísticas
  const totalStudiedMinutes = subject.topics.reduce((sum, t) => sum + (t.studiedMinutes || 0), 0);
  const totalGoalMinutes = subject.topics.reduce((sum, t) => sum + (t.totalMinutes || 0), 0);
  const completedTopicsCount = subject.topics.filter(t => t.isCompleted).length;
  const pendingTopicsCount = subject.topics.length - completedTopicsCount;
  
  const overallProgress = totalGoalMinutes > 0 
    ? Math.round((totalStudiedMinutes / totalGoalMinutes) * 100) 
    : 0;

  const filteredTopics = subject.topics.filter((topic) => {
    const matchesSearch = topic.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterMode === 'todos' || !topic.isCompleted;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-right duration-500 overflow-y-auto no-scrollbar pb-[100px] transition-colors duration-300">
      
      {/* Header Compacto conforme Print */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-5 py-4 shrink-0 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-slate-400 dark:text-slate-500 hover:text-blue-500 w-12 h-12 flex items-center justify-center -ml-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all active:scale-95">
              <span className="material-icons-round text-2xl">arrow_back</span>
            </button>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: subject.color }}
              >
                <span className="material-icons-round text-xl">{subject.icon}</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">{subject.name}</h1>
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {subject.topics.length} TÓPICOS • {overallProgress}% CONCLUÍDO
                </p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsEditMode(!isEditMode)} 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              isEditMode 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700'
            }`}
          >
            <span className="material-icons-round text-base">{isEditMode ? 'check' : 'edit'}</span>
            {isEditMode ? 'Concluído' : 'Editar'}
          </button>
        </div>
      </header>

      <main className="px-5 py-8 max-w-7xl mx-auto w-full flex-1">
        
        {/* Edit Mode Banner */}
        {isEditMode && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <span className="material-icons-round text-blue-500 text-xl">drag_indicator</span>
              <div>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide block">
                  Modo de edição
                </span>
                <span className="text-xs text-blue-500/80 dark:text-blue-400/80 font-medium">
                  Arraste para reordenar ou altere as estrelas para definir a prioridade.
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-slate-900/50 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500/70 dark:text-blue-400/70">
                  Ordem:
                </span>
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                  {themeOrderMode === 'by-priority' ? 'Por Prioridade' : 'Manual'}
                </span>
              </div>
              
              {themeOrderMode === 'manual' && (
                <button
                  onClick={handleRestorePriorityOrder}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800/50 text-xs font-bold transition-colors shadow-sm"
                >
                  <span className="material-icons-round text-sm">sort</span>
                  Restaurar Prioridade
                </button>
              )}
            </div>
          </div>
        )}

        {/* Seção Superior Hero (Print 1 & 2) */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12">
          
          {/* Coluna Esquerda: Busca e Resumo */}
          <div className="flex flex-col gap-6 w-full lg:w-[320px] shrink-0">
            <div className="flex gap-2">
              <div className="flex-1 relative group">
                <span 
                  className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xl transition-colors"
                  style={{ color: searchQuery ? subject.color : undefined }}
                >
                  search
                </span>
                <input
                  type="text"
                  placeholder="Buscar tópico..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 transition-all outline-none"
                  style={{ '--tw-focus-ring-color': `${subject.color}1A`, '--tw-focus-border-color': subject.color } as any}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = subject.color;
                    e.currentTarget.style.boxShadow = `0 0 0 4px ${subject.color}1A`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.boxShadow = '';
                  }}
                />
              </div>
              <button 
                className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600 hover:bg-white dark:hover:bg-slate-800 transition-all"
                onMouseEnter={(e) => (e.currentTarget.style.color = subject.color)}
                onMouseLeave={(e) => (e.currentTarget.style.color = '')}
              >
                <span className="material-symbols-outlined font-variation-fill-0">tune</span>
              </button>
            </div>

            <div 
              className="rounded-[28px] p-6 border"
              style={{ backgroundColor: `${subject.color}10`, borderColor: `${subject.color}20` }}
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 block" style={{ color: subject.color }}>Resumo da Matéria</span>
              <p className="text-sm font-bold leading-relaxed" style={{ color: `${subject.color}CC` }}>
                {overallProgress === 100 
                  ? "Parabéns! Você concluiu todos os tópicos desta matéria. Mantenha as revisões!" 
                  : `Você já completou ${completedTopicsCount} de ${subject.topics.length} tópicos. Mantenha o ritmo!`}
              </p>
            </div>
          </div>

          {/* Coluna Direita: Grande Card de Estatísticas (Hero Card) */}
          <div 
            className="flex-1 rounded-[40px] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group"
            style={{ 
              background: `linear-gradient(135deg, ${subject.color}, ${subject.color}CC)`,
              boxShadow: `0 20px 40px ${subject.color}33`
            }}
          >
            {/* Efeitos de Fundo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl -ml-16 -mb-16"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 h-full">
              <div className="space-y-6 flex-1">
                <div>
                  <span className="text-[10px] font-black text-blue-100 uppercase tracking-[0.3em] opacity-80">Meta de Estudo</span>
                  <h2 className="text-5xl md:text-6xl font-black tracking-tighter mt-1">
                    {Math.floor(totalGoalMinutes / 60)}h {(totalGoalMinutes % 60).toString().padStart(2, '0')}m
                  </h2>
                </div>
                
                <div className="space-y-3 max-w-lg">
                  <div className="h-4 bg-white/20 rounded-full overflow-hidden border border-white/10 backdrop-blur-md">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-blue-50">
                    <span>Início do Ciclo</span>
                    <span>{overallProgress}% Concluído</span>
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col gap-4 shrink-0">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-5 md:w-56 transition-all hover:bg-white/20 cursor-default">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-icons-round text-white text-lg">check_circle</span>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Concluídos</span>
                  </div>
                  <p className="text-xl font-black">{completedTopicsCount} TÓPICOS</p>
                </div>
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-5 md:w-56 transition-all hover:bg-white/20 cursor-default">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-icons-round text-white text-lg">assignment_late</span>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Pendentes</span>
                  </div>
                  <p className="text-xl font-black">{pendingTopicsCount} TÓPICOS</p>
                </div>
              </div>
            </div>

            {/* Badge Percentual Flutuante conforme Print */}
            <div className="absolute top-10 right-10 w-20 h-14 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center hidden md:flex">
              <span className="text-xl font-black">{overallProgress}%</span>
            </div>
          </div>
        </div>

        {/* Lista de Tópicos */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Tópicos de Estudo</h2>
            
            <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl flex items-center gap-1 shrink-0 shadow-inner">
              <button 
                onClick={() => setFilterMode('todos')}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterMode === 'todos' ? 'text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                style={filterMode === 'todos' ? { backgroundColor: subject.color } : {}}
              >
                Todos
              </button>
              <button 
                onClick={() => setFilterMode('pendentes')}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterMode === 'pendentes' ? 'text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                style={filterMode === 'pendentes' ? { backgroundColor: subject.color } : {}}
              >
                Pendentes
              </button>
            </div>
          </div>

          {(filteredTopics.length === 0 && !isEditMode) ? (
            <div className="text-center py-20 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 text-slate-200">
                <span className="material-icons-round text-5xl">topic</span>
              </div>
              <p className="text-slate-400 font-bold">Nenhum tópico encontrado para esta busca.</p>
              <button 
                onClick={() => { setSearchQuery(''); setFilterMode('todos'); }} 
                className="mt-4 font-black uppercase text-[10px] tracking-widest hover:underline"
                style={{ color: subject.color }}
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-1">
              {filteredTopics.map((topic, index) => (
                <DraggableTopicCard
                  key={topic.id}
                  topic={topic}
                  index={subject.topics.indexOf(topic)} // Índice original no array para D&D correto
                  subjectColor={subject.color}
                  isDarkMode={isDarkMode}
                  onTopicClick={onTopicClick}
                  onToggleComplete={handleToggleComplete}
                  onDragStart={handleDragStart}
                  onDragEnter={handleDragEnter}
                  onDragEnd={handleDragEnd}
                  onPriorityChange={handlePriorityChange}
                  isDragging={draggedIndex === subject.topics.indexOf(topic)}
                  isDropTarget={dragOverIndex === subject.topics.indexOf(topic)}
                  isEditMode={isEditMode}
                />
              ))}
              
              {/* New Topic Placeholder Card (Only in Edit Mode) */}
              {isEditMode && (
                <button
                  onClick={onAddTopic}
                  className="group flex flex-col items-center justify-center p-6 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-300 min-h-[200px]"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 flex items-center justify-center mb-3 transition-colors">
                    <span className="material-icons-round text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors text-2xl">add</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 group-hover:text-blue-500 uppercase tracking-widest transition-colors">
                    Novo Tópico
                  </span>
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Theme Creation Form Modal */}
      {isThemeFormOpen && (
        <ThemeCreationForm
          subjectId={subject.id}
          currentThemeCount={subject.topics.length} // Using topics length as proxy for now
          subjectPriority={(subject.priority as 1|2|3|4|5) || 1}
          onThemeCreated={(theme) => {
            // Stub handler as requested
            console.log('New Theme Created:', theme);
            // In a real implementation, this would update the subject's themes array
            // onUpdateTopics(subject.id, [...subject.topics, theme as any]); 
            setIsThemeFormOpen(false);
          }}
          onCancel={() => setIsThemeFormOpen(false)}
        />
      )}

      {/* Floating Action Button para Novo Tópico - Hide in Edit Mode */}
      {!isEditMode && !isCompleted && (
        <div className="fixed bottom-28 right-8 flex flex-col gap-4 items-end z-50">
          {/* Add Theme Button (New) */}
          <button 
            onClick={() => setIsThemeFormOpen(true)}
            className="flex items-center gap-3 px-5 py-3 bg-slate-800 dark:bg-slate-800 text-slate-200 rounded-full shadow-lg border border-slate-700 hover:bg-slate-700 active:scale-95 transition-all group"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">Adicionar Tema</span>
            <span className="material-icons-round text-lg text-blue-500">post_add</span>
          </button>

          {/* Existing Add Topic Button (Legacy) */}
          <button 
            onClick={onAddTopic}
            className="w-16 h-16 text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all group overflow-hidden"
            style={{ 
              backgroundColor: subject.color,
              boxShadow: `0 12px 24px ${subject.color}66`
            }}
          >
            <div className="absolute inset-0 bg-white/10 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full"></div>
            <span className="material-icons-round text-3xl relative z-10">add</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SubjectDetailView;