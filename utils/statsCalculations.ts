import { BattleAttempt, StatsFilters, ConfidenceLevel, ErrorType } from '../types';

// Filter attempts by period and subject
export function filterAttempts(
  attempts: BattleAttempt[],
  filters: StatsFilters
): BattleAttempt[] {
  const now = new Date();
  let cutoff = new Date(0);

  if (filters.period === '7d') {
    cutoff = new Date(now.setDate(now.getDate() - 7));
  } else if (filters.period === '30d') {
    cutoff = new Date(now.setDate(now.getDate() - 30));
  } else if (filters.period === '90d') {
    cutoff = new Date(now.setDate(now.getDate() - 90));
  }

  return attempts.filter(a => {
    const attemptDate = new Date(a.attemptedAt);
    const matchesPeriod = filters.period === 'all' || attemptDate >= cutoff;
    const matchesSubject = filters.subjectId === null || a.subjectId === filters.subjectId;
    return matchesPeriod && matchesSubject;
  });
}

// Weighted score calculation
// correct-certain: 1.0 | correct-doubtful: 0.6 | correct-guess: 0.2
// wrong-certain: -0.5 | wrong-doubtful: 0.0 | wrong-guess: 0.1
export function calculateWeightedScore(attempts: BattleAttempt[]): number {
  if (attempts.length === 0) return 0;
  
  const totalWeight = attempts.reduce((acc, a) => {
    if (a.isCorrect) {
      if (a.confidence === 'certain') return acc + 1.0;
      if (a.confidence === 'doubtful') return acc + 0.6;
      if (a.confidence === 'guess') return acc + 0.2;
    } else {
      if (a.confidence === 'certain') return acc - 0.5;
      if (a.confidence === 'doubtful') return acc + 0.0;
      if (a.confidence === 'guess') return acc + 0.1;
    }
    return acc;
  }, 0);

  // Normalize to 0-100 based on max possible score (all correct-certain)
  const maxPossible = attempts.length * 1.0;
  const score = (totalWeight / maxPossible) * 100;
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Pure accuracy (correct / total * 100)
export function calculateAccuracy(attempts: BattleAttempt[]): number {
  if (attempts.length === 0) return 0;
  const correct = attempts.filter(a => a.isCorrect).length;
  return Math.round((correct / attempts.length) * 100);
}

// Delta between accuracy and weighted score
export function calculateLuckIndex(attempts: BattleAttempt[]): number {
  if (attempts.length === 0) return 0;
  return calculateAccuracy(attempts) - calculateWeightedScore(attempts);
}

// Metacognition index (0-100)
/*
 * Metacognition Index Formula:
 * This index measures how well a student's confidence aligns with their actual performance.
 * It is calculated as the percentage of "well-calibrated" answers out of total answers.
 * A well-calibrated answer is either:
 * 1. Correct AND marked as "certain" (they knew it and were right)
 * 2. Incorrect AND marked as "guess" (they didn't know it and were wrong)
 * 
 * Why Weighted Score is preferred over Accuracy:
 * Accuracy treats all correct answers equally (a lucky guess = a known fact).
 * Weighted score penalizes overconfidence (wrong + certain) and rewards true mastery (correct + certain),
 * providing a much more accurate representation of actual learning progress.
 */
export function calculateMetacognitionIndex(attempts: BattleAttempt[]): number {
  const total = attempts.length;
  if (total === 0) return 0;
  const wellCalibrated = attempts.filter(a =>
    (a.isCorrect && a.confidence === 'certain') ||
    (!a.isCorrect && a.confidence === 'guess')
  ).length;
  return Math.round((wellCalibrated / total) * 100);
}

// Find the subject/topic with highest misconception rate
// Misconception = wrong + certain
export function findBiggestBlindSpot(
  attempts: BattleAttempt[]
): { subjectName: string; topicName: string; rate: number } | null {
  const topicStats: Record<string, { subjectName: string, topicName: string, total: number, misconceptions: number }> = {};
  
  attempts.forEach(a => {
    if (!topicStats[a.topicId]) {
      topicStats[a.topicId] = {
        subjectName: a.subjectName,
        topicName: a.topicName,
        total: 0,
        misconceptions: 0
      };
    }
    topicStats[a.topicId].total++;
    if (!a.isCorrect && a.confidence === 'certain') {
      topicStats[a.topicId].misconceptions++;
    }
  });

  let maxRate = 0;
  let blindSpot = null;

  Object.values(topicStats).forEach(stat => {
    if (stat.total >= 3) { // Minimum threshold to be considered a blind spot
      const rate = Math.round((stat.misconceptions / stat.total) * 100);
      if (rate > maxRate) {
        maxRate = rate;
        blindSpot = { subjectName: stat.subjectName, topicName: stat.topicName, rate };
      }
    }
  });

  return blindSpot;
}

// Calculate peak performance hour (0-23)
export function findPeakHour(attempts: BattleAttempt[]): {
  hour: number
  distractionRate: number
} | null {
  const hourlyStats: Record<number, { total: number, distractions: number }> = {};
  
  attempts.forEach(a => {
    const hour = new Date(a.attemptedAt).getHours();
    if (!hourlyStats[hour]) {
      hourlyStats[hour] = { total: 0, distractions: 0 };
    }
    hourlyStats[hour].total++;
    if (!a.isCorrect && a.errorType === 'distraction') {
      hourlyStats[hour].distractions++;
    }
  });

  let bestHour = -1;
  let minDistractionRate = 101;

  Object.entries(hourlyStats).forEach(([hourStr, stat]) => {
    if (stat.total >= 5) { // Minimum threshold
      const rate = Math.round((stat.distractions / stat.total) * 100);
      if (rate < minDistractionRate) {
        minDistractionRate = rate;
        bestHour = parseInt(hourStr);
      }
    }
  });

  if (bestHour === -1) return null;
  return { hour: bestHour, distractionRate: minDistractionRate };
}

// Calculate ideal battle duration in minutes
export function calculateIdealBattleDuration(attempts: BattleAttempt[]): number | null {
  if (attempts.length < 20) return null;
  
  // Group by session duration
  const durationStats: Record<number, { total: number, distractions: number }> = {};
  
  attempts.forEach(a => {
    // Bucket into 5-minute intervals
    const bucket = Math.floor(a.sessionDurationMinutes / 5) * 5;
    if (!durationStats[bucket]) {
      durationStats[bucket] = { total: 0, distractions: 0 };
    }
    durationStats[bucket].total++;
    if (!a.isCorrect && a.errorType === 'distraction') {
      durationStats[bucket].distractions++;
    }
  });

  let idealDuration = 15; // Default fallback
  let previousRate = 0;
  
  const sortedBuckets = Object.keys(durationStats).map(Number).sort((a, b) => a - b);
  
  for (const bucket of sortedBuckets) {
    const stat = durationStats[bucket];
    if (stat.total >= 5) {
      const rate = stat.distractions / stat.total;
      // If distraction rate jumps significantly (e.g., > 10% increase), the previous bucket is the ideal duration
      if (rate > previousRate + 0.1 && previousRate > 0) {
        idealDuration = bucket - 5;
        break;
      }
      previousRate = rate;
      idealDuration = bucket; // Keep updating as long as it's stable
    }
  }

  return idealDuration > 0 ? idealDuration : null;
}

// Group attempts by subject
export function groupBySubject(
  attempts: BattleAttempt[]
): Record<string, BattleAttempt[]> {
  return attempts.reduce((acc, a) => {
    if (!acc[a.subjectId]) acc[a.subjectId] = [];
    acc[a.subjectId].push(a);
    return acc;
  }, {} as Record<string, BattleAttempt[]>);
}

// Group attempts by topic
export function groupByTopic(
  attempts: BattleAttempt[]
): Record<string, BattleAttempt[]> {
  return attempts.reduce((acc, a) => {
    if (!acc[a.topicId]) acc[a.topicId] = [];
    acc[a.topicId].push(a);
    return acc;
  }, {} as Record<string, BattleAttempt[]>);
}

// Group attempts by hour of day
export function groupByHour(
  attempts: BattleAttempt[]
): Record<number, BattleAttempt[]> {
  return attempts.reduce((acc, a) => {
    const hour = new Date(a.attemptedAt).getHours();
    if (!acc[hour]) acc[hour] = [];
    acc[hour].push(a);
    return acc;
  }, {} as Record<number, BattleAttempt[]>);
}

// Group attempts by day of week
export function groupByDayOfWeek(
  attempts: BattleAttempt[]
): Record<number, BattleAttempt[]> {
  return attempts.reduce((acc, a) => {
    const day = new Date(a.attemptedAt).getDay(); // 0 = Sunday
    if (!acc[day]) acc[day] = [];
    acc[day].push(a);
    return acc;
  }, {} as Record<number, BattleAttempt[]>);
}

// Weekly evolution: split attempts into 7 daily buckets
export function getWeeklyEvolution(attempts: BattleAttempt[]): Array<{
  date: string
  weightedScore: number
  accuracy: number
  total: number
}> {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const result = [];
  
  // Create buckets for the last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    
    const nextD = new Date(d);
    nextD.setDate(nextD.getDate() + 1);
    
    const dayAttempts = attempts.filter(a => {
      const attemptDate = new Date(a.attemptedAt);
      return attemptDate >= d && attemptDate < nextD;
    });
    
    result.push({
      date: days[d.getDay()],
      weightedScore: calculateWeightedScore(dayAttempts),
      accuracy: calculateAccuracy(dayAttempts),
      total: dayAttempts.length
    });
  }
  
  return result;
}

