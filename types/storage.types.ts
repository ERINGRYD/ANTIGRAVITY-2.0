import { Topic } from '../types';

import { KnowledgeLevel } from '../utils/priorityUtils';

export interface PomodoroSettings {
  focusTime: number;
  shortBreak: number;
  longBreak: number;
  pomodorosUntilLongBreak: number; // Quantos pomodoros até pausa longa
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  ambientSound: string;
  alertSound: string;
  shortBreakEndSound: string;
  longBreakEndSound: string;
  volume: number;
}

export interface UserStats {
  xp: number;
  level: number;
  dailyStreak: number;
  lastStudyDate: string | null;
  unlockedAchievements: { id: string, unlockedAt: string }[];
  hp: number;
  stamina: number;
}

export interface StudySession {
  id: string;
  date: string; // ISO string
  subjectId: string;
  subjectName: string;
  themeId: string | null;
  topicId: string | null;
  topicName?: string; 
  minutesStudied: number;
  questionsCompleted: number;
  accuracy: number;
  type: 'foco' | 'batalha' | 'revisao';
  xpEarned: number;
  topicsCompleted?: string[]; // IDs dos tópicos concluídos nesta sessão
  pagesRead?: number;
  pauseMinutes?: number;
  stopPoint?: string;
  confidenceStats?: {
    certeza: number;
    duvida: number;
    chute: number;
  };
  errorReasons?: Record<string, number>;
  attempts?: QuestionAttempt[];
}

export interface QuestionAttempt {
  id: string;
  topicId: string;
  subjectId: string;
  isCorrect: boolean;
  confidence: 'certain' | 'doubtful' | 'guess';
  errorType: 'content' | 'interpretation' | 'distraction' | null;
  timeSpentSeconds: number;
  xpEarned: number;
  attemptedAt: string; // ISO datetime
}

export interface Subject {
  id: string;
  name: string;
  shortName: string; // Necessário para o DonutChart
  color: string;
  icon: string;
  studiedMinutes?: number;
  totalMinutes?: number; // Necessário para cálculos de progresso
  topics?: Topic[];
  priority?: number;
  knowledgeLevel?: KnowledgeLevel;
}

export interface Goal {
  id: string;
  title: string;
  targetMinutes: number;
  currentMinutes: number;
  isCompleted: boolean;
  weekStart: string; // ISO string
}