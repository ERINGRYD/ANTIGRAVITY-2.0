import React from 'react';

interface WizardStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { id: 1, label: 'Objetivo' },
  { id: 2, label: 'Prazo' },
  { id: 3, label: 'Matérias' },
  { id: 4, label: 'Tópicos' },
  { id: 5, label: 'Nível' },
  { id: 6, label: 'Carga' },
  { id: 7, label: 'Timer' },
  { id: 8, label: 'Revisão' },
];

const WizardStepIndicator: React.FC<WizardStepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex gap-1 w-full max-w-md mx-auto">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const stepNum = i + 1;
        const isActive = stepNum <= currentStep;
        
        return (
          <div 
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              isActive ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
            }`}
          />
        );
      })}
    </div>
  );
};

export default WizardStepIndicator;
