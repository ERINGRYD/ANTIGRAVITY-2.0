/**
 * cycleStats.ts - Utility functions for the Statistics page.
 * 
 * - How sessions and attempts are correlated:
 *   Sessions and attempts can be correlated by themeId and timestamp proximity.
 *   For example, getOptimalSessionDuration groups attempts that occurred within 24h
 *   after a session of a specific duration bucket.
 * 
 * - Why the 28-day heatmap ignores the period filter:
 *   The heatmap is designed to show a fixed 4-week window to provide a consistent
 *   view of recent study habits, regardless of the currently selected period.
 * 
 * - The ROI score/hour formula and its limitations:
 *   ROI is calculated as (weighted score) / (study hours). This metric can be
 *   highly volatile or misleading with very few data points (e.g., high score
 *   with only 5 minutes of study). We require a minimum number of attempts
 *   to classify the trend and ROI accurately.
 */

import { StudySession, QuestionAttempt } from '../types/stats.types';

// --- Study Session utilities ---

export function getTotalStudyTime(sessions: StudySession[]): {
  studyMinutes: number;
  pauseMinutes: number;
  totalMinutes: number;
  focusRatio: number;
} {
  const studyMinutes = sessions.reduce((acc, s) => acc + s.studyMinutes, 0);
  const pauseMinutes = sessions.reduce((acc, s) => acc + s.pauseMinutes, 0);
  const totalMinutes = studyMinutes + pauseMinutes;
  const focusRatio = totalMinutes > 0 ? studyMinutes / totalMinutes : 0;

  return { studyMinutes, pauseMinutes, totalMinutes, focusRatio };
}

export function getSessionsByDay(sessions: StudySession[]): Record<string, number> {
  const result: Record<string, number> = {};
  sessions.forEach(s => {
    const date = s.startedAt.split('T')[0];
    result[date] = (result[date] || 0) + s.studyMinutes;
  });
  return result;
}

export function getAvgSessionDuration(sessions: StudySession[]): number {
  if (sessions.length === 0) return 0;
  const totalDuration = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  return totalDuration / sessions.length;
}

export function getTimeBySubject(sessions: StudySession[]): Array<{
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  studyMinutes: number;
  pauseMinutes: number;
  sessionsCount: number;
  pomodorosCompleted: number;
  vsGoalPercent: number | null;
}> {
  const map = new Map<string, any>();
  sessions.forEach(s => {
    if (!map.has(s.subjectId)) {
      map.set(s.subjectId, {
        subjectId: s.subjectId,
        subjectName: s.subjectName,
        subjectColor: s.subjectColor,
        studyMinutes: 0,
        pauseMinutes: 0,
        sessionsCount: 0,
        pomodorosCompleted: 0,
        vsGoalPercent: null,
      });
    }
    const entry = map.get(s.subjectId);
    entry.studyMinutes += s.studyMinutes;
    entry.pauseMinutes += s.pauseMinutes;
    entry.sessionsCount += 1;
    entry.pomodorosCompleted += s.pomodorosCompleted;
  });
  return Array.from(map.values()).sort((a, b) => b.studyMinutes - a.studyMinutes);
}

export function getTimeByTheme(sessions: StudySession[]): Array<{
  themeId: string;
  themeName: string;
  subjectName: string;
  subjectColor: string;
  studyMinutes: number;
  sessionsCount: number;
}> {
  const map = new Map<string, any>();
  sessions.forEach(s => {
    if (!s.themeId) return;
    if (!map.has(s.themeId)) {
      map.set(s.themeId, {
        themeId: s.themeId,
        themeName: s.themeName || 'Sem tema',
        subjectName: s.subjectName,
        subjectColor: s.subjectColor,
        studyMinutes: 0,
        sessionsCount: 0,
      });
    }
    const entry = map.get(s.themeId);
    entry.studyMinutes += s.studyMinutes;
    entry.sessionsCount += 1;
  });
  return Array.from(map.values()).sort((a, b) => b.studyMinutes - a.studyMinutes);
}

export function getStudyEvolutionByDay(sessions: StudySession[]): Array<{
  date: string;
  studyMinutes: number;
  pauseMinutes: number;
  sessionsCount: number;
}> {
  const map = new Map<string, any>();
  sessions.forEach(s => {
    const date = s.startedAt.split('T')[0];
    if (!map.has(date)) {
      map.set(date, { date, studyMinutes: 0, pauseMinutes: 0, sessionsCount: 0 });
    }
    const entry = map.get(date);
    entry.studyMinutes += s.studyMinutes;
    entry.pauseMinutes += s.pauseMinutes;
    entry.sessionsCount += 1;
  });
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function getPeakStudyHours(sessions: StudySession[]): Array<{
  hour: number;
  totalMinutes: number;
  avgMinutes: number;
}> {
  const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, totalMinutes: 0, avgMinutes: 0, count: 0 }));
  sessions.forEach(s => {
    const hour = new Date(s.startedAt).getHours();
    hours[hour].totalMinutes += s.studyMinutes;
    hours[hour].count += 1;
  });
  hours.forEach(h => {
    h.avgMinutes = h.count > 0 ? h.totalMinutes / h.count : 0;
  });
  return hours.sort((a, b) => b.totalMinutes - a.totalMinutes);
}

