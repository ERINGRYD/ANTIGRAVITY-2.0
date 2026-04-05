export type KnowledgeLevel = 'iniciante' | 'intermediario' | 'avancado';

export const LEVEL_WEIGHTS: Record<KnowledgeLevel, number> = {
  iniciante:     3,  // most time needed — lowest mastery
  intermediario: 2,
  avancado:      1,  // least time needed — highest mastery
};

export const LEVEL_LABELS: Record<KnowledgeLevel, string> = {
  iniciante:     'Iniciante',
  intermediario: 'Intermediário',
  avancado:      'Avançado',
};

// IMPORTANT: level is inverted — Iniciante gets more time, not less
// This is intentional: you study more what you know less
export function calculateCombinedWeight(
  priority: number,           // 1-5
  level: KnowledgeLevel
): number {
  const levelWeight = LEVEL_WEIGHTS[level];
  return levelWeight + (priority - 1) * 0.5;
}

// Returns 0-100 percentage of cycle time for one subject
// allSubjects must include the subject itself
export function calculateCyclePercent(
  subjectId: string,
  allSubjects: Array<{ id: string; priority: number; knowledgeLevel: KnowledgeLevel }>
): number {
  const weights = allSubjects.map(s => ({
    id: s.id,
    weight: calculateCombinedWeight(s.priority, s.knowledgeLevel),
  }));

  const totalWeight = weights.reduce((sum, s) => sum + s.weight, 0);
  if (totalWeight === 0) return 0;

  const subjectWeight = weights.find(s => s.id === subjectId)?.weight ?? 0;
  return Math.round((subjectWeight / totalWeight) * 100);
}

// Returns all subjects with their calculated percentages
// Useful for rendering all cards at once
export function calculateAllCyclePercents(
  subjects: Array<{ id: string; priority: number; knowledgeLevel: KnowledgeLevel }>
): Record<string, number> {
  const weights = subjects.map(s => ({
    id: s.id,
    weight: calculateCombinedWeight(s.priority, s.knowledgeLevel),
  }));

  const totalWeight = weights.reduce((sum, s) => sum + s.weight, 0);
  if (totalWeight === 0) return {};

  return Object.fromEntries(
    weights.map(s => [
      s.id,
      Math.round((s.weight / totalWeight) * 100),
    ])
  );
}
