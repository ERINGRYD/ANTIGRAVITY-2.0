import { Achievement } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    title: 'Primeiros Passos',
    description: 'Completou sua primeira sessão de estudo de 25 minutos.',
    icon: 'rocket_launch',
    rarity: 'common',
    isUnlocked: false,
  },
  {
    id: '2',
    title: 'Foco Inabalável',
    description: 'Completou 4 sessões seguidas no Modo Estrito.',
    icon: 'shield',
    rarity: 'rare',
    isUnlocked: false,
  },
  {
    id: '3',
    title: 'Maratonista Noturno',
    description: 'Estudou por mais de 3 horas após às 22:00.',
    icon: 'dark_mode',
    rarity: 'rare',
    isUnlocked: false,
    goalValue: 180, // minutes
    currentValue: 0,
  },
  {
    id: '4',
    title: 'Mestre do Ciclo',
    description: 'Mantenha todas as matérias acima de 50% de progresso.',
    icon: 'loop',
    rarity: 'epic',
    isUnlocked: false,
  },
  {
    id: '5',
    title: 'Lenda do Coliseu',
    description: 'Vença 50 batalhas contra o tempo sem errar questões.',
    icon: 'workspace_premium',
    rarity: 'legendary',
    isUnlocked: false,
    goalValue: 50,
    currentValue: 0,
  },
  {
    id: '6',
    title: 'Semana Perfeita',
    description: 'Bateu todas as metas diárias por 7 dias consecutivos.',
    icon: 'calendar_month',
    rarity: 'epic',
    isUnlocked: false,
    goalValue: 7,
    currentValue: 0,
  },
];
