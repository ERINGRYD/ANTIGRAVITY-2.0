import { Theme } from '../types/theme.types';
import { Topic } from '../types';

type SortableItem = Theme | Topic;

/**
 * Theme Priority Utilities
 * 
 * - Minimum priority is 1 (never 0) to ensure every theme has a valid priority level.
 * - Manual order and priority order coexist: Priority is the default sort, but if a user
 *   manually reorders themes (drag-and-drop), the manual order (Theme.order) takes precedence.
 * - Tiebreaker rule: When sorting by priority or selecting the next theme in auto mode,
 *   if priorities are equal, the Theme.order is used as a tiebreaker to maintain a stable sort
 *   and respect any manual ordering within the same priority level.
 */

// Sort themes by priority (5 first), stable within same priority
export function sortThemesByPriority<T extends SortableItem>(themes: T[]): T[] {
  return [...themes].sort((a, b) => {
    if (b.priority !== a.priority) {
      return (b.priority || 1) - (a.priority || 1);
    }
    const orderA = 'order' in a ? a.order : 0;
    const orderB = 'order' in b ? b.order : 0;
    return orderA - orderB;
  });
}

// Select highest-priority incomplete theme for auto mode
export function resolveNextTheme<T extends SortableItem>(themes: T[], isAutoCycle: boolean): T | null {
  const pendingThemes = themes.filter(t => !t.isCompleted);
  
  if (pendingThemes.length === 0) return null;
  
  if (isAutoCycle) {
    return pendingThemes.reduce((best, current) => {
      const currentPriority = current.priority || 1;
      const bestPriority = best.priority || 1;
      
      if (currentPriority > bestPriority) return current;
      if (currentPriority === bestPriority) {
        const orderCurrent = 'order' in current ? current.order : 0;
        const orderBest = 'order' in best ? best.order : 0;
        if (orderCurrent < orderBest) return current;
      }
      return best;
    });
  }
  
  return null;
}

// Group themes by priority for Subject card summary
export function groupThemesByPriority<T extends SortableItem>(themes: T[]): Array<{ priority: 1|2|3|4|5; count: number }> {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  themes.forEach(t => {
    const p = (t.priority || 1) as 1|2|3|4|5;
    counts[p]++;
  });
  
  return ([5, 4, 3, 2, 1] as const)
    .filter(p => counts[p] > 0)
    .map(p => ({ priority: p, count: counts[p] }));
}

// Check if all themes have the same priority
export function allSamePriority<T extends SortableItem>(themes: T[]): boolean {
  if (themes.length <= 1) return true;
  const firstPriority = themes[0].priority || 1;
  return themes.every(t => (t.priority || 1) === firstPriority);
}

// Get priority label for display
export function getPriorityLabel(priority: 1|2|3|4|5): string {
  const labels = {
    1: 'Baixa prioridade',
    2: 'Prioridade baixa-média',
    3: 'Prioridade média',
    4: 'Alta prioridade',
    5: 'Prioridade máxima',
  };
  return labels[priority];
}
