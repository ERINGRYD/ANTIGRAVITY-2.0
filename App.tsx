import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Tab, Subject, Topic } from './types';
import { useApp } from './contexts/AppContext';
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
import CycleCompleteModal from './components/CycleCompleteModal';
import { AnimatePresence } from 'motion/react';

// --- Cycle Logic Decision Function ---
// Evaluates the current state of subjects and determines the next action.
// Pure function: no side effects.
type Resolution = 
  | { action: 'empty' }
  | { action: 'cycle-complete' }
  | { action: 'resume'; subject: Subject }
  | { action: 'start'; subject: Subject };

function resolveNextSubject(subjects: Subject[]): Resolution {
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
      return { action: 'resume', subject: nextSubject };
    } 
    // 5. Fresh start or normal next subject (Start)
    // If the subject has 0 progress, we start it fresh.
    else {
      return { action: 'start', subject: nextSubject };
    }
  }

  // Fallback (should be covered by step 2, but for safety)
  return { action: 'cycle-complete' };
}

const App: React.FC = () => {
  const {
    subjects, setSubjects,
    goals, setGoals,
    activeTab, setActiveTab,
    isAutoCycle, setIsAutoCycle,
    pomodoroSettings, setPomodoroSettings,
    userStats,
    studyHistory,
    addXP,
    addStudySession,
    updateSubjectTopics,
    isDarkMode, setIsDarkMode
  } = useApp();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Estados de UI (Locais ao App.tsx)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [isTopicManagerOpen, setIsTopicManagerOpen] = useState(false);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [focusSubjectId, setFocusSubjectId] = useState<string | null>(null);
  
  // Navigation state
  const [activeView, setActiveView] = useState<import('./types/navigation.types').ActiveView>('main');
  const [activeModal, setActiveModal] = useState<import('./types/navigation.types').ActiveModal>(null);

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
    selectedTopicIds?: string[]
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

  const handleStartStudy = (subjectId?: string) => {
    // If a specific subject ID is provided (e.g. clicked from a card),
    // we respect that choice and start that specific subject.
    if (subjectId) {
      setFocusSubjectId(subjectId);
      setIsFocusMode(true);
      if (activeView !== 'main') {
        goBack();
      }
      return;
    }

    // Otherwise, we resolve the next subject based on the cycle state.
    const resolution = resolveNextSubject(subjects);

    switch (resolution.action) {
      case 'empty':
        // Do nothing, UI handles empty state
        return;
      case 'cycle-complete':
        handleCycleComplete();
        return;
      case 'resume':
      case 'start':
        if (resolution.subject) {
          setFocusSubjectId(resolution.subject.id);
          setIsFocusMode(true);
          if (activeView !== 'main') {
            goBack();
          }
        }
        return;
    }
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
    if (activeTab === Tab.COLISEU) return <ColiseumView />;
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
      />
    );
  };

  if (isFocusMode) {
    return (
      <FocusModeView 
        subjects={subjects} 
        initialSubjectId={focusSubjectId || undefined} 
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-['Inter'] transition-colors duration-300">
      <AnimatePresence>
        {activeModal === 'battleSelection' && (
          <BattleSelectionHUD 
            onClose={closeModal} 
            onStartBattle={(room, mode, questionLimit, mixSubjects, selectedSubjectIds, selectedTopicIds) => {
              setBattleSettings({ room, mode, questionLimit, mixSubjects, selectedSubjectIds, selectedTopicIds });
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
              onBack={goBack} 
            />
          )}
          {activeView === 'sounds' && <PomodoroSoundsView onBack={goBack} />}
          
          {/* Header is now rendered for all tabs to provide menu access */}
          {!isTopicManagerOpen && !isAddingTopic && (
            <Header 
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
            />
          )}

          <div className="flex-1 overflow-y-auto no-scrollbar pb-[100px]">
            {renderMainContent()}
          </div>

          {activeTab !== Tab.DETALHES && (activeTab === Tab.CICLO || activeTab === Tab.INICIO) && !isFocusMode && !isCycleComplete && (
            <button onClick={() => handleStartStudy()} className="fixed bottom-6 right-6 w-16 h-16 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
              <span className="material-icons-round text-4xl">play_arrow</span>
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
    </div>
  );
};

export default App;
