import React, { useState } from 'react';
import { WizardState, ObjectiveType, WizardTopic } from '../../types/wizard.types';
import WizardStepIndicator from './WizardStepIndicator';
import ObjectiveSelectionStep from './steps/ObjectiveSelectionStep';
import ConcursoSearchStep from './steps/ConcursoSearchStep';
import ExamDateSelection from './steps/ExamDateSelection';
import SubjectsSelectionStep from './steps/SubjectsSelectionStep';
import TopicsDetailingStep from './steps/TopicsDetailingStep';
import SelfEvaluationStep from './steps/SelfEvaluationStep';
import StudyLoadStep from './steps/StudyLoadStep';
import TimerSetupStep from './steps/TimerSetupStep';
import ReviewAndConfirmStep from './steps/ReviewAndConfirmStep';
import { useApp } from '../../contexts/AppContext';
import { calculateCombinedWeight, KnowledgeLevel } from '../../utils/priorityUtils';

interface StudyPlannerWizardProps {
  onComplete: () => void;
  onClose?: () => void;
}

const INITIAL_STATE: WizardState = {
  objective: null,
  focus: null,
  deadline: null,
  subjects: [],
  weeklyHours: null,
  timerSettings: {
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsUntilLongBreak: 4,
  },
  concursoInfo: null,
  selectedPosition: null
};

