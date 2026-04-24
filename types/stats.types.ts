export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  themeId: string | null;
  themeName: string | null;
  topicId: string | null;
  topicName?: string;
  startedAt: string;          // ISO
  endedAt: string;            // ISO
  durationMinutes: number;    // total session duration
  studyMinutes: number;       // active focus time
  pauseMinutes: number;       // break time within session
  pomodorosCompleted: number;
  sessionType: 'study' | 'simulation';
  wasCompleted: boolean;      // false if user interrupted
}

export interface QuestionAttempt {
  id: string;
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  isCorrect: boolean;
  confidence: 'certain' | 'doubtful' | 'guess';
  errorType: 'content' | 'interpretation' | 'distraction' | null;
  timeSpentSeconds: number;
  xpEarned: number;
  attemptedAt: string;        // ISO
  sessionId: string;
  sessionType: 'study' | 'simulation';
  sessionDurationMinutes: number;
}

export interface StatsFilters {
  period: '7d' | '30d' | '90d' | 'custom';
  customStart?: string;       // ISO — only when period === 'custom'
  customEnd?: string;         // ISO — only when period === 'custom'
  subjectId: string | null;   // null = all subjects
  themeId: string | null;     // null = all themes
  confidence: 'certain' | 'doubtful' | 'guess' | null;  // null = all
  sessionType: 'study' | 'simulation' | null;            // null = all
}
