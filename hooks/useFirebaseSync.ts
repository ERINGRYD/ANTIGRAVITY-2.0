import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Subject, Goal, Question, StudySession, UserStats, PomodoroSettings } from '../types';
import { Theme } from '../types/theme.types';
import { SubjectCycleState } from '../types/subjectCycle.types';

type FirebaseSyncableState = {
  xp: number;
  level: number;
  dailyStreak: number;
  lastStudyDate: string | null;
  hp: number;
  stamina: number;
  pomodoroSettings: string;
  subjects: string;
  themes: string;
  cycleStates: string;
  goals: string;
  questions: string;
  studyHistory: string;
  unlockedAchievements: string;
};

const buildSyncPayload = (
  subjects: Subject[],
  themes: Theme[],
  cycleStates: SubjectCycleState[],
  goals: Goal[],
  questions: Question[],
  studyHistory: StudySession[],
  userStats: UserStats,
  pomodoroSettings: PomodoroSettings,
  unlockedAchievements: { id: string, unlockedAt: string }[]
): FirebaseSyncableState => ({
  xp: userStats.xp,
  level: userStats.level,
  dailyStreak: userStats.dailyStreak,
  lastStudyDate: userStats.lastStudyDate,
  hp: userStats.hp,
  stamina: userStats.stamina,
  pomodoroSettings: JSON.stringify(pomodoroSettings),
  subjects: JSON.stringify(subjects),
  themes: JSON.stringify(themes),
  cycleStates: JSON.stringify(cycleStates),
  goals: JSON.stringify(goals),
  questions: JSON.stringify(questions),
  studyHistory: JSON.stringify(studyHistory),
  unlockedAchievements: JSON.stringify(unlockedAchievements),
});

const getChangedFields = (
  current: FirebaseSyncableState,
  previous: FirebaseSyncableState | null
): Partial<FirebaseSyncableState> => {
  if (!previous) return current;

  const changed: Partial<FirebaseSyncableState> = {};
  (Object.keys(current) as Array<keyof FirebaseSyncableState>).forEach((key) => {
    if (current[key] !== previous[key]) {
      (changed as any)[key] = current[key];
    }
  });
  return changed;
};

