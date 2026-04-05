import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Subject, Tab, PomodoroSettings, StudySession } from '../types';
import { Theme } from '../types/theme.types';
import { SubjectCycleState } from '../types/subjectCycle.types';
import { useApp } from '../contexts/AppContext';
import BottomNav from './BottomNav';
import PomodoroSettingsView from './PomodoroSettingsView';
import PomodoroSoundsView from './PomodoroSoundsView';
import StrictModeActivationView from './StrictModeActivationView';
import SubjectSelectorOverlay from './SubjectSelectorOverlay';
import MissionReportView, { MissionReportData } from './MissionReportView';
import SideNavigation from './SideNavigation';
import TransitionOverlay from './TransitionOverlay';
import DecisionPrompt from './DecisionPrompt';
import { useStudyTimer } from '../hooks/useStudyTimer';
import { useAutoCycleTransition } from '../hooks/useAutoCycleTransition';
import { useManualCycleDecision } from '../hooks/useManualCycleDecision';
import { subjectToThemes, subjectToCycleState } from '../adapters/subjectToTheme';

import { audioService, AmbientSoundType, AlertSoundType } from '../utils/audioService';

interface FocusModeViewProps {
  subjects: Subject[];
  initialSubjectId?: string;
  initialTopicId?: string;
  isAutoCycle?: boolean;
  pomodoroSettings: PomodoroSettings;
  setPomodoroSettings: (settings: PomodoroSettings) => void;
  onBack: () => void;
  onAddXP: (amount: number) => void;
  onRecordSession: (session: {
    subjectId: string;
    subjectName: string;
    topicName: string;
    minutesStudied: number;
    questionsCompleted: number;
    accuracy: number;
    xpEarned: number;
    type: 'foco' | 'batalha' | 'revisao';
    pagesRead?: number;
    pauseMinutes?: number;
    stopPoint?: string;
  }) => void;
  studyHistory?: StudySession[];
}

type TimerMode = 'focus' | 'shortBreak' | 'longBreak' | 'manualPause';

