
import React, { useState, useMemo, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Subject, Goal, Tab, Topic, Question } from '../types';
import { useApp } from '../contexts/AppContext';
import AddQuestionView from './AddQuestionView';
import AddFlashcardView from './AddFlashcardView';
import QuestionBankView from './QuestionBankView';
import ManageQuestionsView from './ManageQuestionsView';
import EditQuestionView from './EditQuestionView';
import SubjectSelectorOverlay from './SubjectSelectorOverlay';
import CombatView from './CombatView';

export interface BattleViewHandle {
  handleAddQuestion: () => void;
  handleOpenQuestionBank: () => void;
}

interface BattleViewProps {
  subjects: Subject[];
  goals: Goal[];
  onManageGoals: () => void;
  onUpdateSubjects?: (updatedSubjects: Subject[]) => void;
  onHistoryClick?: () => void;
  onSubjectClick?: (id: string) => void;
  onBattleSelectionClick?: () => void;
}

const initialQuestions: Question[] = [];

const CONFIDENCE_DATA: Record<string, { certeza: string, duvida: string, incerteza: string, falta: string }> = {};

const BattleView = forwardRef<BattleViewHandle, BattleViewProps>(({ 
  subjects, 
  goals, 
  onManageGoals, 
  onUpdateSubjects, 
  onHistoryClick, 
  onSubjectClick,
  onBattleSelectionClick
}, ref) => {
  const { isDarkMode, questions, setQuestions, studyHistory } = useApp();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoveredSubjectId, setHoveredSubjectId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'battle' | 'add_question' | 'add_flashcard' | 'question_bank' | 'manage_questions' | 'edit_question' | 'combat'>('battle');
  const [isSelectingTopic, setIsSelectingTopic] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  
  // Questions State
  const [questionToEdit, setQuestionToEdit] = useState<Question | undefined>(undefined);

  useImperativeHandle(ref, () => ({
    handleAddQuestion: () => handleAddClick('add_question'),
    handleOpenQuestionBank: () => setActiveView('question_bank'),
  }));

  const handleUpdateQuestion = (updatedQuestion: Partial<Question>) => {
    if (questionToEdit) {
      setQuestions(prev => prev.map(q => q.id === questionToEdit.id ? { ...q, ...updatedQuestion } : q));
      setQuestionToEdit(undefined);
      setActiveView('manage_questions');
    }
  };

  const handleSaveNewQuestion = (newQuestionData: any) => {
    const newQuestion: Question = {
      id: `q-${crypto.randomUUID()}`,
      code: `Q-${Math.floor(Math.random() * 100000)}`,
      difficulty: newQuestionData.difficulty === 'facil' ? 'FÁCIL' : newQuestionData.difficulty === 'medio' ? 'MÉDIO' : 'DIFÍCIL',
      views: '0',
      text: newQuestionData.text || 'Nova Questão',
      status: 'Ativa',
      subject: newQuestionData.subjectId,
      topic: newQuestionData.topicId,
      subtopic: newQuestionData.subTopicId,
      questionType: newQuestionData.questionType,
      options: newQuestionData.options,
      correctAnswerMultipla: newQuestionData.correctAnswerMultipla,
      correctAnswerCertoErrado: newQuestionData.correctAnswerCertoErrado,
      flashcardAnswer: newQuestionData.flashcardAnswer,
      explanation: newQuestionData.explanation,
      tags: newQuestionData.tags,
    };
    setQuestions(prev => [...prev, newQuestion]);
    setActiveView('battle');
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const currentConfidence = useMemo(() => {
    const defaultStats = { certeza: '0%', duvida: '0%', incerteza: '0%', falta: '0%' };
    if (!studyHistory || studyHistory.length === 0) return defaultStats;

    const relevantSessions = hoveredSubjectId 
      ? studyHistory.filter(s => s.subjectId === hoveredSubjectId)
      : studyHistory;

    if (relevantSessions.length === 0) return defaultStats;

    const total = relevantSessions.length;
    const stats = relevantSessions.reduce((acc, s) => {
      acc.certeza += s.confidenceStats?.certeza || 0;
      acc.duvida += s.confidenceStats?.duvida || 0;
      acc.incerteza += s.confidenceStats?.chute || 0;
      return acc;
    }, { certeza: 0, duvida: 0, incerteza: 0 });

    const avgCerteza = Math.round(stats.certeza / total);
    const avgDuvida = Math.round(stats.duvida / total);
    const avgIncerteza = Math.round(stats.incerteza / total);
    const avgFalta = Math.max(0, 100 - (avgCerteza + avgDuvida + avgIncerteza));

    return {
      certeza: `${avgCerteza}%`,
      duvida: `${avgDuvida}%`,
      incerteza: `${avgIncerteza}%`,
      falta: `${avgFalta}%`
    };
  }, [hoveredSubjectId, studyHistory]);

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const segmentRatio = 1 / Math.max(subjects.length, 1);
  const segmentValue = segmentRatio * circumference;

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (index: number) => {
    if (draggedIndex === null || !onUpdateSubjects) return;
    const newSubjects = [...subjects];
    const draggedItem = newSubjects[draggedIndex];
    newSubjects.splice(draggedIndex, 1);
    newSubjects.splice(index, 0, draggedItem);
    onUpdateSubjects(newSubjects);
    setDraggedIndex(null);
  };

  const handleAddClick = (type: 'add_question' | 'add_flashcard') => {
    setActiveView(type);
    if (type !== 'add_question') {
      setIsSelectingTopic(true);
    }
  };

  if (activeView === 'combat') {
    return <CombatView onBack={() => setActiveView('battle')} subjectId={selectedSubject?.id} onBattleSelectionClick={onBattleSelectionClick} />;
  }

  if (activeView === 'question_bank') {
    return (
      <QuestionBankView 
        subjects={subjects}
        onBack={() => setActiveView('battle')}
        onAddQuestion={() => setActiveView('add_question')}
        onManageTopic={(topicId, subjectId) => {
          const subject = subjects.find(s => s.id === subjectId);
          const topic = subject?.topics.find(t => t.id === topicId);
          if (subject && topic) {
            setSelectedSubject(subject);
            setSelectedTopic(topic);
            setActiveView('manage_questions');
          }
        }}
      />
    );
  }

  if (activeView === 'manage_questions') {
    return (
      <ManageQuestionsView
        topicId={selectedTopic?.id || ''}
        topicName={selectedTopic?.name || 'Tópico'}
        subjectName={selectedSubject?.name || 'Matéria'}
        questions={questions}
        onBack={() => setActiveView('question_bank')}
        onAddQuestion={() => setActiveView('add_question')}
        onEditQuestion={(question) => {
          setQuestionToEdit(question);
          setActiveView('edit_question');
        }}
        onDeleteQuestion={handleDeleteQuestion}
      />
    );
  }

  if (activeView === 'edit_question') {
    return (
      <EditQuestionView
        initialData={questionToEdit}
        onBack={() => {
          setQuestionToEdit(undefined);
          setActiveView('manage_questions');
        }}
        onSave={handleUpdateQuestion}
      />
    );
  }

  if (activeView === 'add_question') {
    return (
      <AddQuestionView 
        subjects={subjects}
        initialSubjectId={selectedSubject?.id}
        initialTopicId={selectedTopic?.id}
        onBack={() => { setActiveView('battle'); setSelectedTopic(null); }} 
        onSave={handleSaveNewQuestion}
      />
    );
  }

  if (activeView === 'add_flashcard' && selectedTopic && selectedSubject) {
    return (
      <AddFlashcardView
        topic={selectedTopic}
        subjectName={selectedSubject.name}
        subjectColor={selectedSubject.color}
        onBack={() => { setActiveView('battle'); setSelectedTopic(null); }}
        onSave={() => setActiveView('battle')}
      />
    );
  }

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-right duration-300 min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
      {isSelectingTopic && (
        <SubjectSelectorOverlay 
          subjects={subjects} 
          onClose={() => { setIsSelectingTopic(false); if (!selectedTopic) setActiveView('battle'); }} 
          onSelectSubject={(subjectId, topicIndex) => {
            const subject = subjects.find(s => s.id === subjectId);
            const topic = subject?.topics[topicIndex];
            if (subject && topic) {
              setSelectedSubject(subject);
              setSelectedTopic(topic);
              setIsSelectingTopic(false);
            }
          }}
        />
      )}
      
      <main className="px-4 py-6 md:py-8 lg:py-10 max-w-6xl mx-auto w-full flex flex-col gap-10 pb-48">
        {questions.length === 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-3xl p-6 flex items-center gap-4 animate-in fade-in slide-in-from-top duration-500">
            <span className="material-icons-round text-blue-500 text-3xl">info</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-blue-900 dark:text-blue-100">Nenhuma questão cadastrada</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">Adicione questões ou flashcards para começar a treinar no campo de batalha.</p>
            </div>
            <button 
              onClick={() => setActiveView('add_question')}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors"
            >
              Adicionar Agora
            </button>
          </div>
        )}
        
        <section className="bg-white dark:bg-slate-900 rounded-[40px] shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 p-6 md:p-12 overflow-hidden relative">
          <div className="flex flex-col lg:flex-row items-center justify-around gap-12 lg:gap-20">
            <div className="relative w-64 h-64 md:w-80 md:h-80 flex-shrink-0">
              <svg className="transform -rotate-90 w-full h-full overflow-visible" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} fill="transparent" stroke={isDarkMode ? "#1E293B" : "#F1F5F9"} strokeWidth="16" />
                {subjects.map((s, idx) => {
                  const isHovered = hoveredSubjectId === s.id;
                  const currentOffset = -idx * segmentValue;
                  const midAnglePercent = (idx * segmentRatio) + (segmentRatio / 2);
                  const midAngleRad = (midAnglePercent * 360) * (Math.PI / 180);
                  const textX = 50 + radius * Math.cos(midAngleRad);
                  const textY = 50 + radius * Math.sin(midAngleRad);
                  return (
                    <g 
                      key={s.id} 
                      className="cursor-pointer transition-all duration-300"
                      onMouseEnter={() => setHoveredSubjectId(s.id)}
                      onMouseLeave={() => setHoveredSubjectId(null)}
                      onClick={() => onSubjectClick?.(s.id)}
                    >
                      <circle 
                        cx="50" cy="50" fill="transparent" r={radius} 
                        stroke={s.color} 
                        strokeDasharray={`${segmentValue} ${circumference}`} 
                        strokeDashoffset={currentOffset} 
                        strokeWidth={isHovered ? 20 : 16} 
                        strokeLinecap="butt"
                        className="transition-all duration-300"
                        style={{ opacity: hoveredSubjectId && !isHovered ? 0.4 : 1 }}
                      />
                      <text 
                        x={textX} y={textY} 
                        textAnchor="middle" dominantBaseline="middle" 
                        className={`font-black text-[5px] fill-white pointer-events-none select-none transition-all ${isHovered ? 'scale-125' : ''}`}
                        transform={`rotate(90 ${textX} ${textY})`}
                      >
                        {s.shortName}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                  {hoveredSubjectId ? subjects.find(s => s.id === hoveredSubjectId)?.studiedMinutes : '412'}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mt-3">
                  {hoveredSubjectId ? 'MINUTOS' : 'QUESTÕES'}
                </span>
              </div>
            </div>

            <div className="flex flex-col w-full lg:max-w-lg gap-5">
              <h3 className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.25em] px-1">Distribuição de Confiança</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ConfidenceCard percentage={currentConfidence.certeza} label="CERTEZA" icon="check_circle" color="text-[#10B981]" />
                <ConfidenceCard percentage={currentConfidence.duvida} label="DÚVIDA" icon="warning" color="text-[#F59E0B]" />
                <ConfidenceCard percentage={currentConfidence.incerteza} label="INCERTEZA" icon="radio_button_checked" color="text-[#3B82F6]" />
                <ConfidenceCard percentage={currentConfidence.falta} label="FALTA" icon="help" color="text-[#EF4444]" />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Desempenho por Matéria</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((s, idx) => (
              <div 
                key={s.id} 
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(idx)}
                onDragEnd={() => setDraggedIndex(null)}
                className={`transition-all duration-300 ${draggedIndex === idx ? 'opacity-40 grayscale' : 'opacity-100'}`}
              >
                <PerformanceItem 
                  subject={s} 
                  onClick={() => {
                    setSelectedSubject(s);
                    setActiveView('combat');
                  }} 
                />
              </div>
            ))}
          </div>
        </section>
      </main>

      <button 
        onClick={onBattleSelectionClick}
        className="fixed bottom-[100px] right-6 z-50 w-16 h-16 rounded-full bg-blue-600 text-white shadow-[0_8px_25px_rgba(37,99,235,0.4)] flex items-center justify-center active:scale-95 transition-all"
      >
        <span className="material-symbols-outlined text-3xl font-variation-fill-1">swords</span>
      </button>
    </div>
  );
});

