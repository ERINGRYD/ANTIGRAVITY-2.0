import React, { useState, useEffect } from 'react';
import { 
  ArchivedEnemy, 
  calculateBarValue, 
  getBarColor, 
  calculateCurrentQuestions, 
  calculateCurrentDifficulty,
  shouldEnemyReturn
} from '../utils/ebbinghaus';

interface ArchivedEnemyCardProps {
  enemy: ArchivedEnemy;
  onReviewNow: (enemyId: string) => void;
  onDelete?: (topicId: string) => void;
}

const ArchivedEnemyCard: React.FC<ArchivedEnemyCardProps> = ({ enemy, onReviewNow, onDelete }) => {
  const [now, setNow] = useState(new Date());

  // Recalculate time-based values occasionally
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  
  const victoryDate = new Date(enemy.lastVictoryDate);
  const daysSinceVictory = (now.getTime() - victoryDate.getTime()) / (1000 * 60 * 60 * 24);
  
  const barValue = calculateBarValue(daysSinceVictory, enemy.memoryStability, enemy);
  const barColor = getBarColor(barValue);
  
  const currentQuestions = calculateCurrentQuestions(enemy, daysSinceVictory);
  const currentDifficulty = calculateCurrentDifficulty(enemy.currentDifficulty, barValue);
  
  const isReturning = barValue === 100 || shouldEnemyReturn(enemy);
  
  const nextReturnDate = new Date(enemy.nextReturnDate);
  const daysUntilReturn = Math.ceil((nextReturnDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Difficulty label mapping
  const difficultyLabels = {
    'easy': 'Fácil',
    'medium': 'Médio',
    'hard': 'Difícil',
    'very-hard': 'Muito Difícil'
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConfirmingDelete) {
      if (onDelete) onDelete(enemy.topicId);
    } else {
      setIsConfirmingDelete(true);
      // Reset after 3 seconds if not clicked again
      setTimeout(() => setIsConfirmingDelete(false), 3000);
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-[32px] border shadow-sm p-8 flex flex-col justify-between group transition-all relative overflow-hidden ${
      isReturning 
        ? 'border-purple-500/50 shadow-purple-500/20 shadow-lg' 
        : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'
    }`}>
      {/* Returning Glow Effect (CSS Only) */}
      {isReturning && (
        <div className="absolute inset-0 border-2 border-purple-500 rounded-3xl animate-pulse pointer-events-none opacity-50"></div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{enemy.topicName}</h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{enemy.subjectName}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {isReturning && (
            <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border border-purple-200 dark:border-purple-800/50 flex-shrink-0">
              Retornando
            </span>
          )}
          {onDelete && (
            <button 
              onClick={handleDeleteClick}
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
                isConfirmingDelete 
                  ? 'bg-red-500 text-white px-2' 
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
              title={isConfirmingDelete ? "Clique novamente para confirmar" : "Excluir tópico"}
            >
              <span className="material-symbols-outlined text-lg">delete</span>
              {isConfirmingDelete && <span className="text-[10px] font-bold uppercase">Confirmar?</span>}
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-2 mb-6 text-[10px] font-black uppercase tracking-tighter">
        <span className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
          Vencido em {victoryDate.toLocaleDateString()}
        </span>
        <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-100/50 dark:border-emerald-800/50">
          +{enemy.lastVictoryXP} XP
        </span>
        {enemy.returnCount > 0 && (
          <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 px-2.5 py-1 rounded-lg border border-blue-100/50 dark:border-blue-800/50">
            Retorno {enemy.returnCount}
          </span>
        )}
      </div>
      
      {/* Forgetting Curve Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Força de Retorno</span>
          <span className="text-xs font-bold" style={{ color: barColor }}>
            {barValue}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${barValue}%`, backgroundColor: barColor }}
          ></div>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 font-medium">
          {isReturning 
            ? "Inimigo pronto para retornar ao campo de batalha!" 
            : `Retorna em ${Math.max(1, daysUntilReturn)} dias`}
        </p>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 dark:bg-slate-700/30 rounded-2xl p-3 mb-6 flex items-center justify-between">
        <div>
          <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Próxima Batalha</span>
          <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200">
            <span>{currentQuestions} questões</span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className={
              currentDifficulty === 'easy' ? 'text-emerald-500' :
              currentDifficulty === 'medium' ? 'text-amber-500' :
              currentDifficulty === 'hard' ? 'text-orange-500' : 'text-red-500'
            }>{difficultyLabels[currentDifficulty]}</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={() => onReviewNow(enemy.id)}
        className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${
          isReturning
            ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20 border-transparent'
            : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <span className="material-symbols-outlined text-xl">history</span>
        Revisar Agora
      </button>
    </div>
  );
};

export default ArchivedEnemyCard;
