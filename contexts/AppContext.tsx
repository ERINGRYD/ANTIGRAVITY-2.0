import React, { createContext, useContext, ReactNode } from 'react';
import { usePersistedState } from '../hooks/usePersistedState';
import { useFirebaseSync } from '../hooks/useFirebaseSync';
import { Subject, Goal, PomodoroSettings, UserStats, StudySession, Topic, Question, Tab } from '../types';
import { DEFAULT_QUESTIONS } from '../constants/questionsData';
import { INITIAL_SUBJECTS } from '../constants';

import { Theme } from '../types/theme.types';
import { SubjectCycleState } from '../types/subjectCycle.types';

interface AppContextType {
  // Dados
  subjects: Subject[];
  themes: Theme[];
  cycleStates: SubjectCycleState[];
  goals: Goal[];
  questions: Question[];
  userStats: UserStats;
  pomodoroSettings: PomodoroSettings;
  studyHistory: StudySession[];
  unlockedAchievements: { id: string, unlockedAt: string }[];
  
  // Preferências
  activeTab: Tab;
  isAutoCycle: boolean;
  strictModePreference: boolean;
  isDarkMode: boolean;
  unifyTabsPreference: boolean;
  
  // Setters
  setSubjects: (subjects: Subject[] | ((prev: Subject[]) => Subject[])) => void;
  setThemes: (themes: Theme[] | ((prev: Theme[]) => Theme[])) => void;
  setCycleStates: (states: SubjectCycleState[] | ((prev: SubjectCycleState[]) => SubjectCycleState[])) => void;
  setGoals: (goals: Goal[] | ((prev: Goal[]) => Goal[])) => void;
  setQuestions: (questions: Question[] | ((prev: Question[]) => Question[])) => void;
  setUserStats: (stats: UserStats | ((prev: UserStats) => UserStats)) => void;
  setPomodoroSettings: (settings: PomodoroSettings | ((prev: PomodoroSettings) => PomodoroSettings)) => void;
  setStudyHistory: (history: StudySession[] | ((prev: StudySession[]) => StudySession[])) => void;
  setUnlockedAchievements: (achievements: { id: string, unlockedAt: string }[] | ((prev: { id: string, unlockedAt: string }[]) => { id: string, unlockedAt: string }[])) => void;
  setActiveTab: (tab: Tab | ((prev: Tab) => Tab)) => void;
  setIsAutoCycle: (value: boolean | ((prev: boolean) => boolean)) => void;
  setStrictModePreference: (value: boolean | ((prev: boolean) => boolean)) => void;
  setIsDarkMode: (value: boolean | ((prev: boolean) => boolean)) => void;
  setUnifyTabsPreference: (value: boolean | ((prev: boolean) => boolean)) => void;
  
  // Funções Helper
  addStudySession: (session: Omit<StudySession, 'id' | 'date'>) => void;
  addXP: (amount: number) => void;
  updateDailyStreak: () => void;
  deleteSubject: (subjectId: string) => void;
  deleteTopic: (topicId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const persistedState = usePersistedState();
  const { 
    questions, setQuestions, 
    subjects, setSubjects,
    themes, setThemes,
    cycleStates, setCycleStates,
    goals, setGoals,
    studyHistory, setStudyHistory,
    userStats, setUserStats,
    pomodoroSettings, setPomodoroSettings,
    unlockedAchievements, setUnlockedAchievements
  } = persistedState;

  useFirebaseSync(
    subjects, setSubjects,
    themes, setThemes,
    cycleStates, setCycleStates,
    goals, setGoals,
    questions, setQuestions,
    studyHistory, setStudyHistory,
    userStats, setUserStats,
    pomodoroSettings, setPomodoroSettings,
    unlockedAchievements, setUnlockedAchievements
  );

  // Populate questions if empty
  React.useEffect(() => {
    if (questions.length === 0 && DEFAULT_QUESTIONS.length > 0) {
      console.log('AppContext: Populating questions from DEFAULT_QUESTIONS');
      setQuestions(DEFAULT_QUESTIONS);
    }
  }, [questions.length, setQuestions]);

  return (
    <AppContext.Provider value={persistedState}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};