const FocusModeView: React.FC<FocusModeViewProps> = ({ 
  subjects, 
  initialSubjectId, 
  initialTopicId,
  isAutoCycle, 
  pomodoroSettings,
  setPomodoroSettings,
  onBack,
  onAddXP,
  onRecordSession,
  studyHistory = []
}) => {
  const { isDarkMode, setSubjects } = useApp();
  const [isActive, setIsActive] = useState(true);
  const [timerMode, setTimerMode] = useState<TimerMode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(pomodoroSettings.focusTime * 60);
  const [strictMode, setStrictMode] = useState(false);
  const [showStrictActivation, setShowStrictActivation] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CICLO);
  const [activeOverlay, setActiveOverlay] = useState<'settings' | 'sounds' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [showSubjectSelector, setShowSubjectSelector] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [waitingForManualSelection, setWaitingForManualSelection] = useState(false);

  const [sessionFocusSeconds, setSessionFocusSeconds] = useState(0);
  const [sessionPauseSeconds, setSessionPauseSeconds] = useState(0);
  const [showMissionReport, setShowMissionReport] = useState(false);
  const [pendingSubjectSwitch, setPendingSubjectSwitch] = useState<{ subjectId: string, topicIndex: number } | null>(null);
  const [pendingAction, setPendingAction] = useState<'back' | null>(null);

  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [manualPauseStartTime, setManualPauseStartTime] = useState(0);
  const [savedFocusTime, setSavedFocusTime] = useState(0);
  
  const initialIdx = useMemo(() => {
    const idx = subjects.findIndex(s => s.id === initialSubjectId);
    return idx === -1 ? 0 : idx;
  }, [subjects, initialSubjectId]);

  const initialTopicIdx = useMemo(() => {
    if (initialIdx !== -1 && initialTopicId) {
      const subject = subjects[initialIdx];
      const tIdx = subject.topics.findIndex(t => t.id === initialTopicId);
      return tIdx !== -1 ? tIdx : 0;
    }
    return 0;
  }, [subjects, initialIdx, initialTopicId]);

  const [currentSubjectIndex, setCurrentSubjectIndex] = useState<number>(initialIdx);
  const [currentTopicIndex, setCurrentTopicIndex] = useState<number>(initialTopicIdx);
  
  const currentSubject = subjects[currentSubjectIndex];
  const nextSubjectIndex = (currentSubjectIndex + 1) % subjects.length;
  const nextSubject = subjects[nextSubjectIndex];
  const currentTopic = currentSubject?.topics[currentTopicIndex];
  const currentTopicName = currentTopic?.name || 'Geral';

  const defaultTheme: Theme = useMemo(() => ({
    id: 'default',
    subjectId: 'default',
    name: 'Default',
    order: 0,
    goalTime: 60,
    priority: 3,
    accumulatedTime: 0,
    isCompleted: false,
    completionSource: null,
    subtopics: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }), []);

  const defaultCycleState: SubjectCycleState = useMemo(() => ({
    subjectId: 'default',
    rotationIndex: 1,
    cycleGoalTime: 60,
    currentCycleTime: 0,
    excessTime: 0,
    activeThemeId: null,
    isRotationCompleted: false,
    startedAt: null,
    completedAt: null,
  }), []);

  // Inside the component, derive the new model from the current subject:
  const activeTheme = currentSubject ? (subjectToThemes(currentSubject)[0] ?? defaultTheme) : defaultTheme;
  const cycleState = currentSubject ? subjectToCycleState(currentSubject) : defaultCycleState;

  const autoTransition = useAutoCycleTransition({
    isAutoCycle: isAutoCycle ?? false,
    isPomodoroComplete: timerMode !== 'focus' || !isActive,
    activeTheme,
    onAdvance: () => {
      quickSwitchToNext();
    },
    onTransitionCancelled: () => {
      // User cancelled auto-transition
    }
  });

  const manualDecision = useManualCycleDecision({
    isAutoCycle: isAutoCycle ?? false,
    activeTheme,
    nextSubjectName: nextSubject?.name || null,
    onContinue: () => {
      // continue studying current subject
    },
    onChangeSubject: () => {
      quickSwitchToNext();
    }
  });

  const studyTimer = useStudyTimer({
    subjectCycleState: cycleState,
    activeTheme,
    onCycleGoalReached: () => {
      if (isAutoCycle) {
        autoTransition.triggerTransition();
      } else {
        manualDecision.triggerDecision();
      }
    },
    onTick: (updatedCycleState, updatedTheme) => {
      if (!currentSubject) return;

      setSubjects(prev => prev.map(s => {
        if (s.id === updatedCycleState.subjectId) {
          return {
            ...s,
            studiedMinutes: updatedCycleState.currentCycleTime + updatedCycleState.excessTime,
            topics: s.topics.map(t => {
              if (t.id === updatedTheme.id) {
                return {
                  ...t,
                  studiedMinutes: updatedTheme.accumulatedTime,
                  isCompleted: updatedTheme.isCompleted
                };
              }
              return t;
            })
          };
        }
        return s;
      }));
    },
  });

  useEffect(() => {
    if (currentSubject && isActive && timerMode === 'focus') {
      studyTimer.start();
    } else {
      studyTimer.pause();
    }
  }, [currentSubject, isActive, timerMode, studyTimer.start, studyTimer.pause]);

  const lastStopPoint = useMemo(() => {
    if (!currentSubject || !studyHistory) return null;
    
    // Filter history for current subject and topic
    const relevantSessions = studyHistory.filter(session => 
      session.subjectId === currentSubject.id && 
      session.topicName === currentTopicName &&
      session.stopPoint
    );
    
    // Sort by date descending to get the most recent one
    const sortedSessions = relevantSessions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return sortedSessions.length > 0 ? sortedSessions[0].stopPoint : null;
  }, [currentSubject, currentTopicName, studyHistory]);

  const performSubjectChange = (subjectId: string, topicIndex: number) => {
    const newSubjectIndex = subjects.findIndex(s => s.id === subjectId);
    if (newSubjectIndex !== -1) {
      setCurrentSubjectIndex(newSubjectIndex);
      setCurrentTopicIndex(topicIndex);
      setWaitingForManualSelection(false);
      setSessionFocusSeconds(0);
      setSessionPauseSeconds(0);
      
      showNotification(
        '📚 Matéria selecionada!',
        `Pronto para estudar: ${subjects[newSubjectIndex].name}`
      );

      if (pomodoroSettings.autoStartPomodoros) {
         setTimeout(() => setIsActive(true), 500);
      } else {
         setIsActive(false);
      }
    }
  };

  const handleSubjectChange = (subjectId: string, topicIndex: number = 0) => {
    // If we are waiting for selection (e.g. after a timer finished), just switch.
    // The previous session was already saved by handleTimerComplete.
    if (waitingForManualSelection) {
      performSubjectChange(subjectId, topicIndex);
      return;
    }

    // Always show report to allow saving (even if 0s, user can edit), satisfying the request
    // "Todas as vezes que o usuario clicar em mudar de matéria deve aparecer a tela de salvar"
    setIsActive(false);
    setPendingSubjectSwitch({ subjectId, topicIndex });
    setShowMissionReport(true);
    setShowSubjectSelector(false);
  };

  const quickSwitchToNext = () => {
    if (strictMode || waitingForManualSelection) return;
    const nextIdx = (currentSubjectIndex + 1) % subjects.length;
    const nextSubjectId = subjects[nextIdx].id;
    handleSubjectChange(nextSubjectId, 0);
  };

  const handleStopSession = () => {
    if (sessionFocusSeconds > 0) {
      setIsActive(false);
      setPendingAction('back');
      setShowMissionReport(true);
    } else {
      onBack();
    }
  };

  const handleReportSave = (data: MissionReportData) => {
    if (currentSubject) {
      // Helper to parse time string "MM:SS" or "MM" to minutes
      const parseTimeToMinutes = (timeStr: string) => {
        if (!timeStr) return 0;
        const parts = timeStr.split(':');
        if (parts.length === 2) {
          return parseInt(parts[0]) + parseInt(parts[1]) / 60;
        }
        return parseInt(timeStr) || 0;
      };

      const minutesStudied = data.focusTime 
        ? Math.round(parseTimeToMinutes(data.focusTime)) 
        : Math.floor(sessionFocusSeconds / 60);

      const pauseMinutes = data.pauseTime 
        ? Math.round(parseTimeToMinutes(data.pauseTime)) 
        : Math.floor(sessionPauseSeconds / 60);

      // Calculate XP roughly based on time if not using pomodoros
      const xpEarned = minutesStudied * (strictMode ? 3 : 2);

      onRecordSession({
        subjectId: currentSubject.id,
        subjectName: currentSubject.name,
        topicName: currentTopicName,
        minutesStudied: minutesStudied,
        questionsCompleted: data.exercises,
        accuracy: 100,
        xpEarned: xpEarned,
        type: 'foco',
        pagesRead: data.pages,
        pauseMinutes: pauseMinutes,
        stopPoint: data.stopPoint
      });
    }

    setShowMissionReport(false);
    setSessionFocusSeconds(0);
    setSessionPauseSeconds(0);

    if (pendingAction === 'back') {
      onBack();
    } else if (pendingSubjectSwitch) {
      performSubjectChange(pendingSubjectSwitch.subjectId, pendingSubjectSwitch.topicIndex);
      setPendingSubjectSwitch(null);
    }
    setPendingAction(null);
  };

  const handleReportDiscard = () => {
    setShowMissionReport(false);
    setSessionFocusSeconds(0);
    setSessionPauseSeconds(0);

    if (pendingAction === 'back') {
      onBack();
    } else if (pendingSubjectSwitch) {
      performSubjectChange(pendingSubjectSwitch.subjectId, pendingSubjectSwitch.topicIndex);
      setPendingSubjectSwitch(null);
    }
    setPendingAction(null);
  };

  const modeConfig = useMemo(() => {
    if (timerMode === 'focus') {
      return {
        label: strictMode ? 'Modo Estrito' : 'Modo Foco',
        status: strictMode ? 'ESTRITO ATIVO' : 'FOCO ATIVO',
        color: strictMode ? '#EF4444' : '#3B82F6',
        bgClass: strictMode ? 'bg-[#FDF2F2]' : 'bg-slate-50',
        brandText: strictMode ? 'text-red-600' : 'text-blue-500',
        brandBg: strictMode ? 'bg-red-600' : 'bg-blue-500',
        brandShadow: strictMode ? 'shadow-red-500/30' : 'shadow-blue-500/30',
        totalSeconds: pomodoroSettings.focusTime * 60,
        icon: strictMode ? 'lock' : 'psychology',
        rotation: 'normal'
      };
    } else if (timerMode === 'shortBreak') {
      return {
        label: 'Pausa Curta',
        status: 'DESCANSO CURTO',
        color: '#06B6D4',
        bgClass: 'bg-cyan-50/30',
        brandText: 'text-cyan-600',
        brandBg: 'bg-cyan-500',
        brandShadow: 'shadow-cyan-500/30',
        totalSeconds: pomodoroSettings.shortBreak * 60,
        icon: 'coffee',
        rotation: 'normal'
      };
    } else if (timerMode === 'longBreak') {
      return {
        label: 'Pausa Longa',
        status: 'DESCANSO LONGO',
        color: '#8B5CF6',
        bgClass: 'bg-purple-50/30',
        brandText: 'text-purple-600',
        brandBg: 'bg-purple-500',
        brandShadow: 'shadow-purple-500/30',
        totalSeconds: pomodoroSettings.longBreak * 60,
        icon: 'spa',
        rotation: 'normal'
      };
    } else {
      return {
        label: 'Pausa Manual',
        status: 'PAUSA ATIVA',
        color: '#F59E0B',
        bgClass: 'bg-amber-50/30',
        brandText: 'text-amber-600',
        brandBg: 'bg-amber-500',
        brandShadow: 'shadow-amber-500/30',
        totalSeconds: 3600,
        icon: 'pause_circle',
        rotation: 'reverse'
      };
    }
  }, [timerMode, strictMode, pomodoroSettings]);

  useEffect(() => {
    if (isActive && timerMode === 'focus' && pomodoroSettings.ambientSound !== 'none') {
      audioService.setVolume(pomodoroSettings.volume);
      audioService.playAmbient(pomodoroSettings.ambientSound as AmbientSoundType);
    } else {
      audioService.stopAmbient();
    }
    return () => {
      audioService.stopAmbient();
    };
  }, [isActive, timerMode, pomodoroSettings.ambientSound, pomodoroSettings.volume]);

  // Authoritative timer logic — StudyContext.tsx was removed (dead code).
  // All timer state lives here. Do not duplicate elsewhere.
  const handleTimerComplete = useCallback(() => {
    if (timerMode === 'focus') {
      audioService.playAlert(pomodoroSettings.alertSound as AlertSoundType);
      const newCompletedCount = completedPomodoros + 1;
      setCompletedPomodoros(newCompletedCount);
      
      const xpEarned = strictMode ? 180 : 120;
      onAddXP(xpEarned);

      // ✨ PASSO 3.3: Registrar Sessão no Histórico
      if (currentSubject) {
        onRecordSession({
          subjectId: currentSubject.id,
          subjectName: currentSubject.name,
          topicName: currentTopicName,
          minutesStudied: pomodoroSettings.focusTime,
          questionsCompleted: 0,
          accuracy: 0,
          xpEarned: xpEarned,
          type: 'foco',
          pagesRead: 0,
          pauseMinutes: 0
        });
      }

      const isLongBreakTime = newCompletedCount % pomodoroSettings.pomodorosUntilLongBreak === 0;
      const nextBreakMode = isLongBreakTime ? 'longBreak' : 'shortBreak';
      const nextBreakTime = isLongBreakTime 
        ? pomodoroSettings.longBreak * 60 
        : pomodoroSettings.shortBreak * 60;
      
      showNotification(
        `Pomodoro ${newCompletedCount} concluído! 🎉 (+${xpEarned} XP)`,
        isLongBreakTime
          ? `Parabéns! Hora da pausa longa (${pomodoroSettings.longBreak}min)`
          : pomodoroSettings.autoStartBreaks 
            ? `Iniciando pausa curta (${pomodoroSettings.shortBreak}min)...`
            : 'Hora de fazer uma pausa!'
      );
      
      if (pomodoroSettings.autoStartBreaks) {
        setIsTransitioning(true);
        setTimeout(() => {
          setTimerMode(nextBreakMode as 'shortBreak' | 'longBreak');
          setSecondsLeft(nextBreakTime);
          setIsActive(true);
          setIsTransitioning(false);
          if (strictMode) setStrictMode(false);
        }, 1500);
      } else {
        setTimerMode(nextBreakMode as 'shortBreak' | 'longBreak');
        setSecondsLeft(nextBreakTime);
        setIsActive(false);
        if (strictMode) setStrictMode(false);
      }
      
    } else if (timerMode === 'shortBreak' || timerMode === 'longBreak') {
      const isLong = timerMode === 'longBreak';
      audioService.playAlert((isLong ? pomodoroSettings.longBreakEndSound : pomodoroSettings.shortBreakEndSound) as AlertSoundType);
      const breakType = isLong ? 'longa' : 'curta';
      
      if (isAutoCycle) {
        showNotification(
          `Pausa ${breakType} concluída! ⏰`,
          pomodoroSettings.autoStartPomodoros 
            ? 'Voltando ao foco automaticamente...' 
            : 'Pronto para voltar ao foco?'
        );
        
        if (currentSubject && currentTopicIndex < currentSubject.topics.length - 1) {
          setCurrentTopicIndex(prev => prev + 1);
        } else {
          const nextIdx = (currentSubjectIndex + 1) % subjects.length;
          setCurrentSubjectIndex(nextIdx);
          setCurrentTopicIndex(0);
        }
        
        if (pomodoroSettings.autoStartPomodoros) {
          setIsTransitioning(true);
          setTimeout(() => {
            setTimerMode('focus');
            setSecondsLeft(pomodoroSettings.focusTime * 60);
            setIsActive(true);
            setIsTransitioning(false);
          }, 1500);
        } else {
          setTimerMode('focus');
          setSecondsLeft(pomodoroSettings.focusTime * 60);
          setIsActive(false);
        }
      } else {
        showNotification(
          `Pausa ${breakType} concluída! ⏰`,
          'Selecione a próxima matéria para continuar estudando'
        );
        setTimerMode('focus');
        setSecondsLeft(pomodoroSettings.focusTime * 60);
        setIsActive(false);
        setWaitingForManualSelection(true);
        setShowSubjectSelector(true);
      }
    }
  }, [
    timerMode,
    completedPomodoros,
    strictMode,
    onAddXP,
    currentSubject,
    onRecordSession,
    currentTopicName,
    pomodoroSettings,
    isAutoCycle,
    currentTopicIndex,
    currentSubjectIndex,
    subjects
  ]);

  const handlePlayPauseClick = () => {
    if (waitingForManualSelection) {
      setShowSubjectSelector(true);
      return;
    }

    if (timerMode === 'focus' && isActive) {
      setSavedFocusTime(secondsLeft);
      setManualPauseStartTime(0);
      setTimerMode('manualPause');
      setIsActive(true);
    } else if (timerMode === 'manualPause') {
      setTimerMode('focus');
      setSecondsLeft(savedFocusTime);
      setIsActive(true);
    } else {
      setIsActive(!isActive);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isActive && !waitingForManualSelection) {
      if (timerMode === 'manualPause') {
        interval = setInterval(() => {
          setManualPauseStartTime(p => p + 1);
          setSessionPauseSeconds(s => s + 1);
        }, 1000);
      } else if (secondsLeft > 0) {
        interval = setInterval(() => {
          setSecondsLeft(s => Math.max(0, s - 1));
          if (timerMode === 'focus') {
            setSessionFocusSeconds(s => s + 1);
          } else {
            setSessionPauseSeconds(s => s + 1);
          }
        }, 1000);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timerMode, waitingForManualSelection, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0 && isActive && timerMode !== 'manualPause') {
      setIsActive(false); // Stop immediately to prevent re-entry
      handleTimerComplete();
    }
  }, [secondsLeft, isActive, timerMode, handleTimerComplete]);

  useEffect(() => {
    if (!isTransitioning && timerMode !== 'manualPause') {
      const configTime = timerMode === 'focus' ? pomodoroSettings.focusTime : (timerMode === 'longBreak' ? pomodoroSettings.longBreak : pomodoroSettings.shortBreak);
      if (secondsLeft > configTime * 60) {
        setSecondsLeft(configTime * 60);
      }
    }
  }, [pomodoroSettings, timerMode]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (timerMode !== 'focus') return;
    if (!strictMode) setShowStrictActivation(true);
    else setStrictMode(false);
  };

  const handleActivateStrict = () => {
    setStrictMode(true);
    setShowStrictActivation(false);
  };

  const handleResetPomodoros = () => {
    setCompletedPomodoros(0);
    showNotification('Contador resetado', 'Começando nova série de pomodoros');
  };

  if (activeOverlay === 'settings') {
    return (
      <PomodoroSettingsView 
        currentSettings={pomodoroSettings}
        onSave={(newSettings) => {
          setPomodoroSettings(newSettings);
          setActiveOverlay(null);
        }}
        onBack={() => setActiveOverlay(null)} 
      />
    );
  }

  if (activeOverlay === 'sounds') {
    return <PomodoroSoundsView onBack={() => setActiveOverlay(null)} />;
  }

  const progressToLongBreak = completedPomodoros % pomodoroSettings.pomodorosUntilLongBreak;
  const nextLongBreakIn = pomodoroSettings.pomodorosUntilLongBreak - progressToLongBreak;

  return (
    <div className={`fixed inset-0 z-[120] flex h-screen animate-in fade-in slide-in-from-bottom duration-500 transition-colors duration-700 ${isDarkMode ? 'bg-slate-950' : modeConfig.bgClass}`}>
      
      {/* Mobile Navigation Drawer */}
      <SideNavigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobile={true} 
        isOpen={showMobileMenu} 
        setIsOpen={setShowMobileMenu} 
        isCollapsed={false}
        setIsCollapsed={() => {}}
        activeColor={modeConfig.brandText}
      />

      {/* Desktop Sidebar */}
      <SideNavigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobile={false} 
        isOpen={false} 
        setIsOpen={() => {}} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        activeColor={modeConfig.brandText}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto no-scrollbar pb-[100px]">
      
      {showSubjectSelector && (
        <SubjectSelectorOverlay
          subjects={subjects}
          currentSubjectId={currentSubject?.id}
          onSelectSubject={handleSubjectChange}
          onClose={() => {
            if (!waitingForManualSelection) {
              setShowSubjectSelector(false);
            }
          }}
          isRequired={waitingForManualSelection}
        />
      )}

      <TransitionOverlay 
        transitionState={autoTransition.transitionState} 
        activeThemeName={activeTheme.name}
        onCancel={() => autoTransition.cancelTransition()}
      />
      
      <DecisionPrompt 
        decisionState={manualDecision.decisionState}
        activeThemeName={activeTheme.name}
        nextSubjectName={nextSubject?.name || null}
        onContinue={manualDecision.handleContinue}
        onChangeSubject={manualDecision.handleChangeSubject}
      />

      {showMissionReport && currentSubject && (
        <MissionReportView
          subjectName={currentSubject.name}
          topicName={currentTopicName}
          totalTime={formatTime(sessionFocusSeconds + sessionPauseSeconds)}
          focusTime={formatTime(sessionFocusSeconds)}
          pauseTime={formatTime(sessionPauseSeconds)}
          onSave={handleReportSave}
          onBack={() => setShowMissionReport(false)}
          onDiscard={handleReportDiscard}
        />
      )}

      {showStrictActivation && (
        <StrictModeActivationView onActivate={handleActivateStrict} onCancel={() => setShowStrictActivation(false)} />
      )}

      {showQueue && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-[140] animate-in fade-in duration-300"
            onClick={() => setShowQueue(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-[150] animate-in slide-in-from-right duration-300 border-l border-slate-100 dark:border-slate-800 p-6 overflow-y-auto">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Fila de Estudo</h2>
                <button onClick={() => setShowQueue(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <span className="material-icons-round text-slate-500">close</span>
                </button>
             </div>
             
             <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between mb-4 px-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Próximas Matérias</span>
                  {isAutoCycle && <span className={`text-[10px] font-black ${timerMode === 'focus' ? 'text-blue-500' : 'text-cyan-500'} uppercase`}>Ciclo Ativo</span>}
                </div>
                
                <div className="flex flex-col gap-3">
                  {subjects.map((s, idx) => {
                    const isCurrent = idx === currentSubjectIndex;
                    return (
                      <div 
                        key={s.id} 
                        onClick={() => {
                          if (!strictMode && !waitingForManualSelection) {
                            handleSubjectChange(s.id);
                            setShowQueue(false);
                          }
                        }}
                        className={`flex gap-4 items-center p-3 rounded-xl transition-all duration-300 cursor-pointer ${isCurrent ? 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all ${isCurrent ? 'shadow-sm' : ''}`} style={{ borderColor: isCurrent ? s.color : 'transparent', backgroundColor: isCurrent ? `${s.color}15` : (isDarkMode ? '#1e293b' : '#F8FAFC'), color: s.color }}>
                          <span className="material-icons-round text-xl">{s.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm font-bold truncate ${isCurrent ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{s.name}</h3>
                          {isCurrent && (
                            <p className={`text-[10px] font-black uppercase tracking-tighter ${timerMode === 'focus' ? 'text-blue-500' : 'text-purple-500'}`}>
                              {timerMode === 'focus' ? (waitingForManualSelection ? 'Aguardando Seleção...' : `Foco: ${currentTopicName}`) : 'Pausa Ativa'}
                            </p>
                          )}
                        </div>
                        {isCurrent && (
                          <div className="flex items-center gap-1 animate-bounce">
                            <span className={`w-1.5 h-1.5 rounded-full ${timerMode === 'focus' ? 'bg-blue-500' : 'bg-purple-500'}`}></span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
             </div>
          </div>
        </>
      )}

      {isTransitioning && (
        <div className="fixed inset-0 z-[130] bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="text-6xl mb-4 animate-bounce">
            {timerMode === 'focus' ? (completedPomodoros % pomodoroSettings.pomodorosUntilLongBreak === 0 ? '🧘' : '☕') : '🎯'}
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${timerMode === 'focus' ? (completedPomodoros % pomodoroSettings.pomodorosUntilLongBreak === 0 ? 'text-purple-600' : 'text-cyan-600') : 'text-blue-600'}`}>
            {timerMode === 'focus' ? (completedPomodoros % pomodoroSettings.pomodorosUntilLongBreak === 0 ? 'Iniciando Pausa Longa...' : 'Iniciando Pausa Curta...') : 'Voltando ao Foco...'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Preparando o próximo ciclo</p>
          <div className="w-48 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mt-6 overflow-hidden">
            <div className={`h-full animate-pulse ${timerMode === 'focus' ? (completedPomodoros % pomodoroSettings.pomodorosUntilLongBreak === 0 ? 'bg-purple-500' : 'bg-cyan-500') : 'bg-blue-500'}`} style={{ width: '60%', animation: 'loading 1.5s infinite' }}></div>
          </div>
        </div>
      )}

      <header className={`sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b px-4 py-3 shrink-0 transition-colors duration-700 ${strictMode ? 'border-red-100 dark:border-red-900/30' : timerMode === 'longBreak' ? 'border-purple-100 dark:border-purple-900/30' : timerMode === 'shortBreak' ? 'border-cyan-100 dark:border-cyan-900/30' : timerMode === 'manualPause' ? 'border-amber-100 dark:border-amber-900/30' : 'border-slate-200 dark:border-slate-800'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowMobileMenu(true)} className="md:hidden text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors w-12 h-12 flex items-center justify-center -ml-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full active:scale-95">
              <span className="material-icons-round">menu</span>
            </button>
            <button onClick={onBack} className="hidden md:flex text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors w-12 h-12 items-center justify-center -ml-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full active:scale-95" disabled={strictMode}>
              <span className="material-icons-round">arrow_back_ios_new</span>
            </button>
            


            <div className="hidden lg:block min-w-0">
              <h1 className={`text-lg font-bold leading-tight truncate transition-colors duration-700 ${modeConfig.brandText}`}>
                {modeConfig.label}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                {currentSubject?.name || 'Matéria'} - {timerMode === 'focus' ? currentTopicName : 'Descansando'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 md:gap-3">
            {!isAutoCycle && (
              <div className="hidden sm:flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-full border shadow-sm">
                <span className="material-icons-round text-amber-600 dark:text-amber-500 text-sm">touch_app</span>
                <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-tighter">Modo Manual</span>
              </div>
            )}

            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border ${timerMode === 'longBreak' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800' : timerMode === 'shortBreak' ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-100 dark:border-cyan-800' : timerMode === 'manualPause' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800'}`}>
              <span className={`material-icons-round text-sm ${timerMode === 'longBreak' ? 'text-purple-500' : timerMode === 'shortBreak' ? 'text-cyan-500' : timerMode === 'manualPause' ? 'text-amber-500' : 'text-blue-500'}`}>
                {timerMode === 'longBreak' ? 'spa' : timerMode === 'manualPause' ? 'pause_circle' : 'local_fire_department'}
              </span>
              <span className={`text-[10px] font-black uppercase tracking-tighter ${timerMode === 'longBreak' ? 'text-purple-600' : timerMode === 'shortBreak' ? 'text-cyan-600' : timerMode === 'manualPause' ? 'text-amber-600' : 'text-blue-600'}`}>
                {timerMode === 'manualPause' ? 'Pausado' : `${completedPomodoros}/${progressToLongBreak + nextLongBreakIn}`}
              </span>
            </div>
            
            {timerMode === 'focus' && (
              <button onClick={handleToggleClick} className={`flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-2xl border transition-all duration-300 ${strictMode ? 'bg-orange-500 border-orange-600 shadow-md' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-orange-300'}`}>
                <span className={`material-icons-round text-sm ${strictMode ? 'text-white' : 'text-orange-500'}`}>lock</span>
                <span className={`text-[9px] font-black uppercase tracking-tight hidden sm:block ${strictMode ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>Estrito</span>
                <div className={`w-7 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${strictMode ? 'bg-orange-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform transform ${strictMode ? 'translate-x-3' : 'translate-x-0'}`} />
                </div>
              </button>
            )}

            <button onClick={() => setShowQueue(true)} className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><span className="material-icons-round text-xl">format_list_bulleted</span></button>
            <button onClick={() => setActiveOverlay('sounds')} className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><span className="material-icons-round text-xl">volume_up</span></button>
            <button onClick={() => setActiveOverlay('settings')} className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><span className="material-icons-round text-xl">tune</span></button>

            <div className={`px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-sm font-bold border shadow-sm whitespace-nowrap flex items-center gap-1 ${timerMode === 'focus' ? (strictMode ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800') : timerMode === 'longBreak' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800' : timerMode === 'manualPause' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800' : 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-800'}`}>
              {timerMode === 'focus' ? 'Foco' : timerMode === 'longBreak' ? 'Pausa Longa' : timerMode === 'manualPause' ? 'Pausado' : 'Descanso'}
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 md:py-10 max-w-2xl mx-auto w-full flex flex-col gap-8 md:gap-10 flex-1 relative z-10">
        <div className="flex flex-col gap-8 md:gap-10 w-full">
          
          {waitingForManualSelection && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-300 dark:border-amber-800 p-4 md:p-6 rounded-3xl shadow-lg animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                  <span className="material-icons-round text-white text-2xl">touch_app</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-black text-amber-900 dark:text-amber-100">⏸️ Aguardando Seleção</h3>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">Escolha a próxima matéria para continuar.</p>
                </div>
                <button
                  onClick={() => setShowSubjectSelector(true)}
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md active:scale-95"
                >
                  Selecionar
                </button>
              </div>
            </div>
          )}



          <div className="grid grid-cols-3 gap-3 md:gap-6">
            <StatCard icon="refresh" label="Modo" value={timerMode === 'focus' ? 'Estudo' : timerMode === 'longBreak' ? 'Pausa L' : timerMode === 'manualPause' ? 'Pausado' : 'Pausa C'} iconColor={timerMode === 'focus' ? 'text-violet-500' : timerMode === 'longBreak' ? 'text-purple-500' : timerMode === 'manualPause' ? 'text-amber-500' : 'text-cyan-500'} />
            <StatCard icon="schedule" label="Tempo Total" value={timerMode === 'manualPause' ? '∞' : `${modeConfig.totalSeconds / 60}m`} iconColor={timerMode === 'longBreak' ? 'text-purple-500' : timerMode === 'shortBreak' ? 'text-cyan-500' : timerMode === 'manualPause' ? 'text-amber-500' : 'text-blue-500'} />
            <StatCard icon="military_tech" label="XP" value={timerMode === 'focus' ? "+120 XP" : timerMode === 'manualPause' ? 'Pausado' : "Relaxe"} iconColor="text-amber-500" valueColor="text-amber-500" ring={strictMode} />
          </div>

          <section className="flex flex-col items-center justify-center py-4">
            <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-[400px] lg:h-[400px] flex items-center justify-center transition-all duration-700">
              <svg className={`absolute inset-0 w-full h-full transition-transform duration-700 ${modeConfig.rotation === 'reverse' ? 'rotate-90' : '-rotate-90'}`}>
                <circle cx="50%" cy="50%" fill="transparent" r="45%" stroke={isDarkMode ? '#1e293b' : '#F1F5F9'} strokeWidth="8" className="origin-center"></circle>
                <circle 
                  className={`transition-all duration-1000 ease-linear origin-center ${strictMode ? 'timer-progress' : ''}`}
                  cx="50%" cy="50%" fill="transparent" r="45%" 
                  stroke={modeConfig.color} 
                  strokeDasharray="280%" 
                  strokeDashoffset={timerMode === 'manualPause' ? `${280 - (manualPauseStartTime / 300) * 280 % 280}%` : `${280 - (secondsLeft / modeConfig.totalSeconds) * 280}%`}
                  strokeLinecap="round" strokeWidth="10"
                ></circle>
              </svg>
              <div className="text-center z-10">
                <span className={`material-icons-round ${modeConfig.brandText} text-xl block mb-[-4px]`}>{modeConfig.icon}</span>
                <span className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter transition-all tabular-nums text-slate-900 dark:text-white">
                  {timerMode === 'manualPause' ? formatTime(manualPauseStartTime) : formatTime(secondsLeft)}
                </span>
                <div className="flex flex-col items-center justify-center gap-1 mt-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full transition-colors duration-700 ${isActive && !waitingForManualSelection ? (timerMode === 'focus' ? 'bg-emerald-500' : timerMode === 'longBreak' ? 'bg-purple-500' : timerMode === 'manualPause' ? 'bg-amber-500' : 'bg-cyan-500') : 'bg-amber-500'} animate-pulse`}></span>
                    <span className={`text-[10px] md:text-sm font-bold uppercase tracking-widest transition-colors duration-700 ${isActive && !waitingForManualSelection ? modeConfig.status : (waitingForManualSelection ? 'Seleção Obrigatória' : 'Timer Pausado')} `}>
                      {isActive && !waitingForManualSelection ? modeConfig.status : (waitingForManualSelection ? 'Aguardando Escolha' : 'Timer Pausado')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-3 md:flex items-center justify-items-center md:justify-center gap-4 md:gap-8 py-2 w-full max-w-md md:max-w-none mx-auto">
            {/* Skip Button - Order 1 */}
            <button 
              onClick={handleTimerComplete} 
              className={`order-1 md:order-1 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all ${strictMode || waitingForManualSelection ? 'opacity-50 cursor-not-allowed' : 'active:scale-90 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-500 dark:hover:text-blue-400'}`} 
              disabled={strictMode || waitingForManualSelection} 
              title="Pular etapa"
            >
              <span className="material-icons-round text-2xl">skip_next</span>
            </button>
            
            {/* Switch Subject Button - Order 4 (Mobile Row 2), Order 2 (Desktop) */}
            <button
              onClick={() => !strictMode && setShowSubjectSelector(true)}
              disabled={strictMode}
              className={`order-4 md:order-2 col-span-3 w-full md:w-auto group relative flex items-center justify-center md:justify-start gap-4 px-6 md:px-10 py-4 md:py-5 rounded-3xl transition-all duration-300 ${
                strictMode 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50' 
                  : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:scale-105 active:scale-95'
              }`}
              title="Trocar matéria"
            >
              <div className="flex flex-col items-start gap-1 text-left min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${strictMode ? 'text-slate-400 dark:text-slate-600' : 'text-white/60'}`}>Atual:</span>
                  <span className={`text-sm font-black truncate max-w-[100px] sm:max-w-[150px] ${strictMode ? 'text-slate-50 dark:text-slate-700' : 'text-white'}`}>
                    {currentSubject?.name || '...'}
                  </span>
                </div>
                {!strictMode && (
                  <div className="flex items-center gap-2 opacity-70">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Próxima:</span>
                    <span className="text-[11px] font-bold truncate max-w-[100px] sm:max-w-[150px] text-white/80">
                      {nextSubject?.name || '...'}
                    </span>
                  </div>
                )}
              </div>
              {!strictMode && (
                <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/20 transition-transform group-hover:translate-x-1">
                  <span className="material-icons-round">arrow_forward</span>
                </div>
              )}
            </button>

            {/* Play/Pause Button - Order 2 (Mobile), Order 3 (Desktop) */}
            <button 
              onClick={handlePlayPauseClick} 
              className={`order-2 md:order-3 w-20 h-20 md:w-28 md:h-28 flex items-center justify-center rounded-full text-white shadow-2xl active:scale-95 transition-all hover:scale-105 duration-700 ${modeConfig.brandBg} ${modeConfig.brandShadow} ${strictMode ? 'border-4 border-white dark:border-slate-900' : ''}`}
            >
              <span className="material-icons-round text-4xl md:text-6xl">{isActive && timerMode !== 'manualPause' && !waitingForManualSelection ? 'pause' : 'play_arrow'}</span>
            </button>
            
            {/* Stop Button - Order 3 (Mobile), Order 4 (Desktop) */}
            <button 
              onClick={handleStopSession} 
              className={`order-3 md:order-4 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all ${strictMode ? 'opacity-50 cursor-not-allowed' : 'active:scale-90 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-500 dark:hover:text-rose-400'}`} 
              disabled={strictMode}
            >
              <span className="material-icons-round text-2xl">stop</span>
            </button>
          </div>

          {lastStopPoint && (
            <div className="w-full bg-blue-50/50 dark:bg-blue-900/10 border-2 border-blue-400 dark:border-blue-600 rounded-xl p-4 mb-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
              <span className="material-icons-round text-blue-500 text-xl">place</span>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">Último Ponto de Parada</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{lastStopPoint}</p>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Ciclo de Estudo</h3>
              <button onClick={handleResetPomodoros} className="text-xs text-slate-400 dark:text-slate-500 hover:text-blue-500 transition-colors">Resetar</button>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: pomodoroSettings.pomodorosUntilLongBreak }).map((_, idx) => (
                <div key={idx} className={`flex-1 h-3 rounded-full transition-all duration-500 ${idx < progressToLongBreak ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg' : 'bg-slate-200 dark:bg-slate-800'}`} />
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center font-medium">
              {nextLongBreakIn === 0 ? '🎉 Próxima pausa é longa!' : `Faltam ${nextLongBreakIn} foco${nextLongBreakIn > 1 ? 's' : ''} para o próximo descanso`}
            </p>
          </div>
        </div>
      </main>

      <style>{`
        .timer-progress { transition: stroke-dashoffset 0.5s ease; filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.4)); }
        @keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
      `}</style>
      </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: string, label: string, value: string, iconColor: string, valueColor?: string, subValue?: string, ring?: boolean }> = ({ icon, label, value, iconColor, valueColor = "text-slate-900 dark:text-white", subValue, ring }) => (
  <div className={`bg-white dark:bg-slate-900 p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center transition-all duration-500 hover:shadow-md group ${ring ? 'ring-2 ring-amber-400/30' : ''}`}>
    <span className={`material-icons-round ${iconColor} text-xl md:text-3xl mb-1.5 md:mb-2 group-hover:scale-110 transition-transform`}>{icon}</span>
    <span className="text-[9px] md:text-xs uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-wider block mb-0.5">{label}</span>
    <div className="flex flex-col">
      <span className={`text-base md:text-xl font-black leading-tight ${valueColor}`}>{value}</span>
      {subValue && <span className="text-[8px] md:text-[10px] font-bold text-amber-600 mt-0.5">{subValue}</span>}
    </div>
  </div>
);

function playCompletionSound() {
  // Deprecated - using audioService directly in handleTimerComplete
}

function showNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  } else if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export default FocusModeView;