export function getCompletionRate(sessions: StudySession[]): number {
  if (sessions.length === 0) return 0;
  const completed = sessions.filter(s => s.wasCompleted).length;
  return (completed / sessions.length) * 100;
}

// --- Question/Simulation utilities ---

function calculateWeightedScore(correct: number, wrong: number, attempts: QuestionAttempt[]): number {
  if (attempts.length === 0) return 0;
  // Existing weight logic (simplified for this example, adjust if needed)
  let score = 0;
  attempts.forEach(a => {
    if (a.isCorrect) {
      if (a.confidence === 'certain') score += 1;
      else if (a.confidence === 'doubtful') score += 0.8;
      else score += 0.5;
    } else {
      if (a.confidence === 'certain') score -= 1;
      else if (a.confidence === 'doubtful') score -= 0.5;
      else score -= 0.2;
    }
  });
  const maxScore = attempts.length;
  return Math.max(0, Math.min(100, (score / maxScore) * 100));
}

export function getPerformanceMetrics(attempts: QuestionAttempt[]): {
  total: number;
  correct: number;
  wrong: number;
  accuracy: number;
  weightedScore: number;
  avgTimeSeconds: number;
  totalTimeMinutes: number;
  totalXP: number;
} {
  const total = attempts.length;
  if (total === 0) return { total: 0, correct: 0, wrong: 0, accuracy: 0, weightedScore: 0, avgTimeSeconds: 0, totalTimeMinutes: 0, totalXP: 0 };

  const correct = attempts.filter(a => a.isCorrect).length;
  const wrong = total - correct;
  const accuracy = (correct / total) * 100;
  const weightedScore = calculateWeightedScore(correct, wrong, attempts);
  const totalTimeSeconds = attempts.reduce((acc, a) => acc + a.timeSpentSeconds, 0);
  const avgTimeSeconds = totalTimeSeconds / total;
  const totalTimeMinutes = totalTimeSeconds / 60;
  const totalXP = attempts.reduce((acc, a) => acc + a.xpEarned, 0);

  return { total, correct, wrong, accuracy, weightedScore, avgTimeSeconds, totalTimeMinutes, totalXP };
}

export function getConfidenceMatrix(attempts: QuestionAttempt[]): Record<string, { count: number; percent: number }> {
  const total = attempts.length;
  const matrix: Record<string, { count: number; percent: number }> = {
    'correct-certain': { count: 0, percent: 0 },
    'correct-doubtful': { count: 0, percent: 0 },
    'correct-guess': { count: 0, percent: 0 },
    'wrong-certain': { count: 0, percent: 0 },
    'wrong-doubtful': { count: 0, percent: 0 },
    'wrong-guess': { count: 0, percent: 0 },
  };

  if (total === 0) return matrix;

  attempts.forEach(a => {
    const key = `${a.isCorrect ? 'correct' : 'wrong'}-${a.confidence}`;
    if (matrix[key]) {
      matrix[key].count += 1;
    }
  });

  Object.keys(matrix).forEach(key => {
    matrix[key].percent = (matrix[key].count / total) * 100;
  });

  return matrix;
}

export function getMetricsBySubject(attempts: QuestionAttempt[]): Array<{
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  total: number;
  correct: number;
  accuracy: number;
  weightedScore: number;
  avgTimeSeconds: number;
  totalTimeMinutes: number;
}> {
  const map = new Map<string, QuestionAttempt[]>();
  attempts.forEach(a => {
    if (!map.has(a.subjectId)) map.set(a.subjectId, []);
    map.get(a.subjectId)!.push(a);
  });

  return Array.from(map.entries()).map(([subjectId, subjAttempts]) => {
    const metrics = getPerformanceMetrics(subjAttempts);
    const first = subjAttempts[0];
    return {
      subjectId,
      subjectName: first.subjectName,
      subjectColor: first.subjectColor,
      total: metrics.total,
      correct: metrics.correct,
      accuracy: metrics.accuracy,
      weightedScore: metrics.weightedScore,
      avgTimeSeconds: metrics.avgTimeSeconds,
      totalTimeMinutes: metrics.totalTimeMinutes,
    };
  }).sort((a, b) => a.weightedScore - b.weightedScore);
}