const HeaderActionIcon: React.FC<{ icon: string, color?: string, className?: string, onClick?: () => void, title?: string, primary?: boolean }> = ({ icon, color = "text-blue-600", className = "", onClick, title, primary }) => (
  <button 
    onClick={onClick}
    title={title}
    className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-white dark:bg-slate-900 border ${primary ? 'border-blue-500 shadow-blue-500/20' : 'border-slate-100 dark:border-slate-800'} rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:scale-95 ${className}`}
  >
    <span className={`material-icons-round ${color} text-lg md:text-xl`}>{icon}</span>
  </button>
);

const ConfidenceCard: React.FC<{ percentage: string, label: string, icon: string, color: string }> = ({ percentage, label, icon, color }) => (
  <div className="bg-white dark:bg-slate-900 rounded-[24px] p-5 border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-all hover:shadow-lg group">
    <div className="flex flex-col">
      <span className={`text-2xl font-black mb-0.5 ${color}`}>{percentage}</span>
      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">{label}</span>
    </div>
    <span className={`material-icons-round text-2xl ${color}`}>{icon}</span>
  </div>
);

const PerformanceItem: React.FC<{ subject: Subject, onClick: () => void }> = ({ subject, onClick }) => {
  const percentage = Math.round((subject.studiedMinutes / subject.totalMinutes) * 100);
  const resolvedCount = subject.topics.reduce((acc, t) => acc + (t.completedQuestions || 0), 0);
  
  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-slate-900 rounded-[28px] p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 border-l-[8px] h-full flex flex-col justify-between cursor-pointer hover:shadow-md transition-all active:scale-[0.99]" 
      style={{ borderLeftColor: subject.color }}
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span 
              className="material-icons-round text-slate-300 dark:text-slate-600 cursor-grab active:cursor-grabbing hover:text-slate-500 transition-colors" 
              title="Arraste para reordenar"
              onClick={(e) => e.stopPropagation()}
            >
              drag_indicator
            </span>
            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{subject.name}</h3>
          </div>
          <span className="text-[11px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl border border-emerald-100/50 dark:border-emerald-800/50">{percentage}%</span>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
            <span>Progresso</span>
            <span className="text-slate-900 dark:text-white">{Math.floor(subject.studiedMinutes/60)} DE {Math.floor(subject.totalMinutes/60)}H</span>
          </div>
          <div className="w-full bg-[#F1F3F5] dark:bg-slate-800 h-3 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${percentage}%`, backgroundColor: subject.color }}></div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-end mt-10">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mb-1">Resolvidas</span>
          <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">{resolvedCount}</span>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black block mb-2 tracking-widest">Confiança Alta</span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map(i => <div key={i} className="w-6 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20"></div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleView;
