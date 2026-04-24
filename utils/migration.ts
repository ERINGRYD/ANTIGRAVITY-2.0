import { Subject } from '../types';
import { Theme } from '../types/theme.types';
import { SubjectCycleState } from '../types/subjectCycle.types';
import { subjectToThemes, subjectToCycleState } from '../adapters/subjectToTheme';

/**
 * Migrates legacy Subject data to the new Theme and SubjectCycleState models.
 * 
 * This function:
 * 1. Reads 'subjects' from localStorage.
 * 2. Converts each Subject to multiple Themes and one SubjectCycleState.
 * 3. Returns the migrated data.
 * 
 * NOTE: This does not delete the legacy 'subjects' key to prevent data loss.
 */
export function migrateSubjectsToThemesAndCycleState() {
  const legacySubjectsStr = localStorage.getItem('studyapp-subjects');
  if (!legacySubjectsStr) return null;

  try {
    const legacySubjects: Subject[] = JSON.parse(legacySubjectsStr);
    const allThemes: Theme[] = [];
    const allCycleStates: SubjectCycleState[] = [];

    legacySubjects.forEach(subject => {
      // Convert topics to themes
      const themes = subjectToThemes(subject);
      allThemes.push(...themes);

      // Convert subject stats to cycle state
      const cycleState = subjectToCycleState(subject);
      allCycleStates.push(cycleState);
    });

    return {
      themes: allThemes,
      cycleStates: allCycleStates,
      // We also need to return the subjects themselves but potentially stripped of topics
      // to serve as metadata (name, color, icon)
      subjectsMetadata: legacySubjects.map(({ topics, ...metadata }) => metadata)
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return null;
  }
}
