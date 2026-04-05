/**
 * EXAM COUNTDOWN MILESTONE SYSTEM
 * 
 * This utility implements a three-regime architecture for generating study milestones
 * leading up to an exam date.
 * 
 * REGIMES:
 * 1. Proportional (Regime 1):
 *    - Active when daysFromNow > 14.
 *    - Generated at fixed percentages of total time (10% to 90%).
 *    - Priority: 10 (Lowest).
 *    - Rule: Any proportional milestone falling within 14 days of the exam is dropped.
 * 
 * 2. Every 3 Days (Regime 2):
 *    - Active for days 14, 11, and 8 before the exam.
 *    - Priority: 50.
 *    - Overrides proportional milestones if they collide.
 * 
 * 3. Daily (Regime 3):
 *    - Active for days 1 through 7 before the exam.
 *    - Priority: 100 (Highest).
 *    - Each day has a specific focus (Simulated Exam, Review, etc.).
 * 
 * PRIORITY SYSTEM:
 * When multiple milestones fall on the same date, the deduplication logic selects
 * the one with the highest priority (Daily > Every 3 Days > Proportional).
 * The Exam Day itself has the absolute highest priority (1000).
 */

import { 
  differenceInDays, 
  addDays, 
  startOfDay, 
  isBefore, 
  format 
} from 'date-fns';

export type UrgencyLevel = 'comfortable' | 'moderate' | 'urgent' | 'critical' | 'expired';

export interface UrgencyInfo {
  level: UrgencyLevel;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  description: string;
}

export const getUrgency = (examDate: Date): UrgencyInfo => {
  const today = startOfDay(new Date());
  const target = startOfDay(examDate);
  const days = differenceInDays(target, today);

  if (days < 0) {
    return {
      level: 'expired',
      label: 'Data Expirada',
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: 'event_busy',
      description: 'A data selecionada já passou. Por favor, escolha uma data futura.'
    };
  }

  if (days <= 30) {
    return {
      level: 'critical',
      label: 'Crítico',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100',
      icon: 'error',
      description: 'Foco total em revisão e exercícios. Cada minuto conta agora!'
    };
  }

  if (days <= 60) {
    return {
      level: 'urgent',
      label: 'Urgente',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
      icon: 'warning',
      description: 'Intensifique o ritmo. Priorize os temas de maior peso e recorrência.'
    };
  }

  if (days <= 120) {
    return {
      level: 'moderate',
      label: 'Moderado',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-100',
      icon: 'schedule',
      description: 'Ritmo constante. Mantenha a disciplina na construção da sua base.'
    };
  }

  return {
    level: 'comfortable',
    label: 'Confortável',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-100',
    icon: 'check_circle',
    description: 'Tempo excelente para um preparo completo e aprofundado.'
  };
};

export interface IntensityInfo {
  hours: string;
  progress: number | null;
}

export const getIntensity = (days: number): IntensityInfo => {
  let hours = '2-3h';
  if (days <= 30) hours = '6-8h';
  else if (days <= 60) hours = '4-6h';
  else if (days <= 120) hours = '3-4h';

  // Progress logic:
  // If days > 30: 0% to 50%
  // If days <= 30 and > 7: 50% to 99%
  // If days <= 7: 100%
  let progress = null;
  if (days <= 7) {
    progress = 100;
  } else if (days <= 30) {
    // From 30 days (50%) to 8 days (99%)
    progress = Math.round(50 + ((30 - days) / 22) * 49);
  } else {
    // From > 30 days (max 50%) down to 0%
    progress = Math.max(0, Math.round(50 - ((days - 30) / 90) * 50));
  }

  return { hours, progress };
};

export interface Milestone {
  id: string;
  title: string;
  description: string;
  date: Date;
  daysFromNow: number; // Days from milestone date to exam date
  priority: number; // Higher is more important
  icon: string;
  color: string;
  regime: 'proportional' | 'every3days' | 'daily' | 'exam';
}

