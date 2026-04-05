// subjectToTheme.ts
// Temporary bridge between the legacy Subject model and the new Theme model.
// This allows new hooks to consume legacy data without a full migration.
// TODO: remove this file when App.tsx is migrated to the new data model.

import { Subject, Topic } from '../types'
import { Theme, Subtopic } from '../types/theme.types'
import { SubjectCycleState } from '../types/subjectCycle.types'

export function topicToTheme(
  topic: Topic,
  subjectId: string,
  index: number
): Theme {
  return {
    id: topic.id ?? `topic-${index}`,
    subjectId,
    name: topic.name,
    order: index,
    goalTime: topic.totalMinutes ?? 60,
    priority: topic.priority ?? 3,
    accumulatedTime: topic.studiedMinutes ?? 0,
    isCompleted: topic.isCompleted ?? false,
    completionSource: topic.isCompleted ? 'checklist' : null,
    subtopics: [],
    description: topic.description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function subjectToThemes(subject: Subject): Theme[] {
  if (!subject.topics || subject.topics.length === 0) return []
  return subject.topics.map((topic, index) => 
    topicToTheme(topic, subject.id, index)
  )
}

export function subjectToCycleState(subject: Subject): SubjectCycleState {
  return {
    subjectId: subject.id,
    rotationIndex: 1,
    cycleGoalTime: subject.totalMinutes ?? 60,
    currentCycleTime: Math.min(
      subject.studiedMinutes ?? 0,
      subject.totalMinutes ?? 60
    ),
    excessTime: Math.max(
      0,
      (subject.studiedMinutes ?? 0) - (subject.totalMinutes ?? 60)
    ),
    activeThemeId: null,
    isRotationCompleted: 
      (subject.studiedMinutes ?? 0) >= (subject.totalMinutes ?? 60),
    startedAt: null,
    completedAt: null,
  }
}