// Get confidence distribution as percentages
export function getConfidenceDistribution(attempts: BattleAttempt[]): {
  certain: number
  doubtful: number
  guess: number
} {
  const total = attempts.length;
  if (total === 0) return { certain: 0, doubtful: 0, guess: 0 };
  
  const certain = attempts.filter(a => a.confidence === 'certain').length;
  const doubtful = attempts.filter(a => a.confidence === 'doubtful').length;
  const guess = attempts.filter(a => a.confidence === 'guess').length;
  
  return {
    certain: Math.round((certain / total) * 100),
    doubtful: Math.round((doubtful / total) * 100),
    guess: Math.round((guess / total) * 100)
  };
}

// Get error type distribution as percentages (errors only)
export function getErrorTypeDistribution(attempts: BattleAttempt[]): {
  content: number
  interpretation: number
  distraction: number
} {
  const errors = attempts.filter(a => !a.isCorrect && a.errorType !== null);
  const total = errors.length;
  if (total === 0) return { content: 0, interpretation: 0, distraction: 0 };
  
  const content = errors.filter(a => a.errorType === 'content').length;
  const interpretation = errors.filter(a => a.errorType === 'interpretation').length;
  const distraction = errors.filter(a => a.errorType === 'distraction').length;
  
  return {
    content: Math.round((content / total) * 100),
    interpretation: Math.round((interpretation / total) * 100),
    distraction: Math.round((distraction / total) * 100)
  };
}

