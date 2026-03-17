export type ConfidenceLevel = 'certain' | 'doubtful' | 'guess';
export type Room = 'reconhecimento' | 'critica' | 'alerta' | 'vencidos';

const WEIGHT_MATRIX: Record<string, number> = {
  'correct-certain':   1.0,  // confirmed mastery
  'correct-doubtful':  0.6,  // partial knowledge
  'correct-guess':     0.2,  // luck — does not indicate mastery
  'wrong-certain':    -0.5,  // dangerous misconception — penalized
  'wrong-doubtful':    0.0,  // expected gap — neutral
  'wrong-guess':       0.1,  // expected result — near neutral
};

export function getAttemptWeight(
  isCorrect: boolean, 
  confidence: ConfidenceLevel
): number {
  const key = `${isCorrect ? 'correct' : 'wrong'}-${confidence}`;
  return WEIGHT_MATRIX[key] ?? 0;
}

export interface QuestionAttempt {
  isCorrect: boolean;
  confidence: ConfidenceLevel;
  topicId: string;
  attemptedAt: string;   // ISO
}

export function calculateWeightedScore(attempts: QuestionAttempt[]): number {
  // Returns 0-100 where 100 = all correct with certainty
  if (attempts.length === 0) return 0;
  
  const totalWeight = attempts.reduce((sum, attempt) => {
    return sum + getAttemptWeight(attempt.isCorrect, attempt.confidence);
  }, 0);
  
  const maxPossible = attempts.length * 1.0;  // max weight per attempt is 1.0
  const score = (totalWeight / maxPossible) * 100;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function classifyEnemyRoom(
  weightedScore: number,
  questionsAnswered: number
): Room {
  // Thresholds are lower than pure accuracy thresholds (50/75 vs 70/85)
  // because weighted score is naturally more conservative —
  // reaching 75 weighted requires consistent mastery, not just correct answers
  if (questionsAnswered === 0) return 'reconhecimento';
  if (weightedScore < 50)     return 'critica';
  if (weightedScore < 75)     return 'alerta';
  return 'vencidos';
}

export function estimateMemoryStabilityWithConfidence(
  accuracyRate: number,      // pure accuracy 0-100
  weightedScore: number      // confidence-weighted score 0-100
): number {
  // Combined score weights weighted score more heavily (60%)
  // because it better reflects true mastery
  const combinedScore = (accuracyRate * 0.4) + (weightedScore * 0.6);
  
  if (combinedScore >= 80) return 20;  // strong mastery → slow forgetting
  if (combinedScore >= 65) return 12;  // partial mastery → medium forgetting
  if (combinedScore >= 45) return 7;   // weak mastery → fast forgetting
  return 4;                            // minimal mastery → very fast forgetting
}

export function sanitizeAttempts(attempts: Partial<QuestionAttempt>[]): QuestionAttempt[] {
  return attempts.map(attempt => ({
    ...attempt,
    confidence: attempt.confidence ?? 'doubtful',  // never undefined
    isCorrect: attempt.isCorrect ?? false,
    topicId: attempt.topicId ?? '',
    attemptedAt: attempt.attemptedAt ?? new Date().toISOString(),
  })) as QuestionAttempt[];
}

// Simulated Database Operations using localStorage
export async function readHistoricalAttempts(topicId: string): Promise<QuestionAttempt[]> {
  const data = localStorage.getItem(`attempts_${topicId}`);
  return data ? JSON.parse(data) : [];
}

export async function saveHistoricalAttempts(topicId: string, attempts: QuestionAttempt[]): Promise<void> {
  localStorage.setItem(`attempts_${topicId}`, JSON.stringify(attempts));
}

export async function readTopicRoom(topicId: string): Promise<Room | null> {
  return localStorage.getItem(`room_${topicId}`) as Room | null;
}

export async function persistRoomUpdate(
  topicId: string,
  newRoom: Room,
  weightedScore: number,
  accuracyRate: number
): Promise<boolean> {
  try {
    // Write new room to topic record
    localStorage.setItem(`room_${topicId}`, newRoom);
    
    // Write weightedScore and accuracyRate to topic record
    localStorage.setItem(`stats_${topicId}`, JSON.stringify({ weightedScore, accuracyRate }));
    
    // Verify write
    const verification = await readTopicRoom(topicId);
    if (verification !== newRoom) {
      console.error(`Room persistence failed for topic ${topicId}: expected ${newRoom}, got ${verification}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('persistRoomUpdate failed:', error);
    return false;
  }
}

export function updateEnemyRoom(
  topicId: string,
  allAttempts: QuestionAttempt[]
): {
  room: Room;
  weightedScore: number;
  accuracyRate: number;
  memoryStability: number;
} {
  const topicAttempts = allAttempts.filter(a => a.topicId === topicId);
  const questionsAnswered = topicAttempts.length;
  const questionsCorrect = topicAttempts.filter(a => a.isCorrect).length;
  
  const accuracyRate = questionsAnswered > 0
    ? Math.round((questionsCorrect / questionsAnswered) * 100)
    : 0;
    
  const weightedScore = calculateWeightedScore(topicAttempts);
  const room = classifyEnemyRoom(weightedScore, questionsAnswered);
  const memoryStability = estimateMemoryStabilityWithConfidence(
    accuracyRate, 
    weightedScore
  );
  
  return { room, weightedScore, accuracyRate, memoryStability };
}
