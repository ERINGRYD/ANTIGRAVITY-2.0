import { Question } from '../types';

export const getStatusColors = (status: Question['status']) => {
  switch (status) {
    case 'Ativa':
      return {
        color: 'text-green-700 dark:text-green-400',
        dotColor: 'bg-green-500',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-100 dark:border-green-900/30',
      };
    case 'Rascunho':
      return {
        color: 'text-slate-500 dark:text-slate-400',
        dotColor: 'bg-slate-400',
        bgColor: 'bg-slate-100 dark:bg-slate-800',
        borderColor: 'border-slate-200 dark:border-slate-700',
      };
    case 'Revisão':
      return {
        color: 'text-yellow-700 dark:text-yellow-400',
        dotColor: 'bg-yellow-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-100 dark:border-yellow-900/30',
      };
    default:
      return {
        color: 'text-slate-500 dark:text-slate-400',
        dotColor: 'bg-slate-400',
        bgColor: 'bg-slate-100 dark:bg-slate-800',
        borderColor: 'border-slate-200 dark:border-slate-700',
      };
  }
};

export const getDifficultyColors = (difficulty: Question['difficulty']) => {
  switch (difficulty) {
    case 'FÁCIL':
      return {
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        borderColor: 'border-emerald-100 dark:border-emerald-900/30',
      };
    case 'MÉDIO':
      return {
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-100 dark:border-orange-900/30',
      };
    case 'DIFÍCIL':
      return {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-100 dark:border-red-900/30',
      };
    default:
      return {
        color: 'text-slate-600 dark:text-slate-400',
        bgColor: 'bg-slate-50 dark:bg-slate-900/20',
        borderColor: 'border-slate-100 dark:border-slate-900/30',
      };
  }
};
