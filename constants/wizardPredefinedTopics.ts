import { WizardTopic } from '../types/wizard.types';

export const WIZARD_PREDEFINED_TOPICS: Record<string, WizardTopic[]> = {
  'Matemática': [
    {
      id: 'mat-t1',
      name: 'Geometria Analítica',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'mat-st1', name: 'Coordenadas Cartesianas', priority: 3 },
        { id: 'mat-st2', name: 'Distância entre Pontos', priority: 3 },
        { id: 'mat-st3', name: 'Equação da Reta', priority: 3 },
        { id: 'mat-st4', name: 'Estudo da Circunferência', priority: 3 },
      ]
    },
    {
      id: 'mat-t2',
      name: 'Álgebra Linear',
      priority: 3,
      status: 'pendente',
      subtopics: []
    },
    {
      id: 'mat-t3',
      name: 'Logaritmos',
      priority: 3,
      status: 'pendente',
      subtopics: []
    },
    {
      id: 'mat-t4',
      name: 'Trigonometria',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'mat-st5', name: 'Seno e Cosseno', priority: 3 },
        { id: 'mat-st6', name: 'Identidades Trigonométricas', priority: 3 },
      ]
    }
  ],
  'Português': [
    {
      id: 'por-t1',
      name: 'Gramática',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'por-st1', name: 'Morfologia', priority: 3 },
        { id: 'por-st2', name: 'Ortografia', priority: 3 },
      ]
    },
    {
      id: 'por-t2',
      name: 'Sintaxe',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'por-st3', name: 'Análise Sintática', priority: 3 },
        { id: 'por-st4', name: 'Concordância Verbal', priority: 3 },
      ]
    },
    {
      id: 'por-t3',
      name: 'Interpretação de Texto',
      priority: 3,
      status: 'pendente',
      subtopics: []
    }
  ],
  'Biologia': [
    {
      id: 'bio-t1',
      name: 'Citologia',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'bio-st1', name: 'Organelas Celulares', priority: 3 },
        { id: 'bio-st2', name: 'Membrana Plasmática', priority: 3 },
      ]
    },
    {
      id: 'bio-t2',
      name: 'Genética',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'bio-st3', name: 'Leis de Mendel', priority: 3 },
        { id: 'bio-st4', name: 'DNA e RNA', priority: 3 },
      ]
    },
    {
      id: 'bio-t3',
      name: 'Ecologia',
      priority: 3,
      status: 'pendente',
      subtopics: []
    }
  ],
  'História': [
    {
      id: 'his-t1',
      name: 'Brasil Colônia',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'his-st1', name: 'Ciclo do Açúcar', priority: 3 },
        { id: 'his-st2', name: 'Ciclo do Ouro', priority: 3 },
      ]
    },
    {
      id: 'his-t2',
      name: 'Brasil Império',
      priority: 3,
      status: 'pendente',
      subtopics: []
    },
    {
      id: 'his-t3',
      name: 'História Geral',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'his-st3', name: 'Revolução Industrial', priority: 3 },
        { id: 'his-st4', name: 'Guerras Mundiais', priority: 3 },
      ]
    }
  ],
  'Geografia': [
    {
      id: 'geo-t1',
      name: 'Climatologia',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'geo-st1', name: 'Tipos de Clima', priority: 3 },
        { id: 'geo-st2', name: 'Fenômenos Climáticos', priority: 3 },
      ]
    },
    {
      id: 'geo-t2',
      name: 'Geopolítica',
      priority: 3,
      status: 'pendente',
      subtopics: []
    },
    {
      id: 'geo-t3',
      name: 'Geografia do Brasil',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'geo-st3', name: 'Relevo Brasileiro', priority: 3 },
        { id: 'geo-st4', name: 'Vegetação', priority: 3 },
      ]
    }
  ],
  'Física': [
    {
      id: 'fis-t1',
      name: 'Cinemática',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'fis-st1', name: 'Velocidade Média', priority: 3 },
        { id: 'fis-st2', name: 'Aceleração', priority: 3 },
        { id: 'fis-st3', name: 'Movimento Uniforme', priority: 3 },
        { id: 'fis-st4', name: 'Movimento Uniformemente Variado', priority: 3 },
      ]
    },
    {
      id: 'fis-t2',
      name: 'Dinâmica',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'fis-st5', name: 'Leis de Newton', priority: 3 },
        { id: 'fis-st6', name: 'Força de Atrito', priority: 3 },
        { id: 'fis-st7', name: 'Trabalho e Energia', priority: 3 },
      ]
    }
  ],
  'Química': [
    {
      id: 'qui-t1',
      name: 'Química Geral',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'qui-st1', name: 'Modelos Atômicos', priority: 3 },
        { id: 'qui-st2', name: 'Tabela Periódica', priority: 3 },
        { id: 'qui-st3', name: 'Ligações Químicas', priority: 3 },
      ]
    },
    {
      id: 'qui-t2',
      name: 'Química Orgânica',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'qui-st4', name: 'Funções Orgânicas', priority: 3 },
        { id: 'qui-st5', name: 'Isomeria', priority: 3 },
      ]
    },
    {
      id: 'qui-t3',
      name: 'Físico-Química',
      priority: 3,
      status: 'pendente',
      subtopics: []
    }
  ],
  'Sociologia': [
    {
      id: 'soc-t1',
      name: 'Introdução à Sociologia',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'soc-st1', name: 'Surgimento da Sociologia', priority: 3 },
        { id: 'soc-st2', name: 'Auguste Comte e o Positivismo', priority: 3 },
      ]
    },
    {
      id: 'soc-t2',
      name: 'Clássicos da Sociologia',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'soc-st3', name: 'Émile Durkheim', priority: 3 },
        { id: 'soc-st4', name: 'Karl Marx', priority: 3 },
        { id: 'soc-st5', name: 'Max Weber', priority: 3 },
      ]
    },
    {
      id: 'soc-t3',
      name: 'Cultura e Sociedade',
      priority: 3,
      status: 'pendente',
      subtopics: []
    }
  ],
  'Filosofia': [
    {
      id: 'fil-t1',
      name: 'Filosofia Antiga',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'fil-st1', name: 'Pré-socráticos', priority: 3 },
        { id: 'fil-st2', name: 'Sócrates, Platão e Aristóteles', priority: 3 },
      ]
    },
    {
      id: 'fil-t2',
      name: 'Ética e Moral',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'fil-st3', name: 'Utilitarismo', priority: 3 },
        { id: 'fil-st4', name: 'Imperativo Categórico de Kant', priority: 3 },
      ]
    },
    {
      id: 'fil-t3',
      name: 'Filosofia Política',
      priority: 3,
      status: 'pendente',
      subtopics: []
    }
  ],
  'Literatura': [
    {
      id: 'lit-t1',
      name: 'Escolas Literárias',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'lit-st1', name: 'Barroco', priority: 3 },
        { id: 'lit-st2', name: 'Romantismo', priority: 3 },
        { id: 'lit-st3', name: 'Realismo', priority: 3 },
      ]
    },
    {
      id: 'lit-t2',
      name: 'Modernismo no Brasil',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'lit-st4', name: 'Semana de Arte Moderna', priority: 3 },
        { id: 'lit-st5', name: 'Gerações Modernistas', priority: 3 },
      ]
    }
  ],
  'Estatística': [
    {
      id: 'est-t1',
      name: 'Estatística Descritiva',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'est-st1', name: 'Média, Mediana e Moda', priority: 3 },
        { id: 'est-st2', name: 'Desvio Padrão e Variância', priority: 3 },
      ]
    },
    {
      id: 'est-t2',
      name: 'Probabilidade',
      priority: 3,
      status: 'pendente',
      subtopics: []
    }
  ],
  'Raciocínio Lógico': [
    {
      id: 'rl-t1',
      name: 'Lógica Proposicional',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'rl-st1', name: 'Conectivos Lógicos', priority: 3 },
        { id: 'rl-st2', name: 'Tabelas Verdade', priority: 3 },
      ]
    },
    {
      id: 'rl-t2',
      name: 'Lógica de Argumentação',
      priority: 3,
      status: 'pendente',
      subtopics: []
    }
  ],
  'Informática': [
    {
      id: 'inf-t1',
      name: 'Hardware e Software',
      priority: 3,
      status: 'pendente',
      subtopics: []
    },
    {
      id: 'inf-t2',
      name: 'Sistemas Operacionais',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'inf-st1', name: 'Windows', priority: 3 },
        { id: 'inf-st2', name: 'Linux', priority: 3 },
      ]
    },
    {
      id: 'inf-t3',
      name: 'Internet e Segurança',
      priority: 3,
      status: 'pendente',
      subtopics: []
    }
  ],
  'Direito Administrativo': [
    {
      id: 'da-t1',
      name: 'Princípios da Administração Pública',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'da-st1', name: 'Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência', priority: 3 },
      ]
    },
    {
      id: 'da-t2',
      name: 'Atos Administrativos',
      priority: 3,
      status: 'pendente',
      subtopics: []
    },
    {
      id: 'da-t3',
      name: 'Licitações e Contratos',
      priority: 3,
      status: 'pendente',
      subtopics: []
    }
  ],
  'Direito Constitucional': [
    {
      id: 'dc-t1',
      name: 'Direitos e Garantias Fundamentais',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'dc-st1', name: 'Direitos Individuais e Coletivos', priority: 3 },
        { id: 'dc-st2', name: 'Direitos Sociais', priority: 3 },
      ]
    },
    {
      id: 'dc-t2',
      name: 'Organização do Estado',
      priority: 3,
      status: 'pendente',
      subtopics: []
    },
    {
      id: 'dc-t3',
      name: 'Poderes do Estado',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'dc-st3', name: 'Poder Legislativo', priority: 3 },
        { id: 'dc-st4', name: 'Poder Executivo', priority: 3 },
        { id: 'dc-st5', name: 'Poder Judiciário', priority: 3 },
      ]
    }
  ],
  'Direito Civil': [
    {
      id: 'dciv-t1',
      name: 'Parte Geral',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'dciv-st1', name: 'Pessoas Naturais e Jurídicas', priority: 3 },
        { id: 'dciv-st2', name: 'Bens', priority: 3 },
      ]
    },
    {
      id: 'dciv-t2',
      name: 'Direito das Obrigações',
      priority: 3,
      status: 'pendente',
      subtopics: []
    }
  ],
  'Direito Penal': [
    {
      id: 'dp-t1',
      name: 'Teoria do Crime',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'dp-st1', name: 'Tipicidade', priority: 3 },
        { id: 'dp-st2', name: 'Ilicitude', priority: 3 },
        { id: 'dp-st3', name: 'Culpabilidade', priority: 3 },
      ]
    },
    {
      id: 'dp-t2',
      name: 'Crimes contra a Pessoa',
      priority: 3,
      status: 'pendente',
      subtopics: []
    }
  ],
  'Inglês': [
    {
      id: 'ing-t1',
      name: 'Grammar',
      priority: 3,
      status: 'pendente',
      subtopics: [
        { id: 'ing-st1', name: 'Verb Tenses', priority: 3 },
        { id: 'ing-st2', name: 'Modal Verbs', priority: 3 },
        { id: 'ing-st3', name: 'Conditionals', priority: 3 },
      ]
    },
    {
      id: 'ing-t2',
      name: 'Reading Comprehension',
      priority: 3,
      status: 'pendente',
      subtopics: []
    },
    {
      id: 'ing-t3',
      name: 'Vocabulary',
      priority: 3,
      status: 'pendente',
      subtopics: []
    }
  ]
};
