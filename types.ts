
export enum Tab {
  INICIO = 'inicio',
  CICLO = 'ciclo',
  BATALHA = 'batalha',
  COLISEU = 'coliseu',
  MAIS = 'mais',
  // Added DETALHES to enum to fix missing property errors in App.tsx
  DETALHES = 'detalhes',
  JORNADA = 'jornada',
  LOJA = 'loja',
  RANKING = 'ranking',
  PERFIL = 'perfil',
  ESTATISTICAS = 'estatisticas',
  CONFIGURACOES = 'configuracoes'
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: number; // 0 to 100
  goalValue?: string;
  currentValue?: string;
}

export interface SubTopic {
  id: string;
  name: string;
  isCompleted: boolean;
  studiedMinutes: number;
  totalMinutes: number;
  icon?: string;
}

export interface Topic {
  id: string;
  name: string;
  isCompleted: boolean;
  icon: string;
  studiedMinutes: number;
  totalMinutes: number;
  totalQuestions: number;
  completedQuestions: number;
  subTopics?: SubTopic[];
  subItems?: string[];
}

// Re-exportando tipos de storage para uso global
export * from './types/storage.types';
export * from './types/theme.types';
export * from './types/subjectCycle.types';

export type ConfidenceLevel = 'certain' | 'doubtful' | 'guess';
export type ErrorType = 'content' | 'interpretation' | 'distraction' | null;
export type Room = 'reconhecimento' | 'critica' | 'alerta' | 'vencidos';

export interface BattleAttempt {
  id: string;
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  isCorrect: boolean;
  confidence: ConfidenceLevel;
  errorType: ErrorType;
  room: Room;
  timeSpentSeconds: number;
  xpEarned: number;
  attemptedAt: string;
  sessionId: string;
  sessionDurationMinutes: number;
}

export interface StatsFilters {
  period: '7d' | '30d' | '90d' | 'all';
  subjectId: string | null;
}

export interface StudyStats {
  totalStudiedMinutes: number;
  overallProgress: number;
}

export interface Question {
  id: string;
  code: string;
  difficulty: 'FÁCIL' | 'MÉDIO' | 'DIFÍCIL';
  views: string;
  text: string;
  status: 'Ativa' | 'Rascunho' | 'Revisão';
  // Add fields for editing
  questionType?: 'multipla' | 'certo_errado' | 'flashcard';
  correctAnswerMultipla?: string;
  correctAnswerCertoErrado?: string;
  flashcardAnswer?: string;
  enunciation?: string;
  tags?: string[];
  explanation?: string;
  subject?: string;
  topic?: string;
  subtopic?: string;
  options?: { id: string; text: string; isCorrect: boolean }[]; // For multiple choice options if needed
}
