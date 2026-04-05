import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Tab, Subject, Topic } from './types';
import { useApp } from './contexts/AppContext';
import { useAuth } from './contexts/AuthContext';
import Header, { HeaderAction } from './components/Header';
import CycleView from './components/CycleView';
import SubjectDetailView from './components/SubjectDetailView';
import FocusModeView from './components/FocusModeView';
import NotificationsView from './components/NotificationsView';
import HistoryView from './components/HistoryView';
import TimeStatsView from './components/TimeStatsView';
import BattleStatsView from './components/BattleStatsView';
import AchievementsView from './components/AchievementsView';
import BattleHistoryView from './components/BattleHistoryView';
import ManagementView from './components/ManagementView';
import GoalsManagementView from './components/GoalsManagementView';
import BattleView, { BattleViewHandle } from './components/BattleView';
import HomeView from './components/HomeView';
import ColiseumView from './components/ColiseumView';
import MoreView from './components/MoreView';
import SubTopicDetailView from './components/SubTopicDetailView';
import AddTopicView from './components/AddTopicView';
import SideNavigation from './components/SideNavigation';
import BottomNav from './components/BottomNav';
import SettingsView from './components/SettingsView';
import ImportJsonView from './components/ImportJsonView';
import BattleSelectionHUD from './components/BattleSelectionHUD';
import BattleQuestionView from './components/BattleQuestionView';
import PomodoroSoundsView from './components/PomodoroSoundsView';
import StudyPlannerWizard from './components/wizard/StudyPlannerWizard';
import CycleCompleteModal from './components/CycleCompleteModal';
import { ToastContainer } from './components/ToastContainer';
import { AnimatePresence } from 'motion/react';
import { CycleStatsPage } from './components/stats/CycleStatsPage';
import { StudySession as StatsStudySession, QuestionAttempt as StatsQuestionAttempt } from './types/stats.types';
import { LogIn, Loader2 } from 'lucide-react';
import PWAInstallPrompt from './components/PWAInstallPrompt';

import { KnowledgeLevel, calculateCombinedWeight } from './utils/priorityUtils';

import { resolveNextTheme } from './utils/themePriority';

// --- Cycle Logic Decision Function ---
// Evaluates the current state of subjects and determines the next action.
// Pure function: no side effects.
type Resolution = 
  | { action: 'empty' }
  | { action: 'cycle-complete' }
  | { action: 'resume'; subject: Subject; topicId?: string }
  | { action: 'start'; subject: Subject; topicId?: string };

function resolveNextSubject(subjects: Subject[], isAutoCycle: boolean): Resolution {
  // 1. Empty check
  if (subjects.length === 0) {
    return { action: 'empty' };
  }

  // 2. All completed check
  const allCompleted = subjects.every(s => s.studiedMinutes >= s.totalMinutes);
  if (allCompleted) {
    return { action: 'cycle-complete' };
  }

  // 3. Find the first non-completed subject (respecting cycle order)
  const nextSubject = subjects.find(s => s.studiedMinutes < s.totalMinutes);

  if (nextSubject) {
    // 4. Active mid-session subject exists (Resume)
    // If the subject has some progress but isn't finished, we resume it.
    if (nextSubject.studiedMinutes > 0) {
      const nextTheme = resolveNextTheme(nextSubject.topics, isAutoCycle);
      return { 
        action: 'resume', 
        subject: nextSubject,
        topicId: nextTheme ? nextTheme.id : undefined
      };
    } 
    // 5. Fresh start or normal next subject (Start)
    // If the subject has 0 progress, we start it fresh.
    else {
      const nextTheme = resolveNextTheme(nextSubject.topics, isAutoCycle);
      return { 
        action: 'start', 
        subject: nextSubject,
        topicId: nextTheme ? nextTheme.id : undefined
      };
    }
  }

  // Fallback (should be covered by step 2, but for safety)
  return { action: 'cycle-complete' };
}

