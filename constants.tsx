
import { Subject } from './types';

// INVARIANT: studiedMinutes must never exceed totalMinutes
// Violating this breaks progress bar rendering and XP calculations
export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'mat',
    name: 'Matemática',
    shortName: 'MAT',
    color: '#3B82F6',
    icon: 'functions',
    studiedMinutes: 0,
    totalMinutes: 600,
    topics: [
      { id: 'mat-t1', name: 'Geometria Analítica', icon: 'shapes', studiedMinutes: 0, totalMinutes: 120, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'mat-t2', name: 'Álgebra Linear', icon: 'calculate', studiedMinutes: 0, totalMinutes: 120, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'mat-t3', name: 'Logaritmos', icon: 'functions', studiedMinutes: 0, totalMinutes: 120, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'mat-t4', name: 'Trigonometria', icon: 'architecture', studiedMinutes: 0, totalMinutes: 120, totalQuestions: 5, completedQuestions: 0, isCompleted: false }
    ]
  },
  {
    id: 'por',
    name: 'Português',
    shortName: 'POR',
    color: '#3B82F6',
    icon: 'menu_book',
    studiedMinutes: 0,
    totalMinutes: 450,
    topics: [
      { id: 'por-t1', name: 'Gramática', icon: 'spellcheck', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'por-t2', name: 'Sintaxe', icon: 'account_tree', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'por-t3', name: 'Interpretação de Texto', icon: 'find_in_page', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false }
    ]
  },
  {
    id: 'bio',
    name: 'Biologia',
    shortName: 'BIO',
    color: '#059669',
    icon: 'biotech',
    studiedMinutes: 0,
    totalMinutes: 450,
    topics: [
      { id: 'bio-t1', name: 'Citologia', icon: 'microscope', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'bio-t2', name: 'Genética', icon: 'dna', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'bio-t3', name: 'Ecologia', icon: 'eco', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false }
    ]
  },
  {
    id: 'his',
    name: 'História',
    shortName: 'HIS',
    color: '#F59E0B',
    icon: 'history_edu',
    studiedMinutes: 0,
    totalMinutes: 450,
    topics: [
      { id: 'his-t1', name: 'Brasil Colônia', icon: 'flag', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'his-t2', name: 'Brasil Império', icon: 'account_balance', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'his-t3', name: 'História Geral', icon: 'public', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false }
    ]
  },
  {
    id: 'geo',
    name: 'Geografia',
    shortName: 'GEO',
    color: '#8B5CF6',
    icon: 'public',
    studiedMinutes: 0,
    totalMinutes: 450,
    topics: [
      { id: 'geo-t1', name: 'Climatologia', icon: 'cloud', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'geo-t2', name: 'Geopolítica', icon: 'gavel', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'geo-t3', name: 'Geografia do Brasil', icon: 'map', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false }
    ]
  },
  {
    id: 'fis',
    name: 'Física',
    shortName: 'FIS',
    color: '#EC4899',
    icon: 'bolt',
    studiedMinutes: 0,
    totalMinutes: 300,
    topics: [
      { id: 'fis-t1', name: 'Cinemática', icon: 'speed', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'fis-t2', name: 'Dinâmica', icon: 'fitness_center', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false }
    ]
  },
  {
    id: 'qui',
    name: 'Química',
    shortName: 'QUI',
    color: '#10B981',
    icon: 'science',
    studiedMinutes: 0,
    totalMinutes: 450,
    topics: [
      { id: 'qui-t1', name: 'Química Geral', icon: 'opacity', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'qui-t2', name: 'Química Orgânica', icon: 'grain', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'qui-t3', name: 'Físico-Química', icon: 'thermostat', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false }
    ]
  },
  {
    id: 'soc',
    name: 'Sociologia',
    shortName: 'SOC',
    color: '#6366F1',
    icon: 'groups',
    studiedMinutes: 0,
    totalMinutes: 450,
    topics: [
      { id: 'soc-t1', name: 'Introdução à Sociologia', icon: 'info', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'soc-t2', name: 'Clássicos da Sociologia', icon: 'history', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'soc-t3', name: 'Cultura e Sociedade', icon: 'theater_comedy', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false }
    ]
  },
  {
    id: 'fil',
    name: 'Filosofia',
    shortName: 'FIL',
    color: '#F43F5E',
    icon: 'psychology',
    studiedMinutes: 0,
    totalMinutes: 450,
    topics: [
      { id: 'fil-t1', name: 'Filosofia Antiga', icon: 'temple_hindu', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'fil-t2', name: 'Ética e Moral', icon: 'balance', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'fil-t3', name: 'Filosofia Política', icon: 'policy', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false }
    ]
  },
  {
    id: 'lit',
    name: 'Literatura',
    shortName: 'LIT',
    color: '#D946EF',
    icon: 'auto_stories',
    studiedMinutes: 0,
    totalMinutes: 300,
    topics: [
      { id: 'lit-t1', name: 'Escolas Literárias', icon: 'history_edu', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'lit-t2', name: 'Modernismo no Brasil', icon: 'palette', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false }
    ]
  },
  {
    id: 'est',
    name: 'Estatística',
    shortName: 'EST',
    color: '#0EA5E9',
    icon: 'bar_chart',
    studiedMinutes: 0,
    totalMinutes: 300,
    topics: [
      { id: 'est-t1', name: 'Estatística Descritiva', icon: 'analytics', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'est-t2', name: 'Probabilidade', icon: 'casino', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false }
    ]
  },
  {
    id: 'rl',
    name: 'Raciocínio Lógico',
    shortName: 'RL',
    color: '#F97316',
    icon: 'extension',
    studiedMinutes: 0,
    totalMinutes: 300,
    topics: [
      { id: 'rl-t1', name: 'Lógica Proposicional', icon: 'code', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'rl-t2', name: 'Lógica de Argumentação', icon: 'forum', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false }
    ]
  },
  {
    id: 'inf',
    name: 'Informática',
    shortName: 'INF',
    color: '#64748B',
    icon: 'computer',
    studiedMinutes: 0,
    totalMinutes: 450,
    topics: [
      { id: 'inf-t1', name: 'Hardware e Software', icon: 'memory', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'inf-t2', name: 'Sistemas Operacionais', icon: 'settings_input_component', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'inf-t3', name: 'Internet e Segurança', icon: 'security', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false }
    ]
  },
  {
    id: 'dir-adm',
    name: 'Direito Administrativo',
    shortName: 'ADM',
    color: '#475569',
    icon: 'business_center',
    studiedMinutes: 0,
    totalMinutes: 450,
    topics: [
      { id: 'dir-adm-t1', name: 'Princípios', icon: 'gavel', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'dir-adm-t2', name: 'Atos Administrativos', icon: 'description', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'dir-adm-t3', name: 'Agentes Públicos', icon: 'badge', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false }
    ]
  },
  {
    id: 'dir-const',
    name: 'Direito Constitucional',
    shortName: 'CONST',
    color: '#1E293B',
    icon: 'gavel',
    studiedMinutes: 0,
    totalMinutes: 450,
    topics: [
      { id: 'dir-const-t1', name: 'Direitos Fundamentais', icon: 'person', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'dir-const-t2', name: 'Organização do Estado', icon: 'account_balance', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'dir-const-t3', name: 'Poderes da União', icon: 'account_balance_wallet', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false }
    ]
  },
  {
    id: 'dir-civ',
    name: 'Direito Civil',
    shortName: 'CIV',
    color: '#334155',
    icon: 'gavel',
    studiedMinutes: 0,
    totalMinutes: 300,
    topics: [
      { id: 'dir-civ-t1', name: 'Pessoas', icon: 'people', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'dir-civ-t2', name: 'Bens e Fatos', icon: 'inventory_2', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false }
    ]
  },
  {
    id: 'dir-pen',
    name: 'Direito Penal',
    shortName: 'PEN',
    color: '#0F172A',
    icon: 'gavel',
    studiedMinutes: 0,
    totalMinutes: 300,
    topics: [
      { id: 'dir-pen-t1', name: 'Teoria do Crime', icon: 'report_problem', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'dir-pen-t2', name: 'Penas', icon: 'lock', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false }
    ]
  },
  {
    id: 'ing',
    name: 'Inglês',
    shortName: 'ING',
    color: '#06B6D4',
    icon: 'language',
    studiedMinutes: 0,
    totalMinutes: 450,
    topics: [
      { id: 'ing-t1', name: 'Reading Comprehension', icon: 'menu_book', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'ing-t2', name: 'Grammar', icon: 'translate', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false },
      { id: 'ing-t3', name: 'Vocabulary', icon: 'abc', studiedMinutes: 0, totalMinutes: 150, totalQuestions: 5, completedQuestions: 0, isCompleted: false }
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
