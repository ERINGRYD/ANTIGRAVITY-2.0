import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { 
  DEFAULT_GOALS, 
  DEFAULT_POMODORO_SETTINGS, 
  DEFAULT_USER_STATS, 
  DEFAULT_SUBJECTS, 
  DEFAULT_STUDY_HISTORY 
} from '../constants/defaultValues';
import { Subject, Goal, PomodoroSettings, UserStats, StudySession, Topic, Tab, Question } from '../types';

export function usePersistedState() {
  const [subjects, setSubjects] = useLocalStorage<Subject[]>(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS);
  const [goals, setGoals] = useLocalStorage<Goal[]>(STORAGE_KEYS.GOALS, DEFAULT_GOALS);
  const [questions, setQuestions] = useLocalStorage<Question[]>(STORAGE_KEYS.QUESTIONS, []);
  const [activeTab, setActiveTab] = useLocalStorage<Tab>(STORAGE_KEYS.ACTIVE_TAB, Tab.INICIO);
  const [isAutoCycle, setIsAutoCycle] = useLocalStorage<boolean>(STORAGE_KEYS.AUTO_CYCLE, true);
  const [pomodoroSettings, setPomodoroSettings] = useLocalStorage<PomodoroSettings>(STORAGE_KEYS.POMODORO_SETTINGS, DEFAULT_POMODORO_SETTINGS);
  const [userStats, setUserStats] = useLocalStorage<UserStats>(STORAGE_KEYS.XP, DEFAULT_USER_STATS);
  const [studyHistory, setStudyHistory] = useLocalStorage<StudySession[]>(STORAGE_KEYS.STUDY_HISTORY, DEFAULT_STUDY_HISTORY);
  const [strictModePreference, setStrictModePreference] = useLocalStorage<boolean>(STORAGE_KEYS.STRICT_MODE, false);
  const [unlockedAchievements, setUnlockedAchievements] = useLocalStorage<string[]>(STORAGE_KEYS.UNLOCKED_ACHIEVEMENTS, []);
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>(STORAGE_KEYS.DARK_MODE, false);
  const [unifyTabsPreference, setUnifyTabsPreference] = useLocalStorage<boolean>(STORAGE_KEYS.UNIFY_TABS, false);

  const updateDailyStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    setUserStats(prevStats => {
      const lastDate = prevStats.lastStudyDate;
      if (!lastDate) return { ...prevStats, dailyStreak: 1, lastStudyDate: today };
      
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toISOString().split('T')[0];
      
      if (lastDate === yesterday) {
        const newStreak = prevStats.dailyStreak + 1;
        return { ...prevStats, dailyStreak: newStreak, lastStudyDate: today };
      } else if (lastDate === today) return prevStats;
      
      return { ...prevStats, dailyStreak: 1, lastStudyDate: today };
    });
  };

  const addXP = (amount: number) => {
    updateDailyStreak();
    setUserStats(prevStats => {
      const newXP = prevStats.xp + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      return { ...prevStats, xp: newXP, level: newLevel };
    });
  };

  const addStudySession = (sessionData: Omit<StudySession, 'id' | 'date'>) => {
    const session: StudySession = {
      ...sessionData,
      id: `session-${crypto.randomUUID()}`,
      date: new Date().toISOString(),
    };
    
    setStudyHistory(prev => [...prev, session]);
    setSubjects(prev => prev.map(s => 
      s.id === sessionData.subjectId ? { ...s, studiedMinutes: s.studiedMinutes + sessionData.minutesStudied } : s
    ));
  };

  const updateSubjectTopics = (subjectId: string, newTopics: Topic[]) => {
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, topics: newTopics } : s));
  };

  const reorderSubjects = (newSubjects: Subject[]) => {
    setSubjects(newSubjects);
  };

  const clearStudyHistory = () => {
    setStudyHistory([]);
  };

  return {
    subjects, setSubjects,
    goals, setGoals,
    questions, setQuestions,
    activeTab, setActiveTab,
    isAutoCycle, setIsAutoCycle,
    pomodoroSettings, setPomodoroSettings,
    userStats, setUserStats,
    studyHistory, setStudyHistory,
    strictModePreference, setStrictModePreference,
    unlockedAchievements, setUnlockedAchievements,
    isDarkMode, setIsDarkMode,
    unifyTabsPreference, setUnifyTabsPreference,
    updateDailyStreak,
    addXP,
    addStudySession,
    updateSubjectTopics,
    reorderSubjects,
    clearStudyHistory
  };
}