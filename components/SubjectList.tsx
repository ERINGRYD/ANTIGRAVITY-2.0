/**
 * Subject List Component
 * 
 * Demonstrates the updated SubjectCard with 4 states and the new "Completed Subjects" section.
 * 
 * Key Features:
 * - Renders active subjects in the main list.
 * - Filters permanently completed subjects into a separate, collapsible section.
 * - Handles the visual distinction between "Cycle Completed" (State 2) and "Permanently Completed" (State 4).
 */

import React, { useState } from 'react';
import SubjectCard from './SubjectCard';
import { Subject } from '../types/storage.types';
import { SubjectCycleState } from '../types/subjectCycle.types';
import { Theme } from '../types/theme.types';

// Mock Data Types for Demo
interface SubjectData {
  subject: Subject;
  cycleState: SubjectCycleState;
  themes: Theme[];
}

const SubjectList: React.FC = () => {
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);

  // Mock Data Generation
  const subjects: SubjectData[] = [
    {
      // State 1: Active
      subject: { 
        id: '1', 
        name: 'Matemática', 
        shortName: 'MAT',
        color: 'blue',
        icon: 'calculate',
        studiedMinutes: 45,
        totalMinutes: 60,
        topics: []
      },
      cycleState: { 
        subjectId: '1', 
        currentCycleTime: 45, 
        cycleGoalTime: 60, 
        excessTime: 0, 
        isRotationCompleted: false,
        rotationIndex: 1,
        activeThemeId: 't1',
        startedAt: new Date().toISOString(),
        completedAt: null
      },
      themes: [{ id: 't1', subjectId: '1', name: 'Theme 1', isCompleted: false } as Theme, { id: 't2', subjectId: '1', name: 'Theme 2', isCompleted: true } as Theme]
    },
    {
      // State 2: Cycle Completed
      subject: { 
        id: '2', 
        name: 'Física', 
        shortName: 'FIS',
        color: 'red',
        icon: 'bolt',
        studiedMinutes: 60,
        totalMinutes: 60,
        topics: []
      },
      cycleState: { 
        subjectId: '2', 
        currentCycleTime: 60, 
        cycleGoalTime: 60, 
        excessTime: 5, 
        isRotationCompleted: true,
        rotationIndex: 1,
        activeThemeId: 't3',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      },
      themes: [{ id: 't3', subjectId: '2', name: 'Theme 3', isCompleted: false } as Theme]
    },
    {
      // State 3: Pending
      subject: { 
        id: '3', 
        name: 'Química', 
        shortName: 'QUI',
        color: 'green',
        icon: 'science',
        studiedMinutes: 10,
        totalMinutes: 60,
        topics: []
      },
      cycleState: { 
        subjectId: '3', 
        currentCycleTime: 10, 
        cycleGoalTime: 60, 
        excessTime: 0, 
        isRotationCompleted: false,
        rotationIndex: 1,
        activeThemeId: 't4',
        startedAt: new Date().toISOString(),
        completedAt: null
      },
      themes: [{ id: 't4', subjectId: '3', name: 'Theme 4', isCompleted: false } as Theme]
    },
    {
      // State 4: Permanently Completed
      subject: { 
        id: '4', 
        name: 'História', 
        shortName: 'HIS',
        color: 'yellow',
        icon: 'history_edu',
        studiedMinutes: 60,
        totalMinutes: 60,
        topics: []
      },
      cycleState: { 
        subjectId: '4', 
        currentCycleTime: 0, 
        cycleGoalTime: 60, 
        excessTime: 0, 
        isRotationCompleted: false,
        rotationIndex: 1,
        activeThemeId: null,
        startedAt: new Date().toISOString(),
        completedAt: null
      },
      themes: [{ id: 't5', subjectId: '4', name: 'Theme 5', isCompleted: true } as Theme, { id: 't6', subjectId: '4', name: 'Theme 6', isCompleted: true } as Theme]
    }
  ];

  // Filter Logic
  const activeSubjects = subjects.filter(s => !s.themes.every(t => t.isCompleted));
  const completedSubjects = subjects.filter(s => s.themes.length > 0 && s.themes.every(t => t.isCompleted));

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen flex flex-col gap-8 max-w-md mx-auto">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white">Meu Ciclo de Estudos</h1>

      {/* Active Cycle List */}
      <div className="flex flex-col gap-4">
        {activeSubjects.map((data, index) => (
          <SubjectCard
            key={data.subject.id}
            subject={data.subject}
            cycleState={data.cycleState}
            themes={data.themes}
            isActive={index === 0} // First item is active for demo
            cardIndex={index}
            isPermanentlyCompleted={false}
            onPress={() => console.log(`Pressed ${data.subject.name}`)}
          />
        ))}
      </div>

      {/* Permanently Completed Section */}
      {completedSubjects.length > 0 && (
        <div className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-4">
          <button 
            onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors w-full"
          >
            <span className={`material-icons-round text-lg transition-transform duration-300 ${isCompletedExpanded ? 'rotate-90' : ''}`}>
              chevron_right
            </span>
            <span>Ver matérias concluídas ({completedSubjects.length})</span>
          </button>

          {isCompletedExpanded && (
            <div className="flex flex-col gap-4 mt-4 animate-in slide-in-from-top-2 duration-300">
              {completedSubjects.map((data, index) => (
                <SubjectCard
                  key={data.subject.id}
                  subject={data.subject}
                  cycleState={data.cycleState}
                  themes={data.themes}
                  isActive={false}
                  cardIndex={index} // Index doesn't matter here
                  isPermanentlyCompleted={true}
                  // onPress is disabled for completed subjects
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubjectList;
