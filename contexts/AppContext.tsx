import React, { createContext, useContext, ReactNode } from 'react';
import { usePersistedState } from '../hooks/usePersistedState';
import { Subject, Goal, PomodoroSettings, UserStats, StudySession, Topic, Question, Tab } from '../types';

interface AppContextType {
  // Dados
  subjects: Subject[];
  goals: Goal[];
  questions: Question[];
  userStats: UserStats;
  pomodoroSettings: PomodoroSettings;
  studyHistory: StudySession[];
  unlockedAchievements: string[];
  
  // Preferências
  activeTab: Tab;
  isAutoCycle: boolean;
  strictModePreference: boolean;
  isDarkMode: boolean;
  unifyTabsPreference: boolean;
  
  // Setters
  setSubjects: (subjects: Subject[] | ((prev: Subject[]) => Subject[])) => void;
  setGoals: (goals: Goal[] | ((prev: Goal[]) => Goal[])) => void;
  setQuestions: (questions: Question[] | ((prev: Question[]) => Question[])) => void;
  setUserStats: (stats: UserStats | ((prev: UserStats) => UserStats)) => void;
  setPomodoroSettings: (settings: PomodoroSettings | ((prev: PomodoroSettings) => PomodoroSettings)) => void;
  setStudyHistory: (history: StudySession[] | ((prev: StudySession[]) => StudySession[])) => void;
  setUnlockedAchievements: (achievements: string[] | ((prev: string[]) => string[])) => void;
  setActiveTab: (tab: Tab | ((prev: Tab) => Tab)) => void;
  setIsAutoCycle: (value: boolean | ((prev: boolean) => boolean)) => void;
  setStrictModePreference: (value: boolean | ((prev: boolean) => boolean)) => void;
  setIsDarkMode: (value: boolean | ((prev: boolean) => boolean)) => void;
  setUnifyTabsPreference: (value: boolean | ((prev: boolean) => boolean)) => void;
  
  // Funções Helper
  updateSubjectTopics: (subjectId: string, newTopics: Topic[]) => void;
  reorderSubjects: (newSubjects: Subject[]) => void;
  addStudySession: (session: Omit<StudySession, 'id' | 'date'>) => void;
  addXP: (amount: number) => void;
  updateDailyStreak: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const persistedState = usePersistedState();
  const { questions, setQuestions, subjects } = persistedState;

  // Global migration for questions (Name -> ID)
  React.useEffect(() => {
    if (questions.length > 0 && subjects.length > 0) {
      let needsMigration = false;
      const migratedQuestions = questions.map(q => {
        let updatedQ = { ...q };
        
        if (!updatedQ.topic) return updatedQ;
        
        // Check if topic is a name instead of an ID
        const isTopicId = subjects.some(s => s.topics.some(t => t.id === updatedQ.topic));
        if (!isTopicId) {
          // Try to find the topic by name
          for (const s of subjects) {
            const foundTopic = s.topics.find(t => t.name === updatedQ.topic);
            if (foundTopic) {
              needsMigration = true;
              updatedQ = { ...updatedQ, topic: foundTopic.id, subject: s.id };
              break;
            }
          }
        }
        return updatedQ;
      });

      if (needsMigration) {
        setQuestions(migratedQuestions);
      }
    }
  }, [questions, subjects, setQuestions]);

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