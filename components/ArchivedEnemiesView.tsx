import React, { useState, useMemo, useEffect } from 'react';
import { ArchivedEnemy, calculateBarValue, shouldEnemyReturn, getArchivedEnemies, deleteArchivedEnemy } from '../utils/ebbinghaus';
import ArchivedEnemyCard from './ArchivedEnemyCard';

interface ArchivedEnemiesViewProps {
  onBack: () => void;
  onReviewNow: (enemyId: string) => void;
  subjectId?: string | null;
}

// Mock data for demonstration purposes
const MOCK_ENEMIES: ArchivedEnemy[] = [
  {
    id: '1',
    topicId: 't1',
    subjectId: 's1',
    topicName: 'Funções Trigonométricas',
    subjectName: 'Matemática',
    originalVictoryDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastVictoryDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastVictoryXP: 1250,
    returnCount: 0,
    currentInterval: 1,
    nextReturnDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Overdue
    memoryStability: 4, // Low stability
    baseQuestions: 5,
    currentDifficulty: 'easy',
    contestDate: null,
    totalQuestionsAvailable: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    topicId: 't2',
    subjectId: 's2',
    topicName: 'Revolução Industrial',
    subjectName: 'História',
    originalVictoryDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    lastVictoryDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    lastVictoryXP: 980,
    returnCount: 1,
    currentInterval: 7,
    nextReturnDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Not overdue
    memoryStability: 12, // Medium stability
    baseQuestions: 5,
    currentDifficulty: 'medium',
    contestDate: null,
    totalQuestionsAvailable: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    topicId: 't3',
    subjectId: 's3',
    topicName: 'Leis de Newton',
    subjectName: 'Física',
    originalVictoryDate: new Date(Date.now() - 0.2 * 24 * 60 * 60 * 1000).toISOString(),
    lastVictoryDate: new Date(Date.now() - 0.2 * 24 * 60 * 60 * 1000).toISOString(),
    lastVictoryXP: 1500,
    returnCount: 0,
    currentInterval: 1,
    nextReturnDate: new Date(Date.now() + 0.8 * 24 * 60 * 60 * 1000).toISOString(), // Not overdue
    memoryStability: 20, // High stability
    baseQuestions: 5,
    currentDifficulty: 'easy',
    contestDate: null,
    totalQuestionsAvailable: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

type SortOption = 'retorno' | 'materia' | 'xp';

const ArchivedEnemiesView: React.FC<ArchivedEnemiesViewProps> = ({ onBack, onReviewNow, subjectId }) => {
  const [enemies, setEnemies] = useState<ArchivedEnemy[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('retorno');

  useEffect(() => {
    const loadEnemies = () => {
      const archived = getArchivedEnemies();
      const filtered = archived.filter(e => {
        const room = localStorage.getItem(`room_${e.topicId}`);
        const now = new Date();
        const daysSince = (now.getTime() - new Date(e.lastVictoryDate).getTime()) / (1000 * 60 * 60 * 24);
        const barValue = calculateBarValue(daysSince, e.memoryStability, e);
        const isReturning = barValue === 100 || shouldEnemyReturn(e);
        
        const matchesSubject = !subjectId || e.subjectId === subjectId;
        
        return room === 'vencidos' && !isReturning && matchesSubject;
      });
      setEnemies(filtered);
    };
    loadEnemies();
  }, [subjectId]);

  const handleReviewNow = (enemyId: string) => {
    const enemy = enemies.find(e => e.id === enemyId);
    if (enemy) {
      onReviewNow(enemy.topicId);
    }
  };

  const handleDelete = (topicId: string) => {
    deleteArchivedEnemy(topicId);
    setEnemies(prev => prev.filter(e => e.topicId !== topicId));
  };

  const sortedEnemies = useMemo(() => {
    const now = new Date();
    return [...enemies].sort((a, b) => {
      if (sortBy === 'retorno') {
        const daysA = (now.getTime() - new Date(a.lastVictoryDate).getTime()) / (1000 * 60 * 60 * 24);
        const daysB = (now.getTime() - new Date(b.lastVictoryDate).getTime()) / (1000 * 60 * 60 * 24);
        const barA = calculateBarValue(daysA, a.memoryStability, a);
        const barB = calculateBarValue(daysB, b.memoryStability, b);
        return barB - barA; // Highest bar value first
      }
      if (sortBy === 'materia') {
        return a.subjectName.localeCompare(b.subjectName);
      }
      if (sortBy === 'xp') {
        return b.lastVictoryXP - a.lastVictoryXP;
      }
      return 0;
    });
  }, [enemies, sortBy]);

  const returningEnemies = sortedEnemies.filter(e => {
    const now = new Date();
    const daysSince = (now.getTime() - new Date(e.lastVictoryDate).getTime()) / (1000 * 60 * 60 * 24);
    return calculateBarValue(daysSince, e.memoryStability, e) === 100 || shouldEnemyReturn(e);
  });

  const normalEnemies = sortedEnemies.filter(e => {
    const now = new Date();
    const daysSince = (now.getTime() - new Date(e.lastVictoryDate).getTime()) / (1000 * 60 * 60 * 24);
    return calculateBarValue(daysSince, e.memoryStability, e) < 100 && !shouldEnemyReturn(e);
  });

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB] dark:bg-[#0B1120] flex flex-col animate-in fade-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 md:p-6 lg:p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-slate-900/50 sticky top-0 z-20 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-500 dark:text-gray-400"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-gray-400">inventory_2</span>
              Inimigos Vencidos
              <span className="bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-xs font-bold px-2 py-1 rounded-full ml-2">
                {enemies.length}
              </span>
            </h1>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">
              Histórico de Batalhas Vencidas & Curva de Esquecimento
            </p>
          </div>
        </div>
        
        {/* Sort Options */}
        <div className="hidden md:flex items-center gap-2 bg-gray-50 dark:bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => setSortBy('retorno')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${sortBy === 'retorno' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Por retorno
          </button>
          <button 
            onClick={() => setSortBy('materia')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${sortBy === 'materia' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Por matéria
          </button>
          <button 
            onClick={() => setSortBy('xp')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${sortBy === 'xp' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Por XP
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 lg:p-8 overflow-y-auto flex-1">
        {enemies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">inventory_2</span>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhum inimigo vencido ainda. Vença batalhas para arquivá-los aqui.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Returning Enemies Section */}
            {returningEnemies.length > 0 && (
              <section>
                <h2 className="text-sm font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">warning</span>
                  Retornando ao Campo de Batalha
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {returningEnemies.map(enemy => (
                    <ArchivedEnemyCard 
                      key={enemy.id} 
                      enemy={enemy} 
                      onReviewNow={handleReviewNow} 
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Normal Enemies Section */}
            {normalEnemies.length > 0 && (
              <section>
                {returningEnemies.length > 0 && (
                  <h2 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 mt-8">
                    Arquivados
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {normalEnemies.map(enemy => (
                    <ArchivedEnemyCard 
                      key={enemy.id} 
                      enemy={enemy} 
                      onReviewNow={handleReviewNow} 
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchivedEnemiesView;
