
import { Question } from '../types';

export const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 'q-mat-1',
    code: 'MAT-001',
    difficulty: 'MÉDIO',
    views: '1.2k',
    text: 'Qual o valor de log₂ 8?',
    status: 'Ativa',
    questionType: 'multipla',
    correctAnswerMultipla: '3',
    enunciation: 'Resolva o logaritmo abaixo:',
    tags: ['logaritmos', 'matemática'],
    explanation: '2³ = 8, portanto log₂ 8 = 3.',
    subject: 'mat',
    topic: 'mat-t3',
    options: [
      { id: 'opt-1', text: '2', isCorrect: false },
      { id: 'opt-2', text: '3', isCorrect: true },
      { id: 'opt-3', text: '4', isCorrect: false },
      { id: 'opt-4', text: '8', isCorrect: false }
    ]
  },
  {
    id: 'q-his-1',
    code: 'HIS-001',
    difficulty: 'FÁCIL',
    views: '800',
    text: 'Em que ano o Brasil foi "descoberto" pelos portugueses?',
    status: 'Ativa',
    questionType: 'multipla',
    correctAnswerMultipla: '1500',
    enunciation: 'Sobre o período colonial brasileiro:',
    tags: ['brasil colônia', 'história'],
    explanation: 'Pedro Álvares Cabral chegou ao Brasil em 22 de abril de 1500.',
    subject: 'his',
    topic: 'his-t1',
    options: [
      { id: 'opt-1', text: '1492', isCorrect: false },
      { id: 'opt-2', text: '1500', isCorrect: true },
      { id: 'opt-3', text: '1530', isCorrect: false },
      { id: 'opt-4', text: '1822', isCorrect: false }
    ]
  },
  {
    id: 'q3',
    code: 'GEO001',
    difficulty: 'FÁCIL',
    text: 'Qual é a maior região do Brasil em extensão territorial?',
    status: 'Revisão',
    views: '500',
    subject: 'geo',
    topic: 'geo-t1',
    subtopic: 'Região Norte',
    options: [
      { id: 'a', text: 'Região Sul', isCorrect: false },
      { id: 'b', text: 'Região Nordeste', isCorrect: false },
      { id: 'c', text: 'Região Norte', isCorrect: true },
      { id: 'd', text: 'Região Centro-Oeste', isCorrect: false },
      { id: 'e', text: 'Região Sudeste', isCorrect: false }
    ],
    explanation: 'A Região Norte é a maior região do Brasil, ocupando cerca de 45% do território nacional.'
  }
];
