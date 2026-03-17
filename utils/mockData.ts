import { BattleAttempt, Subject } from '../types';

export function generateMockBattleAttempts(subjects: Subject[]): BattleAttempt[] {
  if (!subjects || subjects.length === 0) return [];

  const attempts: BattleAttempt[] = [];
  const now = new Date();
  const confidences: ('certain' | 'doubtful' | 'guess')[] = ['certain', 'doubtful', 'guess'];
  const errorTypes: ('content' | 'interpretation' | 'distraction' | null)[] = ['content', 'interpretation', 'distraction', null];
  const rooms: ('reconhecimento' | 'critica' | 'alerta' | 'vencidos')[] = ['reconhecimento', 'critica', 'alerta', 'vencidos'];

  for (let i = 0; i < 200; i++) {
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    if (!subject.topics || subject.topics.length === 0) continue;
    
    const topic = subject.topics[Math.floor(Math.random() * subject.topics.length)];
    
    // Distribute dates over the last 90 days
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    
    // Randomize hours to simulate peak hours
    const hour = Math.floor(Math.random() * 14) + 8; // 8 AM to 10 PM
    date.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

    const isCorrect = Math.random() > 0.4; // 60% accuracy
    const confidence = confidences[Math.floor(Math.random() * confidences.length)];
    const room = rooms[Math.floor(Math.random() * rooms.length)];
    
    let errorType = null;
    if (!isCorrect) {
      errorType = errorTypes[Math.floor(Math.random() * 3)]; // 0, 1, 2
    }

    // Time spent: 30s to 180s
    const timeSpentSeconds = Math.floor(Math.random() * 150) + 30;
    
    // XP earned: 10 if correct, 2 if wrong
    const xpEarned = isCorrect ? 10 : 2;

    attempts.push({
      id: `attempt-${i}`,
      topicId: topic.id,
      topicName: topic.name,
      subjectId: subject.id,
      subjectName: subject.name,
      subjectColor: subject.color,
      isCorrect,
      confidence,
      errorType,
      room,
      timeSpentSeconds,
      xpEarned,
      attemptedAt: date.toISOString(),
      sessionId: `session-${Math.floor(i / 10)}`,
      sessionDurationMinutes: 25
    });
  }

  return attempts.sort((a, b) => new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime());
}