export function useFirebaseSync(
  subjects: Subject[], setSubjects: (s: Subject[]) => void,
  themes: Theme[], setThemes: (t: Theme[]) => void,
  cycleStates: SubjectCycleState[], setCycleStates: (cs: SubjectCycleState[]) => void,
  goals: Goal[], setGoals: (g: Goal[]) => void,
  questions: Question[], setQuestions: (q: Question[]) => void,
  studyHistory: StudySession[], setStudyHistory: (h: StudySession[]) => void,
  userStats: UserStats, setUserStats: (s: UserStats) => void,
  pomodoroSettings: PomodoroSettings, setPomodoroSettings: (s: PomodoroSettings) => void,
  unlockedAchievements: { id: string, unlockedAt: string }[], setUnlockedAchievements: (a: { id: string, unlockedAt: string }[]) => void
) {
  const { user } = useAuth();
  const { addToast } = useUI();
  const isInitialLoadDone = useRef(false);
  const userDocExists = useRef(false);
  const lastSyncedState = useRef<FirebaseSyncableState | null>(null);

  useEffect(() => {
    if (!user) {
      isInitialLoadDone.current = false;
      userDocExists.current = false;
      lastSyncedState.current = null;
      return;
    }

    let isActive = true;

    const loadData = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();

          const loadedSubjects = data.subjects ? JSON.parse(data.subjects) : [];
          const loadedThemes = data.themes ? JSON.parse(data.themes) : [];
          const loadedCycleStates = data.cycleStates ? JSON.parse(data.cycleStates) : [];
          const loadedGoals = data.goals ? JSON.parse(data.goals) : [];
          const loadedQuestions = data.questions ? JSON.parse(data.questions) : [];
          const loadedStudyHistory = data.studyHistory ? JSON.parse(data.studyHistory) : [];
          const loadedUnlockedAchievements = data.unlockedAchievements ? JSON.parse(data.unlockedAchievements) : [];
          const loadedPomodoroSettings = data.pomodoroSettings ? JSON.parse(data.pomodoroSettings) : pomodoroSettings;

          try { if (data.subjects) setSubjects(loadedSubjects); } catch (e) { console.error('Error parsing subjects', e); }
          try { if (data.themes) setThemes(loadedThemes); } catch (e) { console.error('Error parsing themes', e); }
          try { if (data.cycleStates) setCycleStates(loadedCycleStates); } catch (e) { console.error('Error parsing cycleStates', e); }
          try { if (data.goals) setGoals(loadedGoals); } catch (e) { console.error('Error parsing goals', e); }
          try { if (data.questions) setQuestions(loadedQuestions); } catch (e) { console.error('Error parsing questions', e); }
          try { if (data.studyHistory) setStudyHistory(loadedStudyHistory); } catch (e) { console.error('Error parsing studyHistory', e); }
          try { if (data.unlockedAchievements) setUnlockedAchievements(loadedUnlockedAchievements); } catch (e) { console.error('Error parsing unlockedAchievements', e); }
          try { if (data.pomodoroSettings) setPomodoroSettings(loadedPomodoroSettings); } catch (e) { console.error('Error parsing pomodoroSettings', e); }

          setUserStats({
            xp: data.xp || 0,
            level: data.level || 1,
            dailyStreak: data.dailyStreak || 0,
            lastStudyDate: data.lastStudyDate || null,
            hp: data.hp || 100,
            stamina: data.stamina || 100,
            unlockedAchievements: []
          });

          userDocExists.current = true;
          if (isActive) {
            lastSyncedState.current = {
              xp: data.xp || 0,
              level: data.level || 1,
              dailyStreak: data.dailyStreak || 0,
              lastStudyDate: data.lastStudyDate || null,
              hp: data.hp || 100,
              stamina: data.stamina || 100,
              pomodoroSettings: data.pomodoroSettings || '',
              subjects: data.subjects || '',
              themes: data.themes || '',
              cycleStates: data.cycleStates || '',
              goals: data.goals || '',
              questions: data.questions || '',
              studyHistory: data.studyHistory || '',
              unlockedAchievements: data.unlockedAchievements || '',
            };
          }
        } else {
          const initialPayload = buildSyncPayload(
            subjects,
            themes,
            cycleStates,
            goals,
            questions,
            studyHistory,
            userStats,
            pomodoroSettings,
            unlockedAchievements
          );

          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            ...initialPayload,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });

          userDocExists.current = true;
          if (isActive) {
            lastSyncedState.current = initialPayload;
          }
        }

        if (isActive) {
          isInitialLoadDone.current = true;
        }
      } catch (error) {
        console.error('Error loading data from Firebase:', error);
        addToast({
          title: 'Falha ao carregar dados',
          description: 'Não foi possível buscar seus dados do Firebase.',
          type: 'error'
        });
      }
    };

    loadData();
    return () => { isActive = false; };
  }, [user]);

  useEffect(() => {
    if (!user || !isInitialLoadDone.current) return;

    const timeoutId = window.setTimeout(async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const currentPayload = buildSyncPayload(
          subjects,
          themes,
          cycleStates,
          goals,
          questions,
          studyHistory,
          userStats,
          pomodoroSettings,
          unlockedAchievements
        );

        const changedFields = getChangedFields(currentPayload, lastSyncedState.current);
        if (Object.keys(changedFields).length === 0) return;

        const updatePayload = {
          ...changedFields,
          updatedAt: new Date().toISOString(),
        } as Record<string, unknown>;

        if (!userDocExists.current) {
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            ...currentPayload,
            updatedAt: updatePayload.updatedAt
          });
          userDocExists.current = true;
        } else {
          await updateDoc(userDocRef, updatePayload);
        }

        lastSyncedState.current = currentPayload;
      } catch (error) {
        console.error('Error syncing data to Firebase:', error);
        addToast({
          title: 'Falha na sincronização',
          description: 'Não foi possível salvar suas alterações no Firebase.',
          type: 'error'
        });
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [subjects, themes, cycleStates, goals, questions, studyHistory, userStats, pomodoroSettings, unlockedAchievements, user]);
}