export function getMetricsByTheme(attempts: QuestionAttempt[]): Array<{
  themeId: string;
  themeName: string;
  subjectName: string;
  subjectColor: string;
  total: number;
  correct: number;
  accuracy: number;
  weightedScore: number;
  avgTimeSeconds: number;
  totalTimeMinutes: number;
}> {
  const map = new Map<string, QuestionAttempt[]>();
  attempts.forEach(a => {
    if (!a.topicId) return;
    if (!map.has(a.topicId)) map.set(a.topicId, []);
    map.get(a.topicId)!.push(a);
  });

  return Array.from(map.entries()).map(([themeId, themeAttempts]) => {
    const metrics = getPerformanceMetrics(themeAttempts);
    const first = themeAttempts[0];
    return {
      themeId,
      themeName: first.topicName,
      subjectName: first.subjectName,
      subjectColor: first.subjectColor,
      total: metrics.total,
      correct: metrics.correct,
      accuracy: metrics.accuracy,
      weightedScore: metrics.weightedScore,
      avgTimeSeconds: metrics.avgTimeSeconds,
      totalTimeMinutes: metrics.totalTimeMinutes,
    };
  }).sort((a, b) => a.weightedScore - b.weightedScore);
}

export function getWeightedScoreEvolution(attempts: QuestionAttempt[]): Array<{
  date: string;
  weightedScore: number;
  accuracy: number;
  total: number;
}> {
  const map = new Map<string, QuestionAttempt[]>();
  attempts.forEach(a => {
    const date = a.attemptedAt.split('T')[0];
    if (!map.has(date)) map.set(date, []);
    map.get(date)!.push(a);
  });

  return Array.from(map.entries()).map(([date, dateAttempts]) => {
    const metrics = getPerformanceMetrics(dateAttempts);
    return {
      date,
      weightedScore: metrics.weightedScore,
      accuracy: metrics.accuracy,
      total: metrics.total,
    };
  }).sort((a, b) => a.date.localeCompare(b.date));
}

export function getErrorDistribution(attempts: QuestionAttempt[]): {
  content: number;
  interpretation: number;
  distraction: number;
} {
  const wrongAttempts = attempts.filter(a => !a.isCorrect && a.errorType);
  const total = wrongAttempts.length;
  if (total === 0) return { content: 0, interpretation: 0, distraction: 0 };

  const counts = { content: 0, interpretation: 0, distraction: 0 };
  wrongAttempts.forEach(a => {
    if (a.errorType === 'content') counts.content++;
    else if (a.errorType === 'interpretation') counts.interpretation++;
    else if (a.errorType === 'distraction') counts.distraction++;
  });

  return {
    content: (counts.content / total) * 100,
    interpretation: (counts.interpretation / total) * 100,
    distraction: (counts.distraction / total) * 100,
  };
}

// --- Integration utilities ---

export function getOptimalSessionDuration(sessions: StudySession[], attempts: QuestionAttempt[]): Array<{
  durationBucket: string;
  avgAccuracy: number;
  avgWeightedScore: number;
  sessionCount: number;
  attemptsCount: number;
}> {
  const buckets = [
    { label: '< 25min', min: 0, max: 25 },
    { label: '25-50min', min: 25, max: 50 },
    { label: '50-90min', min: 50, max: 90 },
    { label: '> 90min', min: 90, max: Infinity },
  ];

  return buckets.map(bucket => {
    const bucketSessions = sessions.filter(s => s.durationMinutes >= bucket.min && s.durationMinutes < bucket.max);
    
    // Find attempts within 24h of these sessions
    let bucketAttempts: QuestionAttempt[] = [];
    bucketSessions.forEach(s => {
      const sessionEnd = new Date(s.endedAt).getTime();
      const next24h = sessionEnd + 24 * 60 * 60 * 1000;
      const relatedAttempts = attempts.filter(a => {
        const attemptTime = new Date(a.attemptedAt).getTime();
        return attemptTime >= sessionEnd && attemptTime <= next24h;
      });
      bucketAttempts = bucketAttempts.concat(relatedAttempts);
    });

    const metrics = getPerformanceMetrics(bucketAttempts);

    return {
      durationBucket: bucket.label,
      avgAccuracy: metrics.accuracy,
      avgWeightedScore: metrics.weightedScore,
      sessionCount: bucketSessions.length,
      attemptsCount: bucketAttempts.length,
    };
  });
}

