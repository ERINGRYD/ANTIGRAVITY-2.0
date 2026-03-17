
import { Subject } from './types';

// INVARIANT: studiedMinutes must never exceed totalMinutes
// Violating this breaks progress bar rendering and XP calculations
export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'mat',
    name: 'Matemática',
    shortName: 'MAT',
    color: '#3B82F6', // Azul
    icon: 'functions',
    studiedMinutes: 0,
    totalMinutes: 120,
    topics: [
      { 
        id: 't1', 
        name: 'Geometria Analítica', 
        icon: 'shapes', 
        studiedMinutes: 0, 
        totalMinutes: 180,
        totalQuestions: 14, 
        completedQuestions: 0, 
        isCompleted: false,
        subTopics: [
          { id: 'st1', name: 'Coordenadas Cartesianas', isCompleted: false, studiedMinutes: 0, totalMinutes: 45 },
          { id: 'st2', name: 'Distância entre Pontos', isCompleted: false, studiedMinutes: 0, totalMinutes: 45 },
          { id: 'st3', name: 'Equação da Reta', isCompleted: false, studiedMinutes: 0, totalMinutes: 45 },
          { id: 'st4', name: 'Estudo da Circunferência', isCompleted: false, studiedMinutes: 0, totalMinutes: 45 },
        ]
      },
      { id: 't2', name: 'Álgebra Linear', icon: 'calculate', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 15, completedQuestions: 0, isCompleted: false },
      { id: 't5', name: 'Logaritmos', icon: 'functions', studiedMinutes: 0, totalMinutes: 60, totalQuestions: 10, completedQuestions: 0, isCompleted: false }
    ]
  },
  {
    id: 'por',
    name: 'Português',
    shortName: 'POR',
    color: '#3B82F6', // Ajustado para Azul conforme o Print
    icon: 'menu_book',
    studiedMinutes: 0,
    totalMinutes: 1500,
    topics: [
      { id: 't7', name: 'Gramática', icon: 'spellcheck', studiedMinutes: 0, totalMinutes: 180, totalQuestions: 20, completedQuestions: 0, isCompleted: false },
      { id: 't8', name: 'Sintaxe', icon: 'account_tree', studiedMinutes: 0, totalMinutes: 120, totalQuestions: 15, completedQuestions: 0, isCompleted: false }
    ]
  },
  {
    id: 'bio',
    name: 'Biologia',
    shortName: 'BIO',
    color: '#059669', // Verde Escuro
    icon: 'biotech',
    studiedMinutes: 0,
    totalMinutes: 1000,
    topics: [
      { id: 't12', name: 'Citologia', icon: 'microscope', studiedMinutes: 0, totalMinutes: 200, totalQuestions: 10, completedQuestions: 0, isCompleted: false }
    ]
  },
  {
    id: 'his',
    name: 'História',
    shortName: 'HIS',
    color: '#F59E0B', // Laranja
    icon: 'history_edu',
    studiedMinutes: 0,
    totalMinutes: 1200,
    topics: [
      { id: 't9', name: 'Brasil Colônia', icon: 'flag', studiedMinutes: 0, totalMinutes: 120, totalQuestions: 12, completedQuestions: 0, isCompleted: false }
    ]
  },
  {
    id: 'geo',
    name: 'Geografia',
    shortName: 'GEO',
    color: '#8B5CF6', // Roxo
    icon: 'public',
    studiedMinutes: 0,
    totalMinutes: 1200,
    topics: [
      { id: 't10', name: 'Climatologia', icon: 'cloud', studiedMinutes: 0, totalMinutes: 90, totalQuestions: 8, completedQuestions: 0, isCompleted: false }
    ]
  },
  {
    id: 'fis',
    name: 'Física',
    shortName: 'FIS',
    color: '#EC4899', // Rosa
    icon: 'bolt',
    studiedMinutes: 0,
    totalMinutes: 1200,
    topics: [
      { id: 't11', name: 'Cinemática', icon: 'speed', studiedMinutes: 0, totalMinutes: 180, totalQuestions: 15, completedQuestions: 0, isCompleted: false }
    ]
  },
  {
    id: 'ing',
    name: 'Inglês',
    shortName: 'ING',
    color: '#06B6D4', // Ciano
    icon: 'language',
    studiedMinutes: 0,
    totalMinutes: 800,
    topics: [
      { id: 't13', name: 'Grammar', icon: 'translate', studiedMinutes: 0, totalMinutes: 100, totalQuestions: 10, completedQuestions: 0, isCompleted: false }
    ]
  }
];

export const UI_COLORS = {
  primary: '#3B82F6',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  border: '#E2E8F0',
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
  }
};

if (process.env.NODE_ENV === 'development') {
  INITIAL_SUBJECTS.forEach(subject => {
    if (subject.studiedMinutes > subject.totalMinutes) {
      console.error(
        `[Data Invariant] ${subject.name}: studiedMinutes (${subject.studiedMinutes}) > totalMinutes (${subject.totalMinutes})`
      );
    }
  });
}
