/**
 * SQL MIGRATION FOR ARCHIVED ENEMIES
 * 
 * CREATE TABLE IF NOT EXISTS archived_enemies (
 *   id TEXT PRIMARY KEY,
 *   topic_id TEXT NOT NULL,
 *   subject_id TEXT NOT NULL,
 *   topic_name TEXT NOT NULL,
 *   subject_name TEXT NOT NULL,
 *   original_victory_date TEXT NOT NULL,
 *   last_victory_date TEXT NOT NULL,
 *   last_victory_xp INTEGER NOT NULL DEFAULT 0,
 *   return_count INTEGER NOT NULL DEFAULT 0,
 *   current_interval INTEGER NOT NULL DEFAULT 1,
 *   next_return_date TEXT NOT NULL,
 *   memory_stability REAL NOT NULL DEFAULT 4,
 *   base_questions INTEGER NOT NULL DEFAULT 5,
 *   current_difficulty TEXT NOT NULL DEFAULT 'easy',
 *   contest_date TEXT,
 *   total_questions_available INTEGER NOT NULL DEFAULT 0,
 *   created_at TEXT NOT NULL,
 *   updated_at TEXT NOT NULL,
 *   FOREIGN KEY (topic_id) REFERENCES study_topics(id)
 * );
 */

export type Difficulty = 'easy' | 'medium' | 'hard' | 'very-hard';

export interface ArchivedEnemy {
  id: string;
  topicId: string;
  subjectId: string;
  topicName: string;
  subjectName: string;
  subjectIcon?: string;
  
  // Victory tracking
  originalVictoryDate: string;    // ISO — first defeat ever
  lastVictoryDate: string;        // ISO — most recent defeat
  lastVictoryXP: number;          // XP earned in the last battle
  
  // Spaced repetition state
  returnCount: number;            // how many times it has returned (starts at 0)
  currentInterval: number;        // days until next return
  nextReturnDate: string;         // ISO — calculated after each victory
  
  // Forgetting curve
  memoryStability: number;        // S value in Ebbinghaus formula
                                  // estimated from accuracy on first defeat
                                  // refined after each subsequent battle
  
  // Next battle configuration
  baseQuestions: number;          // starts at 5, grows per return and per day
  currentDifficulty: Difficulty;  // scales per return and per day without review
  
  // Contest deadline (global user setting)
  contestDate: string | null;     // affects interval calculation after 5th return
  
  // Meta
  totalQuestionsAvailable: number; // max questions for this topic in the database
  createdAt: string;
  updatedAt: string;
}

/**
 * EBBINGHAUS IMPLEMENTATION & MEMORY STABILITY REFINEMENT
 * 
 * The Ebbinghaus Forgetting Curve models how memory retention declines over time.
 * We use the formula: Retention = e^(-t/S), where `t` is days since the last review
 * and `S` is the memory stability (days until retention drops to ~37%).
 * 
 * - estimateMemoryStability: Maps initial battle accuracy to an initial `S` value.
 *   Higher accuracy means a stronger initial memory trace (higher `S`), so the curve decays slower.
 * 
 * - refineMemoryStability: On subsequent reviews (returns), we update `S` using a weighted average
 *   of the new performance (60% weight) and the historical `S` (40% weight). This allows the system
 *   to adapt to the user's actual retention rate over time.
 */

export function estimateMemoryStability(accuracyRate: number): number {
  // S = days until ~37% retention (natural decay point)
  // Higher accuracy → stronger memory → slower forgetting
  if (accuracyRate >= 85) return 20;
  if (accuracyRate >= 70) return 12;
  if (accuracyRate >= 50) return 7;
  return 4;
}

export function refineMemoryStability(currentS: number, newAccuracy: number): number {
  const newS = estimateMemoryStability(newAccuracy);
  // Recent performance weighted at 60%, history at 40%
  return Math.round((newS * 0.6 + currentS * 0.4) * 10) / 10;
}

// Core Ebbinghaus formula
export function calculateRetention(daysSinceVictory: number, S: number): number {
  return Math.exp(-daysSinceVictory / S); // 0 to 1
}

