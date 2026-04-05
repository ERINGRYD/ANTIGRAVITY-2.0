export type ObjectiveType = 'enem' | 'oab' | 'concurso' | 'faculdade' | 'custom' | null;

export interface WizardTopic {
  id: string;
  name: string;
  priority?: number;
  status?: 'pendente' | 'em-progresso' | 'concluido';
  subtopics?: WizardTopic[];
}

export interface WizardSubject {
  id: string;
  name: string;
  color: string;
  category?: string;
  topics: WizardTopic[];
  level: 'iniciante' | 'intermediario' | 'avancado' | null;
  priority?: number;
}

export interface ConcursoPosition {
  name: string;
  subjects: Array<{
    name: string;
    topics: Array<{
      name: string;
      subtopics: Array<{
        name: string;
        subtopics?: any[]; // Recursive structure
      }> | string[]; // Keep string[] for backward compatibility or simple cases
    }>;
  }>;
}

export interface ConcursoInfo {
  name: string;
  banca: string;
  date: string; // YYYY-MM-DD
  positions: ConcursoPosition[];
}

export interface WizardState {
  objective: ObjectiveType;
  banca?: string | null;
  focus: string | null;
  deadline: string | null; // YYYY-MM-DD
  subjects: WizardSubject[];
  weeklyHours: number | null;
  timerSettings: {
    focusTime: number;
    shortBreak: number;
    longBreak: number;
    sessionsUntilLongBreak: number;
  };
  concursoInfo?: ConcursoInfo | null;
  selectedPosition?: string | null;
}