export function getStudyTimeVsScore(sessions: StudySession[], attempts: QuestionAttempt[]): Array<{
  themeId: string;
  themeName: string;
  subjectName: string;
  subjectColor: string;
  studyMinutes: number;
  weightedScore: number;
  total: number;
  trend: 'improving' | 'stable' | 'declining' | 'insufficient';
}> {
  const themeTimeMap = new Map<string, number>();
  sessions.forEach(s => {
    if (s.themeId) {
      themeTimeMap.set(s.themeId, (themeTimeMap.get(s.themeId) || 0) + s.studyMinutes);
    }
  });

  const themeAttemptsMap = new Map<string, QuestionAttempt[]>();
  attempts.forEach(a => {
    if (a.topicId) {
      if (!themeAttemptsMap.has(a.topicId)) themeAttemptsMap.set(a.topicId, []);
      themeAttemptsMap.get(a.topicId)!.push(a);
    }
  });

  const result: any[] = [];
  themeAttemptsMap.forEach((themeAttempts, themeId) => {
    const first = themeAttempts[0];
    const studyMinutes = themeTimeMap.get(themeId) || 0;
    const metrics = getPerformanceMetrics(themeAttempts);
    
    let trend: 'improving' | 'stable' | 'declining' | 'insufficient' = 'insufficient';
    if (themeAttempts.length >= 5) {
      // Simple trend calculation: compare first half to second half
      const sorted = [...themeAttempts].sort((a, b) => new Date(a.attemptedAt).getTime() - new Date(b.attemptedAt).getTime());
      const mid = Math.floor(sorted.length / 2);
      const firstHalf = getPerformanceMetrics(sorted.slice(0, mid)).weightedScore;
      const secondHalf = getPerformanceMetrics(sorted.slice(mid)).weightedScore;
      if (secondHalf > firstHalf + 5) trend = 'improving';
      else if (secondHalf < firstHalf - 5) trend = 'declining';
      else trend = 'stable';
    }

    result.push({
      themeId,
      themeName: first.topicName,
      subjectName: first.subjectName,
      subjectColor: first.subjectColor,
      studyMinutes,
      weightedScore: metrics.weightedScore,
      total: metrics.total,
      trend,
    });
  });

  return result;
}

export function getConfidenceVsStudyTime(sessions: StudySession[], attempts: QuestionAttempt[]): Array<{
  studyTimeBucket: string;
  certainPercent: number;
  doubtfulPercent: number;
  guessPercent: number;
  attemptsCount: number;
}> {
  const buckets = [
    { label: '0-2h', min: 0, max: 120 },
    { label: '2-5h', min: 120, max: 300 },
    { label: '5-10h', min: 300, max: 600 },
    { label: '> 10h', min: 600, max: Infinity },
  ];

  const themeTimeMap = new Map<string, number>();
  sessions.forEach(s => {
    if (s.themeId) {
      themeTimeMap.set(s.themeId, (themeTimeMap.get(s.themeId) || 0) + s.studyMinutes);
    }
  });

  return buckets.map(bucket => {
    const bucketAttempts = attempts.filter(a => {
      const time = themeTimeMap.get(a.topicId) || 0;
      return time >= bucket.min && time < bucket.max;
    });

    const total = bucketAttempts.length;
    if (total === 0) return { studyTimeBucket: bucket.label, certainPercent: 0, doubtfulPercent: 0, guessPercent: 0, attemptsCount: 0 };

    const certain = bucketAttempts.filter(a => a.confidence === 'certain').length;
    const doubtful = bucketAttempts.filter(a => a.confidence === 'doubtful').length;
    const guess = bucketAttempts.filter(a => a.confidence === 'guess').length;

    return {
      studyTimeBucket: bucket.label,
      certainPercent: (certain / total) * 100,
      doubtfulPercent: (doubtful / total) * 100,
      guessPercent: (guess / total) * 100,
      attemptsCount: total,
    };
  });
}

export function getStudyROI(sessions: StudySession[], attempts: QuestionAttempt[]): Array<{
  themeId: string;
  themeName: string;
  subjectName: string;
  subjectColor: string;
  studyHours: number;
  scoreImprovement: number;
  roi: 'high' | 'medium' | 'low' | 'insufficient';
}> {
  const stats = getStudyTimeVsScore(sessions, attempts);
  return stats.map(s => {
    const studyHours = s.studyMinutes / 60;
    const scorePerHour = studyHours > 0 ? s.weightedScore / studyHours : 0;
    
    let roi: 'high' | 'medium' | 'low' | 'insufficient' = 'insufficient';
    if (s.total >= 5) {
      if (scorePerHour > 10) roi = 'high';
      else if (scorePerHour > 5) roi = 'medium';
      else roi = 'low';
    }

    return {
      themeId: s.themeId,
      themeName: s.themeName,
      subjectName: s.subjectName,
      subjectColor: s.subjectColor,
      studyHours,
      scoreImprovement: scorePerHour,
      roi,
    };
  }).sort((a, b) => b.scoreImprovement - a.scoreImprovement);
}
