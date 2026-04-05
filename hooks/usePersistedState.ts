import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { useUI } from '../contexts/UIContext';
import { ACHIEVEMENTS } from '../constants/achievements';
import { 
  DEFAULT_GOALS, 
  DEFAULT_POMODORO_SETTINGS, 
  DEFAULT_USER_STATS, 
  DEFAULT_SUBJECTS, 
  DEFAULT_STUDY_HISTORY 
} from '../constants/defaultValues';
import { DEFAULT_QUESTIONS } from '../constants/questionsData';
import { Subject, Goal, PomodoroSettings, UserStats, StudySession, Topic, Tab, Question } from '../types';

export function usePersistedState() {
  const [subjects, setSubjects] = useLocalStorage<Subject[]>(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS);
  const [goals, setGoals] = useLocalStorage<Goal[]>(STORAGE_KEYS.GOALS, DEFAULT_GOALS);
  const [questions, setQuestions] = useLocalStorage<Question[]>(STORAGE_KEYS.QUESTIONS, DEFAULT_QUESTIONS);
  const [activeTab, setActiveTab] = useLocalStorage<Tab>(STORAGE_KEYS.ACTIVE_TAB, Tab.INICIO);
  const [isAutoCycle, setIsAutoCycle] = useLocalStorage<boolean>(STORAGE_KEYS.AUTO_CYCLE, true);
  const [pomodoroSettings, setPomodoroSettings] = useLocalStorage<PomodoroSettings>(STORAGE_KEYS.POMODORO_SETTINGS, DEFAULT_POMODORO_SETTINGS);
  const [userStats, setUserStats] = useLocalStorage<UserStats>(STORAGE_KEYS.XP, DEFAULT_USER_STATS);
  const [studyHistory, setStudyHistory] = useLocalStorage<StudySession[]>(STORAGE_KEYS.STUDY_HISTORY, DEFAULT_STUDY_HISTORY);
  const [strictModePreference, setStrictModePreference] = useLocalStorage<boolean>(STORAGE_KEYS.STRICT_MODE, false);
  const [unlockedAchievements, setUnlockedAchievements] = useLocalStorage<{ id: string, unlockedAt: string }[]>(STORAGE_KEYS.UNLOCKED_ACHIEVEMENTS, []);
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>(STORAGE_KEYS.DARK_MODE, false);
  const [unifyTabsPreference, setUnifyTabsPreference] = useLocalStorage<boolean>(STORAGE_KEYS.UNIFY_TABS, false);
  const { addToast } = useUI();

  const checkAchievements = (stats: UserStats, history: StudySession[], subjectsList: Subject[]) => {
    const newlyUnlocked: { id: string, unlockedAt: string }[] = [];
    
    ACHIEVEMENTS.forEach(achievement => {
      if (unlockedAchievements.some(ua => ua.id === achievement.id)) return;

      let isUnlocked = false;

      switch (achievement.id) {
        case '1': // Primeiros Passos
          isUnlocked = history.some(s => s.minutesStudied >= 25);
          break;
        case '2': // Foco Inabalável
          const last4 = history.slice(-4);
          isUnlocked = last4.length === 4 && last4.every(s => s.type === 'foco');
          break;
        case '3': // Maratonista Noturno
          const nightMinutes = history
            .filter(s => {
              const hour = new Date(s.date).getHours();
              return hour >= 22 || hour < 4;
            })
            .reduce((acc, s) => acc + s.minutesStudied, 0);
          isUnlocked = nightMinutes >= 180;
          break;
        case '4': // Mestre do Ciclo
          isUnlocked = subjectsList.length > 0 && subjectsList.every(s => (s.studiedMinutes / s.totalMinutes) >= 0.5);
          break;
        case '5': // Lenda do Coliseu
          const perfectBattles = history.filter(s => s.type === 'batalha' && s.accuracy === 100).length;
          isUnlocked = perfectBattles >= 50;
          break;
        case '6': // Semana Perfeita
          isUnlocked = stats.dailyStreak >= 7;
          break;
      }

      if (isUnlocked) {
        const unlockDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
        newlyUnlocked.push({ id: achievement.id, unlockedAt: unlockDate });
        addToast({
          title: 'Conquista Desbloqueada!',
          description: achievement.title,
          type: 'achievement',
          icon: achievement.icon
        });
      }
    });

    if (newlyUnlocked.length > 0) {
      setUnlockedAchievements(prev => [...prev, ...newlyUnlocked]);
    }
  };

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
      const newStats = { ...prevStats, xp: newXP, level: newLevel };
      
      // Check achievements after state update
      setTimeout(() => {
        checkAchievements(newStats, studyHistory, subjects);
      }, 0);
      
      return newStats;
    });
  };

  const addStudySession = (sessionData: Omit<StudySession, 'id' | 'date'>) => {
    const session: StudySession = {
      ...sessionData,
      id: `session-${crypto.randomUUID()}`,
      date: new Date().toISOString(),
    };
    
    const newHistory = [...studyHistory, session];
    setStudyHistory(newHistory);
    
    const newSubjects = subjects.map(s => 
      s.id === sessionData.subjectId ? { ...s, studiedMinutes: s.studiedMinutes + sessionData.minutesStudied } : s
    );
    setSubjects(newSubjects);

    // Check achievements after session is added
    setTimeout(() => {
      checkAchievements(userStats, newHistory, newSubjects);
    }, 0);
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