const StudyPlannerWizard: React.FC<StudyPlannerWizardProps> = ({ onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardState, setWizardState] = useState<WizardState>(INITIAL_STATE);
  const { setSubjects, setGoals, setPomodoroSettings } = useApp();

  const handleNext = (objectiveOverride?: ObjectiveType) => {
    const objective = objectiveOverride || wizardState.objective;
    
    if (currentStep === 1 && objective !== 'concurso') {
      setCurrentStep(3); // Skip search step
      return;
    }

    if (currentStep < 9) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep === 3 && wizardState.objective !== 'concurso') {
      setCurrentStep(1);
      return;
    }

    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const updateState = (updates: Partial<WizardState>) => {
    setWizardState(prev => {
      const newState = { ...prev, ...updates };
      
      // If objective is updated, set default banca for specific objectives
      if (updates.objective) {
        if (updates.objective === 'enem') newState.banca = 'INEP';
        else if (updates.objective === 'oab') newState.banca = 'OAB';
        else if (updates.objective !== 'concurso') newState.banca = null; // Clear for others unless set manually
      }

      // If concursoInfo is updated, automatically populate deadline and banca
      if (updates.concursoInfo) {
        newState.deadline = updates.concursoInfo.date || null;
        newState.banca = updates.concursoInfo.banca || null;
      }

      // If selectedPosition is updated (or concursoInfo with only one position), populate subjects
      if (updates.selectedPosition || (updates.concursoInfo && updates.concursoInfo.positions.length === 1)) {
        const info = newState.concursoInfo;
        const positionName = updates.selectedPosition || (info?.positions[0]?.name);
        
        if (info && positionName) {
          const position = info.positions.find(p => p.name === positionName);
          if (position) {
            // Helper for recursive topic mapping
            const mapTopics = (topics: any[]): WizardTopic[] => {
              return topics.map(t => {
                const name = typeof t === 'string' ? t : t.name;
                const subtopics = (t.subtopics && Array.isArray(t.subtopics)) 
                  ? mapTopics(t.subtopics) 
                  : [];
                
                return {
                  id: `t-${crypto.randomUUID()}`,
                  name,
                  priority: 3,
                  status: 'pendente' as const,
                  subtopics
                };
              });
            };

            // Map subjects from the selected position to WizardSubject
            newState.subjects = position.subjects.map(s => ({
              id: `s-${crypto.randomUUID()}`,
              name: s.name,
              color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
              level: 'iniciante',
              priority: 3,
              topics: mapTopics(s.topics)
            }));
          }
        }
      }

      return newState;
    });
  };

  const handleFinish = () => {
    const weeklyMinutes = (wizardState.weeklyHours || 20) * 60; // Default to 20h if not set
    
    // Calculate weights
    const weights: Record<string, number> = {};
    let totalWeight = 0;
    wizardState.subjects.forEach(s => {
      const priority = s.priority || 1;
      const level = (s.level as KnowledgeLevel) || 'iniciante';
      const weight = calculateCombinedWeight(priority, level);
      
      weights[s.id] = weight;
      totalWeight += weight;
    });

    // Calculate minutes per weight unit
    const minutesPerWeight = totalWeight > 0 ? weeklyMinutes / totalWeight : 0;

    // 1. Save subjects
    const finalSubjects = wizardState.subjects.map(ws => {
      const subjectWeight = weights[ws.id] || 1;
      const subjectTotalMinutes = Math.max(60, Math.round(subjectWeight * minutesPerWeight)); // Min 1h per subject
      
      return {
        id: ws.id,
        name: ws.name,
        shortName: ws.name.substring(0, 3).toUpperCase(),
        color: ws.color,
        icon: 'menu_book',
        priority: ws.priority || 1,
        knowledgeLevel: (ws.level as KnowledgeLevel) || 'iniciante',
        studiedMinutes: 0,
        totalMinutes: subjectTotalMinutes,
        topics: ws.topics.map(t => {
          // Flatten recursive subtopics for the app's 2-level structure
          const flattenSubtopics = (subtopics: WizardTopic[], depth: number = 0): any[] => {
            let flattened: any[] = [];
            subtopics.forEach(st => {
              flattened.push({
                id: st.id,
                name: depth > 0 ? `${'  '.repeat(depth)}• ${st.name}` : st.name,
                isCompleted: st.status === 'concluido',
                studiedMinutes: 0,
                totalMinutes: 0,
                icon: 'subdirectory_arrow_right'
              });
              if (st.subtopics && st.subtopics.length > 0) {
                flattened = [...flattened, ...flattenSubtopics(st.subtopics, depth + 1)];
              }
            });
            return flattened;
          };

          return {
            id: t.id,
            name: t.name,
            icon: 'menu_book',
            totalMinutes: Math.max(15, Math.round(subjectTotalMinutes / (ws.topics.length || 1))),
            studiedMinutes: 0,
            isCompleted: t.status === 'concluido',
            totalQuestions: 0,
            completedQuestions: 0,
            priority: t.priority as any,
            subTopics: flattenSubtopics(t.subtopics || [])
          };
        })
      };
    });
    setSubjects(finalSubjects);

    // 2. Save weights based on level
    localStorage.setItem('user_edital_weights', JSON.stringify(weights));

    // 3. Save deadline and weekly goal
    if (wizardState.deadline) {
      localStorage.setItem('user_deadline', wizardState.deadline);
    }
    if (wizardState.weeklyHours) {
      setGoals([{
        id: 'g-1',
        title: 'Meta Semanal',
        targetMinutes: wizardState.weeklyHours * 60,
        currentMinutes: 0,
        isCompleted: false,
        weekStart: new Date().toISOString()
      }]);
    }

    // 4. Save timer settings
    setPomodoroSettings(prev => ({
      ...prev,
      focusTime: wizardState.timerSettings.focusTime,
      shortBreak: wizardState.timerSettings.shortBreak,
      longBreak: wizardState.timerSettings.longBreak,
      pomodorosUntilLongBreak: wizardState.timerSettings.sessionsUntilLongBreak,
    }));

    // 5. Mark onboarding as completed
    localStorage.setItem('has_completed_onboarding', 'true');
    onComplete();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ObjectiveSelectionStep state={wizardState} updateState={updateState} onNext={(obj) => handleNext(obj)} />;
      case 2:
        return <ConcursoSearchStep state={wizardState} updateState={updateState} onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <ExamDateSelection state={wizardState} updateState={updateState} />;
      case 4:
        return <SubjectsSelectionStep state={wizardState} updateState={updateState} />;
      case 5:
        return <TopicsDetailingStep state={wizardState} updateState={updateState} />;
      case 6:
        return <SelfEvaluationStep state={wizardState} updateState={updateState} />;
      case 7:
        return <StudyLoadStep state={wizardState} updateState={updateState} />;
      case 8:
        return <TimerSetupStep state={wizardState} updateState={updateState} />;
      case 9:
        return <ReviewAndConfirmStep state={wizardState} />;
      default:
        return null;
    }
  };


  return (
    <div className="w-full h-screen h-[100dvh] bg-white dark:bg-slate-950 flex flex-col transition-colors duration-500 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-4 h-16 w-full sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-3 w-1/3">
          <button 
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-xl active:scale-95 ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
        </div>
        
        <div className="flex-1 flex justify-center w-1/3">
          <WizardStepIndicator currentStep={currentStep} totalSteps={9} />
        </div>

        <div className="w-1/3 flex justify-end">
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-transparent">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-32 md:pt-16 md:pb-40">
          {/* Step Content */}
          <div className="mb-12 md:mb-20">
            {renderStep()}
          </div>

          {/* Info Section (Visible on Step 1) */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center border-t border-gray-100 dark:border-gray-800 pt-20">
              <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                  alt="Estudante"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-8">
                <div>
                  <span className="text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mb-4 block">Personalização Inteligente</span>
                  <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                    Por que escolher um objetivo?
                  </h2>
                </div>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 shrink-0">
                      <span className="material-symbols-outlined">target</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Conteúdo Curado</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Acessamos os bancos de questões e editais mais recentes para cada categoria.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 shrink-0">
                      <span className="material-symbols-outlined">auto_awesome</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">IA Generativa</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Nossa IA organiza os tópicos por relevância e incidência nas provas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <nav className="absolute bottom-0 left-0 right-0 h-24 bg-transparent z-40 px-4 md:px-8 flex items-center justify-between pointer-events-none">
        <button 
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`pointer-events-auto px-6 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 ${
            currentStep === 1 ? 'opacity-0 pointer-events-none' : ''
          }`}
        >
          Voltar
        </button>

        <button 
          onClick={() => handleNext()}
          disabled={currentStep === 2 && !wizardState.concursoInfo}
          className={`pointer-events-auto flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl px-6 py-2.5 font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-95 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span>{currentStep === 9 ? 'Finalizar' : 'Continuar'}</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </nav>
    </div>
  );
};

export default StudyPlannerWizard;