// Bar value for display (0 to 100)
export function calculateBarValue(daysSinceVictory: number, S: number, enemy?: ArchivedEnemy): number {
  if (enemy) {
    const now = new Date().getTime();
    const last = new Date(enemy.lastVictoryDate).getTime();
    const next = new Date(enemy.nextReturnDate).getTime();
    
    if (now >= next) return 100;
    if (now <= last) return 0;
    
    const totalDuration = next - last;
    const elapsed = now - last;
    
    // Calculate progress (0 to 1)
    const progress = elapsed / totalDuration;
    
    // Use an easing function to make it look like a curve (starts fast, slows down)
    // This simulates the forgetting curve shape where you forget a lot initially
    const curveProgress = 1 - Math.pow(1 - progress, 2);
    
    return Math.min(Math.round(curveProgress * 100), 100);
  }

  const retention = calculateRetention(daysSinceVictory, S);
  return Math.min(Math.round((1 - retention) * 100), 100);
}

// Bar color based on value
export function getBarColor(barValue: number): string {
  if (barValue < 40) return '#22C55E';   // green — safe
  if (barValue < 70) return '#F59E0B';   // amber — fading
  if (barValue < 90) return '#EF4444';   // red — critical
  return '#7C3AED';                      // purple — returning
}

export function calculateNextInterval(returnCount: number): number {
  const schedule = [1, 7, 15, 30];
  if (returnCount < schedule.length) return schedule[returnCount];
  return 30; // fixed 30-day interval from 5th return onward
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function calculateNextReturnDate(
  lastVictoryDate: string,
  returnCount: number,
  contestDate: string | null
): string {
  const interval = calculateNextInterval(returnCount);
  const nextDate = addDays(new Date(lastVictoryDate), interval);
  
  if (contestDate) {
    const contest = new Date(contestDate);
    if (nextDate > contest) return contest.toISOString();
  }
  
  return nextDate.toISOString();
}

export function calculateCurrentQuestions(
  enemy: ArchivedEnemy,
  daysSinceVictory: number
): number {
  const forgettingRate = 1 - calculateRetention(daysSinceVictory, enemy.memoryStability);
  const questionRange = enemy.totalQuestionsAvailable - 5;
  const current = Math.round(5 + (forgettingRate * questionRange));
  return Math.min(current, enemy.totalQuestionsAvailable);
}

export function calculateCurrentDifficulty(
  baseReturnDifficulty: Difficulty,
  barValue: number
): Difficulty {
  // Escalate difficulty as bar fills
  if (barValue >= 90) return 'very-hard';
  if (barValue >= 70) return 'hard';
  if (barValue >= 40) return 'medium';
  return baseReturnDifficulty;  // stays at base if bar is low
}

export function shouldEnemyReturn(enemy: ArchivedEnemy): boolean {
  const now = new Date();
  const returnDate = new Date(enemy.nextReturnDate);
  return now >= returnDate;
}

// Synchronous localStorage operation.
// If migrating to async storage, add async/await at that time.
export function saveArchivedEnemy(enemy: ArchivedEnemy): void {
  const current = getArchivedEnemies();
  const updated = current.filter(e => e.topicId !== enemy.topicId);
  updated.push(enemy);
  localStorage.setItem('archived_enemies', JSON.stringify(updated));
}

// Synchronous localStorage operation.
// If migrating to async storage, add async/await at that time.
export function updateArchivedEnemy(enemy: ArchivedEnemy): void {
  const current = getArchivedEnemies();
  const updated = current.map(e => 
    e.topicId === enemy.topicId ? enemy : e
  );
  localStorage.setItem('archived_enemies', JSON.stringify(updated));
}

// Synchronous localStorage operation.
// If migrating to async storage, add async/await at that time.
export function deleteArchivedEnemy(topicId: string): void {
  const current = getArchivedEnemies();
  const updated = current.filter(e => e.topicId !== topicId);
  localStorage.setItem('archived_enemies', JSON.stringify(updated));
  // Reset room state so it can be fought again in the Battle Field
  localStorage.setItem(`room_${topicId}`, 'reconhecimento');
}

// Synchronous localStorage operation.
// If migrating to async storage, add async/await at that time.
export function deleteArchivedEnemiesBySubject(subjectId: string): void {
  const current = getArchivedEnemies();
  const enemiesToDelete = current.filter(e => e.subjectId === subjectId);
  const updated = current.filter(e => e.subjectId !== subjectId);
  localStorage.setItem('archived_enemies', JSON.stringify(updated));
  
  // Reset room states
  enemiesToDelete.forEach(e => {
    localStorage.setItem(`room_${e.topicId}`, 'reconhecimento');
  });
}

// Synchronous localStorage operation.
// If migrating to async storage, add async/await at that time.
export function getArchivedEnemies(): ArchivedEnemy[] {
  try {
    return JSON.parse(localStorage.getItem('archived_enemies') ?? '[]');
  } catch {
    return [];
  }
}

// Synchronous localStorage operation.
// If migrating to async storage, add async/await at that time.
export function loadArchivedEnemy(topicId: string): ArchivedEnemy | null {
  return getArchivedEnemies().find(e => e.topicId === topicId) ?? null;
}

export async function removeEnemyFromBattleField(topicId: string): Promise<void> {
  // In our simulated environment, we update the room to 'vencidos'
  localStorage.setItem(`room_${topicId}`, 'vencidos');
  console.log('[Archive] STEP B ✓ — Enemy removed from Battle Field rooms');
}

export async function onArchiveEnemy(
  topicId: string,
  weightedScore: number,
  accuracyRate: number,
  xpEarned: number,
  existingEnemy: ArchivedEnemy | null,
  contestDate: string | null = null,
  topicName: string = 'Tópico Desconhecido',
  subjectId: string = 'unknown',
  subjectName: string = 'Matéria Desconhecida',
  totalQuestionsAvailable: number = 20
): Promise<void> {
  console.log('[Archive] onArchiveEnemy called:', {
    topicId, weightedScore, accuracyRate, existingEnemy: !!existingEnemy
  });

  // GUARD — never archive below threshold
  if (weightedScore < 75) {
    console.error('[Archive] Aborted — score below threshold:', weightedScore);
    return;
  }

  // We need a simple estimate since estimateMemoryStabilityWithConfidence is in another file
  // and we want to avoid circular dependencies if possible, or just use the basic one here
  const memoryStability = refineMemoryStability(
    estimateMemoryStability(accuracyRate), 
    weightedScore
  );

  const now = new Date().toISOString();

  // STEP A — Create or update archived_enemies record
  if (existingEnemy === null) {
    // First time defeating this enemy
    const newEnemy: ArchivedEnemy = {
      id: crypto.randomUUID(),
      topicId,
      subjectId,
      topicName,
      subjectName,
      originalVictoryDate: now,
      lastVictoryDate: now,
      lastVictoryXP: xpEarned,
      returnCount: 0,
      currentInterval: calculateNextInterval(0),
      nextReturnDate: calculateNextReturnDate(now, 0, contestDate),
      memoryStability,
      baseQuestions: 5,
      currentDifficulty: 'easy',
      contestDate,
      totalQuestionsAvailable,
      createdAt: now,
      updatedAt: now,
    };

    saveArchivedEnemy(newEnemy);
    console.log('[Archive] STEP A ✓ — New archived enemy created:', topicId);

  } else {
    // Enemy is returning — increment returnCount
    const updated: ArchivedEnemy = {
      ...existingEnemy,
      lastVictoryDate: now,
      lastVictoryXP: xpEarned,
      returnCount: existingEnemy.returnCount + 1,
      currentInterval: calculateNextInterval(existingEnemy.returnCount + 1),
      nextReturnDate: calculateNextReturnDate(
        now,
        existingEnemy.returnCount + 1,
        contestDate
      ),
      memoryStability: refineMemoryStability(
        existingEnemy.memoryStability,
        weightedScore
      ),
      updatedAt: now,
    };

    updateArchivedEnemy(updated);
    console.log('[Archive] STEP A ✓ — Existing enemy re-archived. Return count:',
      updated.returnCount);
  }

  // STEP B — Remove enemy from active Battle Field rooms
  await removeEnemyFromBattleField(topicId);

  // STEP C — Invalidate UI state so Battle Field no longer shows this enemy
  // For this local storage based app, we can dispatch a custom event
  window.dispatchEvent(new CustomEvent('enemy_archived', { detail: { topicId } }));
  console.log('[Archive] STEP C ✓ — UI state invalidated');
}
