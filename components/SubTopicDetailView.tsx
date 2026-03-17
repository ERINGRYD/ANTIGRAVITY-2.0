import React, { useState, useEffect } from 'react';
import { Topic, SubTopic as LegacySubTopic } from '../types';
import { Theme, Subtopic, isThemeCompleted } from '../types/theme.types';
import { useApp } from '../contexts/AppContext';
import SubtopicAddForm from './SubtopicAddForm';
import ThemeChecklist from './ThemeChecklist';

interface SubTopicDetailViewProps {
  topic: Topic;
  subjectColor: string;
  onBack: () => void;
  onUpdateSubTopics: (newSubTopics: LegacySubTopic[]) => void;
}

const SubTopicDetailView: React.FC<SubTopicDetailViewProps> = ({
  topic,
  subjectColor,
  onBack,
  onUpdateSubTopics,
}) => {
  const { isDarkMode } = useApp();
  const [localTheme, setLocalTheme] = useState<Theme | null>(null);

  // Map Legacy Topic to New Theme Model
  useEffect(() => {
    const mappedTheme: Theme = {
      id: topic.id,
      subjectId: 'unknown', // Not available in Topic
      name: topic.name,
      order: 0,
      goalTime: topic.totalMinutes,
      accumulatedTime: topic.studiedMinutes,
      isCompleted: topic.isCompleted,
      completionSource: null, // Default
      subtopics: topic.subTopics?.map(st => ({
        id: st.id,
        name: st.name,
        isCompleted: st.isCompleted,
        completionSource: st.isCompleted ? 'manual-study' : null // Infer source for legacy data
      })) || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setLocalTheme(mappedTheme);
  }, [topic]);

  // Handler Stub: Updates subtopic in state and re-evaluates theme completion
  const handleSubtopicUpdate = (
    themeId: string,
    subtopicId: string,
    updates: Partial<Subtopic>
  ) => {
    if (!localTheme) return;

    // 1. Update Local Theme State
    const updatedSubtopics = localTheme.subtopics.map(st => 
      st.id === subtopicId ? { ...st, ...updates } : st
    );

    const updatedTheme = { ...localTheme, subtopics: updatedSubtopics };
    
    // Re-evaluate completion using the prompt's logic
    const isNowComplete = isThemeCompleted(updatedTheme);
    if (isNowComplete !== updatedTheme.isCompleted) {
      updatedTheme.isCompleted = isNowComplete;
      updatedTheme.completionSource = isNowComplete ? 'checklist' : null;
    }

    setLocalTheme(updatedTheme);

    // 2. Propagate to Parent (Legacy Adapter)
    // We must merge with original legacy subtopics to preserve fields like studiedMinutes
    const legacyUpdates = topic.subTopics?.map(legacyST => {
      const updatedST = updatedSubtopics.find(u => u.id === legacyST.id);
      if (updatedST) {
        return {
          ...legacyST,
          isCompleted: updatedST.isCompleted,
          // Note: completionSource is not persisted in legacy SubTopic, 
          // so we only sync isCompleted
        };
      }
      return legacyST;
    }) || [];

    onUpdateSubTopics(legacyUpdates);
  };

  // Handler Stub: Updates theme completion state in local state
  const handleThemeCompletionChange = (
    themeId: string,
    isCompleted: boolean,
    source: Theme['completionSource']
  ) => {
    if (!localTheme) return;

    const updatedTheme = { 
      ...localTheme, 
      isCompleted, 
      completionSource: source 
    };
    
    setLocalTheme(updatedTheme);
    
    // Note: We don't have a prop to update the Topic's completion status directly here,
    // but usually completion is derived from subtopics or time. 
    // If the parent component needs this, we might need an onUpdateTopic prop.
    // For now, we rely on onUpdateSubTopics triggering a re-eval in the parent if implemented.
    console.log(`Theme completion changed: ${isCompleted} via ${source}`);
  };

  if (!localTheme) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-right duration-500 overflow-y-auto no-scrollbar pb-[100px] transition-colors duration-300">
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-5 py-4 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-slate-400 dark:text-slate-500 hover:text-[#10B981] w-12 h-12 flex items-center justify-center -ml-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all active:scale-95">
              <span className="material-icons-round text-2xl">arrow_back</span>
            </button>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: subjectColor }}
              >
                <span className="material-icons-round text-xl">{topic.icon}</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">{topic.name}</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-5 py-8 max-w-4xl mx-auto w-full flex-1 space-y-8">
        
        {/* Theme Checklist Integration */}
        <ThemeChecklist 
          theme={localTheme}
          onSubtopicUpdate={handleSubtopicUpdate}
          onThemeCompletionChange={handleThemeCompletionChange}
        />

        {/* Inline Subtopic Add Form */}
        <div className="px-1 mt-6">
          <SubtopicAddForm
            themeId={localTheme.id}
            currentSubtopicCount={localTheme.subtopics.length}
            themeIsCompleted={localTheme.isCompleted}
            onSubtopicAdded={(themeId, newSubtopic) => {
              // Convert new Subtopic to LegacySubTopic for parent compatibility
              const legacyNewSubTopic: LegacySubTopic = {
                id: newSubtopic.id,
                name: newSubtopic.name,
                isCompleted: newSubtopic.isCompleted,
                studiedMinutes: 0,
                totalMinutes: 60, // Default for legacy model
                icon: 'circle'
              };
              
              const currentLegacySubTopics = topic.subTopics || [];
              onUpdateSubTopics([...currentLegacySubTopics, legacyNewSubTopic]);
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default SubTopicDetailView;
