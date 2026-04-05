import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Subject, Goal, Question, StudySession, UserStats, PomodoroSettings } from '../types';

export function useFirebaseSync(
  subjects: Subject[], setSubjects: (s: Subject[]) => void,
  goals: Goal[], setGoals: (g: Goal[]) => void,
  questions: Question[], setQuestions: (q: Question[]) => void,
  studyHistory: StudySession[], setStudyHistory: (h: StudySession[]) => void,
  userStats: UserStats, setUserStats: (s: UserStats) => void,
  pomodoroSettings: PomodoroSettings, setPomodoroSettings: (s: PomodoroSettings) => void,
  unlockedAchievements: { id: string, unlockedAt: string }[], setUnlockedAchievements: (a: { id: string, unlockedAt: string }[]) => void
) {
  const { user } = useAuth();
  const isInitialLoadDone = useRef(false);

  // Load from Firebase on login
  useEffect(() => {
    if (!user) {
      isInitialLoadDone.current = false;
      return;
    }

    const loadData = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          
          try { if (data.subjects) setSubjects(JSON.parse(data.subjects)); } catch (e) { console.error('Error parsing subjects', e); }
          try { if (data.goals) setGoals(JSON.parse(data.goals)); } catch (e) { console.error('Error parsing goals', e); }
          try { if (data.questions) setQuestions(JSON.parse(data.questions)); } catch (e) { console.error('Error parsing questions', e); }
          try { if (data.studyHistory) setStudyHistory(JSON.parse(data.studyHistory)); } catch (e) { console.error('Error parsing studyHistory', e); }
          try { if (data.unlockedAchievements) setUnlockedAchievements(JSON.parse(data.unlockedAchievements)); } catch (e) { console.error('Error parsing unlockedAchievements', e); }
          try { if (data.pomodoroSettings) setPomodoroSettings(JSON.parse(data.pomodoroSettings)); } catch (e) { console.error('Error parsing pomodoroSettings', e); }
          
          setUserStats({
            xp: data.xp || 0,
            level: data.level || 1,
            dailyStreak: data.dailyStreak || 0,
            lastStudyDate: data.lastStudyDate || null,
            hp: data.hp || 100,
            stamina: data.stamina || 100,
            unlockedAchievements: [] // Handled separately above
          });
        } else {
          // Create initial document
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            xp: 0,
            level: 1,
            dailyStreak: 0,
            lastStudyDate: null,
            hp: 100,
            stamina: 100,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }

        isInitialLoadDone.current = true;
      } catch (error) {
        console.error('Error loading data from Firebase:', error);
      }
    };

    loadData();
  }, [user]);

  // Sync to Firebase whenever state changes
  useEffect(() => {
    if (!user || !isInitialLoadDone.current) return;
    
    const sync = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          xp: userStats.xp,
          level: userStats.level,
          dailyStreak: userStats.dailyStreak,
          lastStudyDate: userStats.lastStudyDate,
          hp: userStats.hp,
          stamina: userStats.stamina,
          pomodoroSettings: JSON.stringify(pomodoroSettings),
          subjects: JSON.stringify(subjects),
          goals: JSON.stringify(goals),
          questions: JSON.stringify(questions),
          studyHistory: JSON.stringify(studyHistory),
          unlockedAchievements: JSON.stringify(unlockedAchievements),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (error) {
        console.error('Error syncing data to Firebase:', error);
      }
    };

    const timeoutId = setTimeout(sync, 2000); // Debounce 2 seconds
    return () => clearTimeout(timeoutId);
  }, [subjects, goals, questions, studyHistory, userStats, pomodoroSettings, unlockedAchievements, user]);
}