export const generateMilestones = (examDate: Date): Milestone[] => {
  const today = startOfDay(new Date());
  const targetDate = startOfDay(examDate);
  const totalDays = differenceInDays(targetDate, today);

  // If the exam date is in the past, return empty
  if (totalDays < 0) return [];

  const milestones: Milestone[] = [];

  // 1. Proportional Regime (Regime 1)
  // Only if daysToExam > 14
  const percentages = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
  percentages.forEach((p, index) => {
    const daysFromToday = Math.round(totalDays * p);
    if (daysFromToday <= 0) return;

    const milestoneDate = addDays(today, daysFromToday);
    const daysToExam = differenceInDays(targetDate, milestoneDate);

    // Hard cutover: proportional milestones only if > 14 days from exam
    if (daysToExam > 14) {
      milestones.push({
        id: `prop-${index}`,
        title: `Marco de ${Math.round(p * 100)}%`,
        description: 'Progresso proporcional na sua jornada de estudos.',
        date: milestoneDate,
        daysFromNow: daysToExam,
        icon: 'trending_up',
        color: 'text-blue-500',
        priority: 10,
        regime: 'proportional'
      });
    }
  });

  // 2. Every 3 Days Regime (Regime 2)
  // Days 14, 11, 8 before the exam
  [14, 11, 8].forEach(daysToExam => {
    if (totalDays >= daysToExam) {
      const milestoneDate = addDays(targetDate, -daysToExam);
      if (!isBefore(milestoneDate, today)) {
        milestones.push({
          id: `periodic-${daysToExam}`,
          title: `Faltam ${daysToExam} dias`,
          description: daysToExam === 14 ? 'Início da quinzena final. Hora de focar nos temas principais.' :
                       daysToExam === 11 ? 'Revisão intermediária e ajustes de cronograma.' :
                       'Consolidação de conceitos e resolução de questões.',
          date: milestoneDate,
          daysFromNow: daysToExam,
          icon: 'event',
          color: 'text-amber-500',
          priority: 50,
          regime: 'every3days'
        });
      }
    }
  });

  // 3. Daily Regime (Regime 3)
  // Days 1 through 7 before the exam
  const dailyFocus = [
    { day: 7, title: 'Simulado Geral', desc: 'Dia de testar seus conhecimentos em condições reais.', icon: 'assignment' },
    { day: 6, title: 'Revisão de Erros', desc: 'Foco total nos pontos que você errou no simulado.', icon: 'history_edu' },
    { day: 5, title: 'Flashcards & Resumos', desc: 'Revisão rápida de conceitos e fórmulas importantes.', icon: 'style' },
    { day: 4, title: 'Questões Rápidas', desc: 'Manter o ritmo com questões de nível fácil e médio.', icon: 'quiz' },
    { day: 3, title: 'Checklist Final', desc: 'Verificar se todos os tópicos essenciais foram revisados.', icon: 'checklist' },
    { day: 2, title: 'Revisão Leve', desc: 'Apenas os pontos mais críticos e leitura de resumos.', icon: 'auto_stories' },
    { day: 1, title: 'Véspera: Descanso', desc: 'Mente tranquila e preparo emocional para amanhã.', icon: 'self_improvement' },
  ];

  dailyFocus.forEach(focus => {
    if (totalDays >= focus.day) {
      const milestoneDate = addDays(targetDate, -focus.day);
      if (!isBefore(milestoneDate, today)) {
        milestones.push({
          id: `daily-${focus.day}`,
          title: focus.title,
          description: focus.desc,
          date: milestoneDate,
          daysFromNow: focus.day,
          icon: focus.icon,
          color: 'text-emerald-500',
          priority: 100,
          regime: 'daily'
        });
      }
    }
  });

  // 4. Exam Day
  milestones.push({
    id: 'dia-da-prova',
    title: 'Dia da Prova',
    description: 'O momento de brilhar e conquistar sua aprovação!',
    date: targetDate,
    daysFromNow: 0,
    icon: 'stars',
    color: 'text-indigo-600',
    priority: 1000,
    regime: 'exam'
  });

  return milestones.sort((a, b) => a.date.getTime() - b.date.getTime());
};

export const deduplicateMilestones = (milestones: Milestone[]): Milestone[] => {
  const dateMap = new Map<string, Milestone>();

  milestones.forEach(m => {
    const dateStr = format(m.date, 'yyyy-MM-dd');
    const existing = dateMap.get(dateStr);
    
    if (!existing || m.priority > existing.priority) {
      dateMap.set(dateStr, m);
    }
  });

  return Array.from(dateMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
};
