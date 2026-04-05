import React, { createContext, useContext, ReactNode } from 'react';
import { usePersistedState } from '../hooks/usePersistedState';
import { useFirebaseSync } from '../hooks/useFirebaseSync';
import { Subject, Goal, PomodoroSettings, UserStats, StudySession, Topic, Question, Tab } from '../types';
import { DEFAULT_QUESTIONS } from '../constants/questionsData';
import { INITIAL_SUBJECTS } from '../constants';

interface AppContextType {
  // Dados
  subjects: Subject[];
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
  updateSubjectTopics: (subjectId: string, newTopics: Topic[]) => void;
  reorderSubjects: (newSubjects: Subject[]) => void;
  addStudySession: (session: Omit<StudySession, 'id' | 'date'>) => void;
  addXP: (amount: number) => void;
  updateDailyStreak: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const persistedState = usePersistedState();
  const { 
    questions, setQuestions, 
    subjects, setSubjects,
    goals, setGoals,
    studyHistory, setStudyHistory,
    userStats, setUserStats,
    pomodoroSettings, setPomodoroSettings,
    unlockedAchievements, setUnlockedAchievements
  } = persistedState;

  useFirebaseSync(
    subjects, setSubjects,
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

  // Populate subjects if empty
  React.useEffect(() => {
    // Removed automatic injection of INITIAL_SUBJECTS
  }, [subjects.length, setSubjects]);

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
          // 1. Try to find the topic by name directly (if the topic field already contains the name)
          let foundTopic = null;
          for (const s of subjects) {
            foundTopic = s.topics.find(t => t.name === updatedQ.topic);
            if (foundTopic) {
              needsMigration = true;
              updatedQ = { ...updatedQ, topic: foundTopic.id, subject: s.id };
              break;
            }
          }

          // 2. If not found by name, check if it's an OLD ID from INITIAL_SUBJECTS
          if (!foundTopic) {
            const oldSubject = INITIAL_SUBJECTS.find(s => s.topics.some(t => t.id === updatedQ.topic));
            const oldTopic = oldSubject?.topics.find(t => t.id === updatedQ.topic);
            
            if (oldTopic) {
              // Now find the NEW topic in current subjects by name
              for (const s of subjects) {
                const newTopic = s.topics.find(t => t.name === oldTopic.name);
                if (newTopic) {
                  needsMigration = true;
                  updatedQ = { ...updatedQ, topic: newTopic.id, subject: s.id };
                  break;
                }
              }
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