const App: React.FC = () => {
  const { user, loading, signInWithGoogle } = useAuth();
  const {
    subjects, setSubjects,
    goals, setGoals,
    activeTab, setActiveTab,
    isAutoCycle, setIsAutoCycle,
    pomodoroSettings, setPomodoroSettings,
    userStats,
    studyHistory,
    questions,
    addXP,
    addStudySession,
    updateSubjectTopics,
    isDarkMode, setIsDarkMode
  } = useApp();

  // Reset sub-views and modals when tab changes
  useEffect(() => {
    setActiveView('main');
    setActiveModal(null);
    setIsFocusMode(false);
    setIsTopicManagerOpen(false);
    setIsAddingTopic(false);
    setShowMobileMenu(false);
  }, [activeTab]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Data migration for subjects with 0 totalMinutes (fixes onboarding bug) and missing priority/knowledgeLevel
  useEffect(() => {
    let needsUpdate = false;
    
    const updatedSubjects = subjects.map(s => {
      let updated = { ...s };
      if (s.totalMinutes === 0) {
        needsUpdate = true;
        const weightsStr = localStorage.getItem('user_edital_weights');
        const weights = weightsStr ? JSON.parse(weightsStr) : {};
        const weeklyGoal = goals.find(g => g.title === 'Meta Semanal');
        const weeklyMinutes = weeklyGoal ? weeklyGoal.targetMinutes : 1200; // Default 20h
        
        let totalWeight = 0;
        subjects.forEach(sub => {
          totalWeight += (weights[sub.id] || 1);
        });
        
        const minutesPerWeight = totalWeight > 0 ? weeklyMinutes / totalWeight : 60;
        const subjectWeight = weights[s.id] || 1;
        const subjectTotalMinutes = Math.max(60, Math.round(subjectWeight * minutesPerWeight));
        
        updated.totalMinutes = subjectTotalMinutes;
        updated.topics = s.topics.map(t => ({
          ...t,
          totalMinutes: Math.max(15, Math.round(subjectTotalMinutes / (s.topics.length || 1)))
        }));
      }
      
      if (s.priority === undefined) {
        needsUpdate = true;
        updated.priority = 3;
      }
      
      if (s.knowledgeLevel === undefined) {
        needsUpdate = true;
        updated.knowledgeLevel = 'iniciante';
      }
      
      return updated;
    });

    if (needsUpdate) {
      setSubjects(updatedSubjects);
    }
  }, [subjects, goals, setSubjects]);

  // Estados de UI (Locais ao App.tsx)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [isTopicManagerOpen, setIsTopicManagerOpen] = useState(false);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [focusSubjectId, setFocusSubjectId] = useState<string | null>(null);
  const [focusTopicId, setFocusTopicId] = useState<string | null>(null);
  
  // Navigation state
  const [activeView, setActiveView] = useState<import('./types/navigation.types').ActiveView>('main');
  const [activeModal, setActiveModal] = useState<import('./types/navigation.types').ActiveModal>(null);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('has_completed_onboarding'));

  // Listen for custom navigation events (useful for components deep in the tree)
  useEffect(() => {
    const handleNavigate = (e: any) => {
      if (e.detail) {
        setActiveView(e.detail);
      }
    };
    window.addEventListener('navigate', handleNavigate);
    return () => window.removeEventListener('navigate', handleNavigate);
  }, []);

  // Navigation helpers:
  const navigateTo = (view: import('./types/navigation.types').ActiveView) => setActiveView(view);
  const openModal = (modal: import('./types/navigation.types').ActiveModal) => setActiveModal(modal);
  const closeModal = () => setActiveModal(null);
  const goBack = () => {
    setActiveView('main');
    setActiveModal(null);
  };
  
  // Edit Mode State
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Navigation State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Battle Settings State
  const [battleSettings, setBattleSettings] = useState<{
    room: string, 
    mode: string, 
    questionLimit: number, 
    mixSubjects: boolean,
    selectedSubjectIds?: string[],
    selectedTopicIds?: string[],
    sessionTimeLimit?: number,
    distributionMode?: string
  } | null>(null);

  // Refs
  const battleViewRef = useRef<BattleViewHandle>(null);

  // Drag and Drop Subjects
  const [draggedSubjectIndex, setDraggedSubjectIndex] = useState<number | null>(null);
  const [dragOverSubjectIndex, setDragOverSubjectIndex] = useState<number | null>(null);

  const handleSubjectDragStart = (index: number) => setDraggedSubjectIndex(index);
  const handleSubjectDragEnter = (index: number) => {
    if (draggedSubjectIndex === null || draggedSubjectIndex === index) return;
    setDragOverSubjectIndex(index);
  };
  const handleSubjectDragEnd = () => {
    if (draggedSubjectIndex !== null && dragOverSubjectIndex !== null && draggedSubjectIndex !== dragOverSubjectIndex) {
      const newSubjects = [...subjects];
      const [removed] = newSubjects.splice(draggedSubjectIndex, 1);
      newSubjects.splice(dragOverSubjectIndex, 0, removed);
      setSubjects(newSubjects);
    }
    setDraggedSubjectIndex(null);
    setDragOverSubjectIndex(null);
  };

  // Selecionados computados
  const selectedSubject = useMemo(() => subjects.find(s => s.id === selectedSubjectId), [subjects, selectedSubjectId]);
  const selectedTopic = useMemo(() => {
    if (!selectedSubject || !selectedTopicId) return null;
    return selectedSubject.topics.find(t => t.id === selectedTopicId);
  }, [selectedSubject, selectedTopicId]);

  // Sort subjects for rendering: Active (Incomplete) -> Inactive (Incomplete) -> Completed
  // In Edit Mode, we use the raw order to allow reordering
  const displaySubjects = useMemo(() => {
    if (isEditMode) return subjects;
    
    const incomplete = subjects.filter(s => s.studiedMinutes < s.totalMinutes);
    const completed = subjects.filter(s => s.studiedMinutes >= s.totalMinutes);
    return [...incomplete, ...completed];
  }, [subjects, isEditMode]);

  const stats = useMemo(() => {
    const totalMinutes = subjects.reduce((acc, s) => acc + s.studiedMinutes, 0);
    const totalGoal = subjects.reduce((acc, s) => acc + s.totalMinutes, 0);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return {
      totalTimeStr: `${h}h ${m}m`,
      percentage: totalGoal > 0 ? Math.round((totalMinutes / totalGoal) * 100) : 0
    };
  }, [subjects]);

  // Check if cycle is fully complete for FAB visibility
  const [showCycleCompleteModal, setShowCycleCompleteModal] = useState(false);

  const isCycleComplete = useMemo(() => {
    return subjects.length > 0 && subjects.every(s => s.studiedMinutes >= s.totalMinutes);
  }, [subjects]);

  const resetCycle = () => {
    setSubjects(prev => prev.map(s => ({
      ...s,
      studiedMinutes: 0,
      topics: s.topics.map(t => ({
        ...t,
        studiedMinutes: 0,
        isCompleted: false,
        completedQuestions: 0
      }))
    })));
    setShowCycleCompleteModal(false);
  };

  const handleCycleComplete = () => {
    setShowCycleCompleteModal(true);
  };

  const handleStartStudy = (subjectId?: string, topicId?: string) => {
    // If a specific subject ID is provided (e.g. clicked from a card),
    // we respect that choice and start that specific subject.
    if (subjectId) {
      setFocusSubjectId(subjectId);
      setFocusTopicId(topicId || null);
      setIsFocusMode(true);
      if (activeView !== 'main') {
        goBack();
      }
      return;
    }

    // Otherwise, we resolve the next subject based on the cycle state.
    const resolution = resolveNextSubject(subjects, isAutoCycle);

    switch (resolution.action) {
      case 'empty':
        // Navigate to Cycle tab to show empty state
        setActiveTab(Tab.CICLO);
        return;
      case 'cycle-complete':
        handleCycleComplete();
        return;
      case 'resume':
      case 'start':
        if (resolution.subject) {
          setFocusSubjectId(resolution.subject.id);
          setFocusTopicId(resolution.topicId || null);
          setIsFocusMode(true);
          if (activeView !== 'main') {
            goBack();
          }
        }
        return;
    }
  };

  const recalculateTotalMinutes = (currentSubjects: Subject[]) => {
    const weeklyGoal = goals.find(g => g.title === 'Meta Semanal');
    const weeklyMinutes = weeklyGoal ? weeklyGoal.targetMinutes : 1200; // Default 20h
    
    let totalWeight = 0;
    currentSubjects.forEach(s => {
      totalWeight += calculateCombinedWeight(s.priority || 1, s.knowledgeLevel || 'iniciante');
    });
    
    const minutesPerWeight = totalWeight > 0 ? weeklyMinutes / totalWeight : 60;
    
    return currentSubjects.map(s => {
      const subjectWeight = calculateCombinedWeight(s.priority || 1, s.knowledgeLevel || 'iniciante');
      const subjectTotalMinutes = Math.max(60, Math.round(subjectWeight * minutesPerWeight));
      return {
        ...s,
        totalMinutes: subjectTotalMinutes,
        topics: s.topics.map(t => ({
          ...t,
          totalMinutes: Math.max(15, Math.round(subjectTotalMinutes / (s.topics.length || 1)))
        }))
      };
    });
  };

  const handlePriorityChange = (subjectId: string, priority: number) => {
    setSubjects(prev => {
      const updated = prev.map(s => s.id === subjectId ? { ...s, priority } : s);
      return recalculateTotalMinutes(updated);
    });
  };

  const handleLevelChange = (subjectId: string, level: KnowledgeLevel) => {
    setSubjects(prev => {
      const updated = prev.map(s => s.id === subjectId ? { ...s, knowledgeLevel: level } : s);
      return recalculateTotalMinutes(updated);
    });
  };

  const renderMainContent = () => {
    if (activeTab === Tab.DETALHES && selectedSubject) {
      return (
        <SubjectDetailView
          subject={selectedSubject}
          onBack={() => { setSelectedSubjectId(null); setActiveTab(Tab.INICIO); }}
          onEditSubject={() => navigateTo('management')}
          onAddTopic={() => setIsAddingTopic(true)}
          onDeleteTopic={(id) => setSubjects(prev => prev.map(s => s.id === selectedSubjectId ? {...s, topics: s.topics.filter(t => t.id !== id)} : s))}
          onTopicClick={(topic) => { setSelectedTopicId(topic.id); setIsTopicManagerOpen(true); }}
          onUpdateTopics={updateSubjectTopics}
        />
      );
    }
    if (activeTab === Tab.INICIO) {
      return <HomeView subjects={subjects} goals={goals} userStats={userStats} studyHistory={studyHistory} onStartStudy={handleStartStudy} onNavigateToTab={setActiveTab} />;
    }
    if (activeTab === Tab.COLISEU) return (
      <ColiseumView 
        subjects={subjects} 
        questions={questions}
        onStartBattle={(room, mode, questionLimit, mixSubjects, selectedSubjectIds, selectedTopicIds, sessionTimeLimit, distributionMode) => {
          setBattleSettings({ room, mode, questionLimit, mixSubjects, selectedSubjectIds, selectedTopicIds, sessionTimeLimit, distributionMode });
          navigateTo('battleQuestion');
        }} 
      />
    );
    if (activeTab === Tab.RANKING) return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <span className="material-icons-round text-5xl text-slate-400 dark:text-slate-500">
            emoji_events
          </span>
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          Ranking em Breve
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs text-center font-medium">
          A competição global está sendo preparada. Continue estudando para garantir sua vaga no topo!
        </p>
      </div>
    );
    if (activeTab === Tab.ESTATISTICAS) {
      const statsSessions: StatsStudySession[] = studyHistory.map(s => {
        const subject = subjects.find(sub => sub.id === s.subjectId);
        return {
          id: s.id,
          subjectId: s.subjectId,
          subjectName: s.subjectName || subject?.name || 'Desconhecida',
          subjectColor: subject?.color || '#94a3b8',
          themeId: s.topicsCompleted?.[0] || null,
          themeName: s.topicName || null,
          startedAt: s.date,
          endedAt: new Date(new Date(s.date).getTime() + s.minutesStudied * 60000).toISOString(),
          durationMinutes: s.minutesStudied + (s.pauseMinutes || 0),
          studyMinutes: s.minutesStudied,
          pauseMinutes: s.pauseMinutes || 0,
          pomodorosCompleted: 0,
          sessionType: s.type === 'batalha' ? 'simulation' : 'study',
          wasCompleted: true,
        };
      });

      const statsAttempts: StatsQuestionAttempt[] = [];
      studyHistory.forEach(s => {
        if (s.attempts) {
          s.attempts.forEach(a => {
            const subject = subjects.find(sub => sub.id === a.subjectId);
            statsAttempts.push({
              id: a.id,
              topicId: a.topicId,
              topicName: s.topicName || 'Desconhecido',
              subjectId: a.subjectId,
              subjectName: subject?.name || 'Desconhecida',
              subjectColor: subject?.color || '#94a3b8',
              isCorrect: a.isCorrect,
              confidence: a.confidence,
              errorType: a.errorType,
              timeSpentSeconds: a.timeSpentSeconds,
              xpEarned: a.xpEarned,
              attemptedAt: a.attemptedAt,
              sessionId: s.id,
              sessionType: s.type === 'batalha' ? 'simulation' : 'study',
              sessionDurationMinutes: s.minutesStudied,
            });
          });
        }
      });

      const statsSubjects = subjects.map(s => ({ id: s.id, name: s.name }));
      const statsThemes = subjects.flatMap(s => s.topics.map(t => ({ id: t.id, name: t.name, subjectId: s.id })));

      return (
        <CycleStatsPage 
          sessions={statsSessions} 
          attempts={statsAttempts} 
          subjects={statsSubjects} 
          themes={statsThemes} 
        />
      );
    }
    if (activeTab === Tab.JORNADA) return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <span className="material-icons-round text-5xl text-slate-400 dark:text-slate-500">
            map
          </span>
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          Jornada em Breve
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs text-center font-medium">
          Seu mapa de conquistas e progresso está sendo desenhado. Prepare-se para a aventura!
        </p>
      </div>
    );
    if (activeTab === Tab.LOJA) return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <span className="material-icons-round text-5xl text-slate-400 dark:text-slate-500">
            shopping_bag
          </span>
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          Loja em Breve
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs text-center font-medium">
          Novos itens, avatares e bônus estarão disponíveis em breve. Acumule moedas estudando!
        </p>
      </div>
    );
    if (activeTab === Tab.MAIS) return <MoreView onNavigateToTab={setActiveTab} />;
    if (activeTab === Tab.CONFIGURACOES) return <SettingsView onBack={() => setActiveTab(Tab.INICIO)} />;
    if (activeTab === Tab.BATALHA) {
      return <BattleView ref={battleViewRef} subjects={subjects} goals={goals} onManageGoals={() => navigateTo('goalsManagement')} onSubjectClick={(id) => { setSelectedSubjectId(id); setActiveTab(Tab.DETALHES); }} onBattleSelectionClick={() => openModal('battleSelection')} onUpdateSubjects={setSubjects} />;
    }

    // Default to Cycle View (Tab.CICLO)
    return (
      <CycleView
        subjects={displaySubjects}
        isAutoCycle={isAutoCycle}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        onStartStudy={handleStartStudy}
        onAddSubject={() => navigateTo('management')}
        onSelectSubject={(id) => { 
          if (!isEditMode) {
            setSelectedSubjectId(id); 
            setActiveTab(Tab.DETALHES); 
          }
        }}
        onDragStart={handleSubjectDragStart}
        onDragEnter={handleSubjectDragEnter}
        onDragEnd={handleSubjectDragEnd}
        draggedSubjectIndex={draggedSubjectIndex}
        dragOverSubjectIndex={dragOverSubjectIndex}
        onPriorityChange={handlePriorityChange}
        onLevelChange={handleLevelChange}
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Bem-vindo ao Ciclo de Estudos</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Faça login para sincronizar seu progresso, metas e histórico de estudos na nuvem.
          </p>
          <button
            onClick={signInWithGoogle}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
              <path fill="none" d="M1 1h22v22H1z" />
            </svg>
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  if (isFocusMode) {
    return (
      <FocusModeView 
        subjects={subjects} 
        initialSubjectId={focusSubjectId || undefined} 
        initialTopicId={focusTopicId || undefined}
        isAutoCycle={isAutoCycle} 
        pomodoroSettings={pomodoroSettings} 
        setPomodoroSettings={setPomodoroSettings} 
        onBack={() => setIsFocusMode(false)} 
        onAddXP={addXP} 
        onRecordSession={addStudySession}
        studyHistory={studyHistory}
      />
    );
  }

  if (activeModal === 'importJson') {
    return <ImportJsonView onBack={closeModal} subjects={subjects} />;
  }

  if (isTopicManagerOpen && selectedTopic) {
    return (
      <SubTopicDetailView 
        topic={selectedTopic} 
        subjectColor={selectedSubject?.color || '#10B981'} 
        onBack={() => setIsTopicManagerOpen(false)} 
        onUpdateSubTopics={(newSubTopics) => setSubjects(prev => prev.map(s => s.id === selectedSubjectId ? { ...s, topics: s.topics.map(t => t.id === selectedTopicId ? { ...t, subTopics: newSubTopics } : t) } : s))}
      />
    );
  }

  if (isAddingTopic && selectedSubject) {
    return (
      <AddTopicView 
        subject={selectedSubject} 
        onBack={() => setIsAddingTopic(false)} 
        onSave={(name, totalMinutes, icon) => {
          const newTopic: Topic = { 
            id: `t-${crypto.randomUUID()}`, 
            name, 
            icon, 
            totalMinutes,
            studiedMinutes: 0, 
            totalQuestions: 0, 
            completedQuestions: 0, 
            isCompleted: false 
          };
          setSubjects(prev => prev.map(s => s.id === selectedSubjectId ? { ...s, topics: [...s.topics, newTopic] } : s));
          setIsAddingTopic(false);
        }} 
      />
    );
  }

  const getHeaderActions = (): HeaderAction[] | undefined => {
    if (activeTab === Tab.BATALHA) {
      return [
        { text: 'Importar JSON', onClick: () => openModal('importJson'), title: 'Importar Questões via JSON', primary: false },
        { icon: 'add', onClick: () => battleViewRef.current?.handleAddQuestion(), title: 'Adicionar Questão', primary: true },
        { icon: 'tune', onClick: () => battleViewRef.current?.handleOpenQuestionBank(), title: 'Banco de Questões' },
        { icon: 'insights', onClick: () => navigateTo('battleStats'), title: 'Estatísticas' },
        { icon: 'history', onClick: () => navigateTo('battleHistory'), title: 'Histórico' },
        { icon: 'military_tech', onClick: () => navigateTo('achievements'), title: 'Conquistas', color: 'text-slate-900 dark:text-white' },
      ];
    }
    return undefined;
  };

  if (showOnboarding || activeView === 'editalOnboarding') {
    return (
      <StudyPlannerWizard 
        onComplete={() => {
          if (showOnboarding) {
            setShowOnboarding(false);
            localStorage.setItem('has_completed_onboarding', 'true');
          }
          if (activeView === 'editalOnboarding') goBack();
        }} 
        onClose={() => {
          if (showOnboarding) {
            setShowOnboarding(false);
            localStorage.setItem('has_completed_onboarding', 'true');
          }
          if (activeView === 'editalOnboarding') goBack();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-['Inter'] transition-colors duration-300">
      <PWAInstallPrompt />
      <AnimatePresence>
        {activeModal === 'battleSelection' && (
          <BattleSelectionHUD 
            onClose={closeModal} 
            onStartBattle={(room, mode, questionLimit, mixSubjects, selectedSubjectIds, selectedTopicIds, sessionTimeLimit, distributionMode) => {
              setBattleSettings({ room, mode, questionLimit, mixSubjects, selectedSubjectIds, selectedTopicIds, sessionTimeLimit, distributionMode });
              navigateTo('battleQuestion');
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Mobile Navigation Drawer */}
      <SideNavigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobile={true} 
        isOpen={showMobileMenu} 
        setIsOpen={setShowMobileMenu} 
        isCollapsed={false}
        setIsCollapsed={() => {}}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Desktop Sidebar */}
      <div className="flex h-screen overflow-hidden">
        <SideNavigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isMobile={false} 
          isOpen={false} 
          setIsOpen={() => {}} 
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />

        <div className="flex-1 flex flex-col h-full overflow-hidden relative transition-colors duration-300">
          {activeView === 'timeStats' && <TimeStatsView subjects={subjects} onBack={goBack} onStartStudy={handleStartStudy} onSelectSubject={(id) => { setSelectedSubjectId(id); setActiveTab(Tab.DETALHES); goBack(); }} />}
          {activeView === 'battleStats' && <BattleStatsView onBack={goBack} />}
          {activeView === 'notifications' && <NotificationsView onBack={goBack} />}
          {activeView === 'history' && <HistoryView subjects={subjects} studyHistory={studyHistory} userStats={userStats} onBack={goBack} />}
          {activeView === 'battleHistory' && <BattleHistoryView subjects={subjects} studyHistory={studyHistory} userStats={userStats} onBack={goBack} />}
          {activeView === 'management' && <ManagementView subjects={subjects} onBack={goBack} onUpdate={setSubjects} />}
          {activeView === 'goalsManagement' && <GoalsManagementView goals={goals} onBack={goBack} onUpdate={setGoals} />}
          {activeView === 'achievements' && <AchievementsView userStats={userStats} onBack={goBack} />}
          {activeView === 'battleQuestion' && battleSettings && (
            <BattleQuestionView 
              room={battleSettings.room}
              mode={battleSettings.mode as any}
              questionLimit={battleSettings.questionLimit}
              mixSubjects={battleSettings.mixSubjects}
              selectedSubjectIds={battleSettings.selectedSubjectIds}
              selectedTopicIds={battleSettings.selectedTopicIds}
              sessionTimeLimit={battleSettings.sessionTimeLimit}
              distributionMode={battleSettings.distributionMode}
              onBack={goBack} 
            />
          )}
          {activeView === 'sounds' && <PomodoroSoundsView onBack={goBack} />}
          
          {/* Header is now rendered for all tabs to provide menu access */}
          {!isTopicManagerOpen && !isAddingTopic && (
            <Header 
              onBack={activeView !== 'main' ? goBack : undefined}
              onAddSubject={activeTab === Tab.CICLO ? () => navigateTo('management') : undefined} 
              isAutoCycle={isAutoCycle} 
              setIsAutoCycle={setIsAutoCycle} 
              onNotificationsClick={activeTab === Tab.CICLO ? () => navigateTo('notifications') : undefined} 
              onHistoryClick={activeTab === Tab.CICLO ? () => navigateTo('history') : undefined} 
              onStatsClick={activeTab === Tab.CICLO ? () => navigateTo('timeStats') : undefined} 
              onAchievementsClick={activeTab === Tab.CICLO ? () => navigateTo('achievements') : undefined} 
              onSettingsClick={activeTab === Tab.CICLO ? () => navigateTo('management') : undefined} 
              achievementsCount={userStats.unlockedAchievements.length}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              onMenuClick={() => setShowMobileMenu(true)}
              actions={getHeaderActions()}
              userAvatar={activeTab === Tab.BATALHA ? "/default-avatar.svg" : undefined}
              title={
                activeView === 'timeStats' ? "Estatísticas de Tempo" :
                activeView === 'battleStats' ? "Estatísticas de Batalha" :
                activeView === 'notifications' ? "Notificações" :
                activeView === 'history' ? "Histórico de Estudos" :
                activeView === 'battleHistory' ? "Histórico de Batalhas" :
                activeView === 'management' ? "Gerenciar Matérias" :
                activeView === 'goalsManagement' ? "Gerenciar Metas" :
                activeView === 'achievements' ? "Conquistas" :
                activeView === 'sounds' ? "Sons e Alertas" :
                activeTab === Tab.COLISEU ? "Coliseu" :
                activeTab === Tab.BATALHA ? "Batalha" :
                activeTab === Tab.RANKING ? "Ranking" :
                activeTab === Tab.JORNADA ? "Jornada" :
                activeTab === Tab.LOJA ? "Loja" :
                activeTab === Tab.INICIO ? "Início" :
                "Ciclo de Estudos"
              }
              subtitle={
                activeView !== 'main' ? "VISUALIZAÇÃO DETALHADA" :
                activeTab === Tab.COLISEU ? "ARENA DE COMBATE" :
                activeTab === Tab.BATALHA ? "TREINAMENTO E QUESTÕES" :
                activeTab === Tab.RANKING ? "COMPETIÇÃO GLOBAL" :
                activeTab === Tab.JORNADA ? "SEU PROGRESSO" :
                activeTab === Tab.LOJA ? "RECOMPENSAS" :
                activeTab === Tab.INICIO ? "VISÃO GERAL" :
                "V1.0 DESIGN SYSTEM"
              }
              icon={
                activeView === 'timeStats' ? "bar_chart" :
                activeView === 'battleStats' ? "insights" :
                activeView === 'notifications' ? "notifications" :
                activeView === 'history' ? "history" :
                activeView === 'battleHistory' ? "history" :
                activeView === 'management' ? "settings" :
                activeView === 'goalsManagement' ? "flag" :
                activeView === 'achievements' ? "emoji_events" :
                activeView === 'sounds' ? "volume_up" :
                activeTab === Tab.COLISEU ? "stadium" :
                activeTab === Tab.BATALHA ? "swords" :
                activeTab === Tab.RANKING ? "emoji_events" :
                activeTab === Tab.JORNADA ? "map" :
                activeTab === Tab.LOJA ? "shopping_bag" :
                activeTab === Tab.INICIO ? "home" :
                "menu_book"
              }
            />
          )}

          <div className="flex-1 overflow-y-auto no-scrollbar pb-[100px]">
            {renderMainContent()}
          </div>

          {activeTab !== Tab.DETALHES && (activeTab === Tab.CICLO || activeTab === Tab.INICIO) && !isFocusMode && (
            <button onClick={() => handleStartStudy()} className="fixed bottom-6 right-6 w-16 h-16 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
              <span className="material-icons-round text-4xl">
                {isCycleComplete ? 'restart_alt' : 'play_arrow'}
              </span>
            </button>
          )}
        </div>
      </div>
      {showCycleCompleteModal && (
        <CycleCompleteModal 
          onConfirm={resetCycle} 
          onCancel={() => setShowCycleCompleteModal(false)} 
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default App;
