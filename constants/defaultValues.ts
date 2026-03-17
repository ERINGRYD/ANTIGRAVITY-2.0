import { Subject, Goal, StudySession, PomodoroSettings, UserStats } from '../types';
import { INITIAL_SUBJECTS } from '../constants';

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  focusTime: 25,
  shortBreak: 5,
  longBreak: 15,
  pomodorosUntilLongBreak: 4,
  autoStartBreaks: true,     // PADRÃO: ativado
  autoStartPomodoros: false,  // PADRÃO: desativado
  soundEnabled: true,
  ambientSound: 'chuva',
  alertSound: 'sino',
  shortBreakEndSound: 'sino',
  longBreakEndSound: 'sino',
  volume: 75
};

export const DEFAULT_USER_STATS: UserStats = {
  xp: 0,
  level: 1,
  dailyStreak: 0,
  lastStudyDate: null,
  unlockedAchievements: [],
  hp: 1000,
  stamina: 100
};

export const DEFAULT_SUBJECTS: Subject[] = INITIAL_SUBJECTS;

export const DEFAULT_GOALS: Goal[] = [
  { 
    id: '1', 
    title: 'Completar 20h de estudo', 
    targetMinutes: 1200, 
    currentMinutes: 0, 
    isCompleted: false, 
    weekStart: new Date().toISOString() 
  },
  { 
    id: '2', 
    title: 'Revisar Logaritmos', 
    targetMinutes: 60, 
    currentMinutes: 0, 
    isCompleted: false, 
    weekStart: new Date().toISOString() 
  }
];

export const DEFAULT_ACHIEVEMENTS: string[] = [];

export const DEFAULT_STUDY_HISTORY: StudySession[] = [];