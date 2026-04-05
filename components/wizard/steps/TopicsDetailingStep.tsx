import React, { useState } from 'react';
import { WizardState, WizardSubject, WizardTopic } from '../../../types/wizard.types';

interface StepProps {
  state: WizardState;
  updateState: (updates: Partial<WizardState>) => void;
  onNext?: () => void;
  onBack?: () => void;
}

const TopicsDetailingStep: React.FC<StepProps> = ({ state, updateState }) => {
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(state.subjects[0]?.id || null);
  const [expandedTopicIds, setExpandedTopicIds] = useState<Set<string>>(new Set());
  const [newContentName, setNewContentName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const toggleTopicExpansion = (topicId: string) => {
    setExpandedTopicIds(prev => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  };

  const handleAddContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContentName.trim()) return;

    // If a subject is expanded, add as a topic to that subject
    if (expandedSubjectId) {
      const updatedSubjects = state.subjects.map(s => {
        if (s.id === expandedSubjectId) {
          return {
            ...s,
            topics: [...(s.topics || []), { 
              id: `t-${crypto.randomUUID()}`, 
              name: newContentName.trim(),
              status: 'pendente' as const,
              priority: 3,
              subtopics: []
            }]
          };
        }
        return s;
      });
      updateState({ subjects: updatedSubjects });
    } else {
      // Otherwise add as a new subject
      const newSubject: WizardSubject = {
        id: `s-${crypto.randomUUID()}`,
        name: newContentName.trim(),
        color: '#3b82f6', // Default blue
        topics: [],
        level: null
      };
      updateState({ subjects: [...state.subjects, newSubject] });
    }
    setNewContentName('');
  };

  const addSubtopicInList = (list: WizardTopic[], targetId: string, newSubtopic: WizardTopic): WizardTopic[] => {
    return list.map(t => {
      if (t.id === targetId) {
        return { ...t, subtopics: [...(t.subtopics || []), newSubtopic] };
      }
      if (t.subtopics) {
        return { ...t, subtopics: addSubtopicInList(t.subtopics, targetId, newSubtopic) };
      }
      return t;
    });
  };

  const handleAddSubtopic = (subjectId: string, parentId: string) => {
    const newSubtopic: WizardTopic = {
      id: `st-${crypto.randomUUID()}`,
      name: 'Novo Sub-tópico',
      priority: 3,
      status: 'pendente',
      subtopics: []
    };

    const updatedSubjects = state.subjects.map(s => {
      if (s.id === subjectId) {
        return {
          ...s,
          topics: addSubtopicInList(s.topics, parentId, newSubtopic)
        };
      }
      return s;
    });
    updateState({ subjects: updatedSubjects });
    
    // Auto-expand the parent to show the new subtopic
    setExpandedTopicIds(prev => new Set(prev).add(parentId));
  };

  const updateTopicInList = (list: WizardTopic[], targetId: string, updates: Partial<WizardTopic>): WizardTopic[] => {
    return list.map(t => {
      if (t.id === targetId) {
        return { ...t, ...updates };
      }
      if (t.subtopics) {
        return { ...t, subtopics: updateTopicInList(t.subtopics, targetId, updates) };
      }
      return t;
    });
  };

  const handleUpdateTopic = (subjectId: string, topicId: string, updates: Partial<WizardTopic>) => {
    const updatedSubjects = state.subjects.map(s => {
      if (s.id === subjectId) {
        return {
          ...s,
          topics: updateTopicInList(s.topics, topicId, updates)
        };
      }
      return s;
    });
    updateState({ subjects: updatedSubjects });
  };

  const renderStars = (count: number, onSelect?: (val: number) => void, max: number = 5, size: string = '14px') => {
    return (
      <div className="flex items-center">
        {[...Array(max)].map((_, i) => (
          <span 
            key={i} 
            onClick={(e) => {
              if (onSelect) {
                e.stopPropagation();
                onSelect(i + 1);
              }
            }}
            className={`material-symbols-outlined ${i < count ? 'filled text-amber-400' : 'text-slate-300 dark:text-slate-700'} ${onSelect ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            style={{ fontSize: size }}
          >
            star
          </span>
        ))}
      </div>
    );
  };

  const handlePromoteToSubject = (subjectId: string, topicId: string) => {
    const subject = state.subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const topic = subject.topics.find(t => t.id === topicId);
    if (!topic) return;

    // 1. Create new subject from topic
    const newSubject: WizardSubject = {
      id: `s-${crypto.randomUUID()}`,
      name: topic.name,
      color: subject.color, // Inherit color
      topics: topic.subtopics || [], // Subtopics become topics of the new subject
      level: subject.level,
      priority: topic.priority
    };

    // 2. Remove topic from original subject
    const updatedSubjects = state.subjects.map(s => {
      if (s.id === subjectId) {
        return {
          ...s,
          topics: s.topics.filter(t => t.id !== topicId)
        };
      }
      return s;
    });

    updateState({ subjects: [...updatedSubjects, newSubject] });
    setExpandedSubjectId(newSubject.id);
  };

  const handleDeleteTopic = (subjectId: string, topicId: string) => {
    console.log('Deleting topic:', topicId, 'from subject:', subjectId);
    const deleteFromList = (list: WizardTopic[], targetId: string): WizardTopic[] => {
      return list
        .filter(t => t.id !== targetId)
        .map(t => ({
          ...t,
          subtopics: t.subtopics ? deleteFromList(t.subtopics, targetId) : []
        }));
    };

    const updatedSubjects = state.subjects.map(s => {
      if (s.id === subjectId) {
        return {
          ...s,
          topics: deleteFromList(s.topics, topicId)
        };
      }
      return s;
    });
    updateState({ subjects: updatedSubjects });
  };

  const handleDeleteSubject = (subjectId: string) => {
    console.log('Deleting subject:', subjectId);
    const updatedSubjects = state.subjects.filter(s => s.id !== subjectId);
    updateState({ subjects: updatedSubjects });
    if (expandedSubjectId === subjectId) {
      setExpandedSubjectId(updatedSubjects[0]?.id || null);
    }
  };

  const handleRenameSubject = (subjectId: string) => {
    const subject = state.subjects.find(s => s.id === subjectId);
    if (!subject) return;
    setEditingId(subjectId);
    setEditingValue(subject.name);
  };

  const handleRenameTopic = (subjectId: string, topicId: string) => {
    const subject = state.subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const findTopic = (list: WizardTopic[], id: string): WizardTopic | undefined => {
      for (const t of list) {
        if (t.id === id) return t;
        if (t.subtopics) {
          const found = findTopic(t.subtopics, id);
          if (found) return found;
        }
      }
    };

    const topic = findTopic(subject.topics, topicId);
    if (!topic) return;

    setEditingId(topicId);
    setEditingValue(topic.name);
  };

  const handleSaveRename = (subjectId: string | null = null) => {
    if (!editingId || !editingValue.trim()) {
      setEditingId(null);
      return;
    }

    const renameInList = (list: WizardTopic[], targetId: string, newName: string): WizardTopic[] => {
      return list.map(t => {
        if (t.id === targetId) return { ...t, name: newName };
        if (t.subtopics) return { ...t, subtopics: renameInList(t.subtopics, targetId, newName) };
        return t;
      });
    };

    const isSubject = state.subjects.some(s => s.id === editingId);

    if (isSubject) {
      updateState({
        subjects: state.subjects.map(s => s.id === editingId ? { ...s, name: editingValue.trim() } : s)
      });
    } else if (subjectId) {
      const updatedSubjects = state.subjects.map(s => {
        if (s.id === subjectId) {
          return {
            ...s,
            topics: renameInList(s.topics, editingId, editingValue.trim())
          };
        }
        return s;
      });
      updateState({ subjects: updatedSubjects });
    }

    setEditingId(null);
  };

  const renderTopic = (subjectId: string, topic: WizardTopic, level: number = 1) => {
    const isExpanded = expandedTopicIds.has(topic.id);
    const hasSubtopics = topic.subtopics && topic.subtopics.length > 0;
    const paddingLeft = level * 16; // 16px per level

    return (
      <div key={topic.id} className="last:border-0">
        <div 
          className={`flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800/30`}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => toggleTopicExpansion(topic.id)}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="material-symbols-outlined text-slate-400 scale-90">
              {isExpanded ? 'expand_more' : 'chevron_right'}
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 flex-1 min-w-0">
              {editingId === topic.id ? (
                <input 
                  autoFocus
                  className="text-sm font-semibold bg-white dark:bg-slate-800 border border-blue-500 rounded px-1 outline-none w-full"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onBlur={() => handleSaveRename(subjectId)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename(subjectId);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className={`text-sm font-semibold text-slate-700 dark:text-slate-300 truncate ${level > 1 ? 'italic' : ''}`}>{topic.name}</span>
              )}
              {renderStars(topic.priority || 3, (val) => handleUpdateTopic(subjectId, topic.id, { priority: val }), 5, level > 1 ? '12px' : '14px')}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {level === 1 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handlePromoteToSubject(subjectId, topic.id);
                }}
                className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                title="Transformar em matéria independente"
              >
                <span className="material-symbols-outlined text-lg">move_up</span>
              </button>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleRenameTopic(subjectId, topic.id);
              }}
              className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
              title="Renomear tópico"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteTopic(subjectId, topic.id);
              }}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
              title="Excluir tópico"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const nextStatus: WizardTopic['status'] = 
                  topic.status === 'pendente' ? 'em-progresso' :
                  topic.status === 'em-progresso' ? 'concluido' : 'pendente';
                handleUpdateTopic(subjectId, topic.id, { status: nextStatus });
              }}
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded transition-colors ${
                topic.status === 'em-progresso' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' :
                topic.status === 'concluido' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {topic.status === 'em-progresso' ? 'Em Progresso' : 
               topic.status === 'concluido' ? 'Concluído' : 'Pendente'}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="bg-slate-50/50 dark:bg-slate-800/20">
            {topic.subtopics?.map(subtopic => renderTopic(subjectId, subtopic, level + 1))}
            
            {/* Add Subtopic Button - Only if level < 6 */}
            {level < 6 && (
              <div className="py-2 pr-4" style={{ paddingLeft: `${paddingLeft + 32}px` }}>
                <button 
                  onClick={() => handleAddSubtopic(subjectId, topic.id)}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:opacity-80"
                >
                  <span className="material-symbols-outlined text-xs">add_circle</span>
                  ADICIONAR SUB-TÓPICO
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header Section */}
      <section className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Detalhar tópicos?</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Isso é opcional. Você pode adicionar os assuntos específicos de cada matéria.</p>
      </section>

      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30 flex items-start gap-3 mb-6">
          <span className="material-symbols-outlined text-blue-500 text-xl">info</span>
          <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
            <strong>Dica:</strong> Se estiver com pressa, pode pular esta etapa e cadastrar os tópicos depois.
          </p>
        </div>

        {/* Tree Content Area */}
        <div className="space-y-4">
          {state.subjects.map(subject => {
            const isSubjectExpanded = expandedSubjectId === subject.id;
            
            return (
              <div key={subject.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                {/* Subject Level (L0) */}
                <div 
                  className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isSubjectExpanded ? 'border-b border-slate-50 dark:border-slate-800/50' : ''}`}
                  onClick={() => setExpandedSubjectId(isSubjectExpanded ? null : subject.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${isSubjectExpanded ? 'text-blue-600' : 'text-slate-400'}`}>
                      {isSubjectExpanded ? 'expand_more' : 'chevron_right'}
                    </span>
                    {editingId === subject.id ? (
                      <input 
                        autoFocus
                        className="font-bold bg-white dark:bg-slate-800 border border-blue-500 rounded px-1 outline-none"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={() => handleSaveRename()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename();
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="font-bold text-slate-800 dark:text-slate-200">{subject.name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenameSubject(subject.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                      title="Renomear matéria"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSubject(subject.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                      title="Excluir matéria"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${isSubjectExpanded ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      {subject.topics.length} Tópicos
                    </span>
                  </div>
                </div>

                {/* Recursive Topics Rendering */}
                {isSubjectExpanded && (
                  <div>
                    {subject.topics.length > 0 ? (
                      subject.topics.map(topic => renderTopic(subject.id, topic))
                    ) : (
                      <div className="text-center py-6 text-slate-400 dark:text-slate-600 italic text-xs font-medium">
                        Nenhum tópico adicionado a esta matéria.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add New Subject/Topic Input */}
          <div className="mt-6 flex flex-col gap-3">
            <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Novo Conteúdo</label>
            <form onSubmit={handleAddContent} className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" 
                  placeholder="Nome da matéria ou tópico..."
                  type="text"
                  value={newContentName}
                  onChange={(e) => setNewContentName(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                disabled={!newContentName.trim()}
                className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 w-12 h-12 rounded-xl flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicsDetailingStep;