// Efficiency: weighted score per hour studied
export function calculateEfficiency(attempts: BattleAttempt[]): number {
  if (attempts.length === 0) return 0;
  
  const score = calculateWeightedScore(attempts);
  const totalSeconds = attempts.reduce((acc, a) => acc + a.timeSpentSeconds, 0);
  const totalHours = totalSeconds / 3600;
  
  if (totalHours === 0) return 0;
  return Math.round(score / totalHours);
}

// Average time per question in seconds
export function avgTimePerQuestion(attempts: BattleAttempt[]): number {
  if (attempts.length === 0) return 0;
  const totalSeconds = attempts.reduce((acc, a) => acc + a.timeSpentSeconds, 0);
  return Math.round(totalSeconds / attempts.length);
}

// Fatigue curve: compare avg time of first 5 vs last 5 questions per session
export function calculateFatigueCurve(attempts: BattleAttempt[]): {
  firstQuestions: number  // avg seconds
  lastQuestions: number   // avg seconds
  dropPercent: number     // performance drop percentage
} | null {
  // Group by session
  const sessions = attempts.reduce((acc, a) => {
    if (!acc[a.sessionId]) acc[a.sessionId] = [];
    acc[a.sessionId].push(a);
    return acc;
  }, {} as Record<string, BattleAttempt[]>);
  
  let firstTotal = 0;
  let firstCount = 0;
  let lastTotal = 0;
  let lastCount = 0;
  
  Object.values(sessions).forEach(sessionAttempts => {
    // Sort by time
    sessionAttempts.sort((a, b) => new Date(a.attemptedAt).getTime() - new Date(b.attemptedAt).getTime());
    
    if (sessionAttempts.length >= 10) {
      const first5 = sessionAttempts.slice(0, 5);
      const last5 = sessionAttempts.slice(-5);
      
      firstTotal += first5.reduce((acc, a) => acc + a.timeSpentSeconds, 0);
      firstCount += 5;
      
      lastTotal += last5.reduce((acc, a) => acc + a.timeSpentSeconds, 0);
      lastCount += 5;
    }
  });
  
  if (firstCount === 0 || lastCount === 0) return null;
  
  const firstAvg = firstTotal / firstCount;
  const lastAvg = lastTotal / lastCount;
  
  // If last questions take longer, it's a drop in performance (fatigue)
  const dropPercent = firstAvg > 0 ? Math.round(((lastAvg - firstAvg) / firstAvg) * 100) : 0;
  
  return {
    firstQuestions: Math.round(firstAvg),
    lastQuestions: Math.round(lastAvg),
    dropPercent
  };
}
