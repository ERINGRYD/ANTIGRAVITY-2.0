import React, { useState } from 'react';

interface QuestionResult {
  id: number;
  text: string;
  timeSpent: string;
  isCorrect: boolean;
  selectedOptionId: string;
  correctOptionId: string;
  explanation: string;
  options: { id: string; text: string }[];
}

interface SessionResults {
  totalXp: number;
  accuracy: {
    correct: number;
    total: number;
  };
  totalTime: string;
  averageTime: string;
  confidenceStats: {
    certeza: number;
    duvida: number;
    chute: number;
  };
  questions: QuestionResult[];
}

interface SessionSummary {
  previousRoom: string;
  newRoom: string;
  weightedScore: number;
  accuracyRate: number;
  memoryStability: number;
}

interface BattleResultsViewProps {
  results: SessionResults;
  onFinish: (errorReasons: Record<number, string>) => void;
  sessionSummary?: SessionSummary;
}

const BattleResultsView: React.FC<BattleResultsViewProps> = ({ results, onFinish, sessionSummary }) => {
  const [filter, setFilter] = useState<'todos' | 'certeza' | 'duvida' | 'chute'>('todos');
  const [errorReasons, setErrorReasons] = useState<Record<number, string>>({});

  const handleFinish = () => {
    onFinish(errorReasons);
  };

  const handleErrorReasonSelect = (questionId: number, reason: string) => {
    setErrorReasons(prev => ({
      ...prev,
      [questionId]: reason
    }));
    // In a real app, you would save this to the backend here
    console.log(`Motivo do erro na questão ${questionId}: ${reason}`);
  };

  const missedQuestions = results.questions.filter(q => !q.isCorrect);
  const allReasonsSelected = missedQuestions.every(q => errorReasons[q.id]);

  return (
    <div className="absolute inset-0 z-50 bg-[#f6f7f8] dark:bg-[#111821] font-['Inter'] text-slate-900 dark:text-slate-100 flex flex-col min-h-screen overflow-y-auto">
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#111821]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-md mx-auto flex items-center p-4">
          <button 
            onClick={handleFinish} 
            disabled={!allReasonsSelected}
            className={`p-2 rounded-full transition-colors ${!allReasonsSelected ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <span className="material-symbols-outlined block">arrow_back</span>
          </button>
          <h1 className="flex-1 text-center text-lg font-bold tracking-tight">Resultados da Investigação</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full flex flex-col">
        <div className="p-4 space-y-3">
          {sessionSummary && (
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-white/80">auto_awesome</span>
                <h3 className="font-bold text-sm tracking-wide uppercase">Atualização de Sala</h3>
              </div>
              
              <div className="flex items-center justify-between bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Anterior</span>
                  <span className="font-bold capitalize">{sessionSummary.previousRoom}</span>
                </div>
                
                <div className="flex flex-col items-center px-4">
                  <span className="material-symbols-outlined text-white/50">arrow_forward</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Nova Sala</span>
                  <span className="font-bold capitalize text-green-300">{sessionSummary.newRoom}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="bg-white/10 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-white/60 font-bold uppercase">Score</div>
                  <div className="font-bold">{sessionSummary.weightedScore}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-white/60 font-bold uppercase">Acurácia</div>
                  <div className="font-bold">{sessionSummary.accuracyRate}%</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-white/60 font-bold uppercase">Estabilidade</div>
                  <div className="font-bold">{sessionSummary.memoryStability}d</div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {/* XP Card */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-blue-500 text-4xl mb-1 font-variation-fill">military_tech</span>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">XP Total Ganho</p>
              <p className="text-blue-500 text-3xl font-black">+{results.totalXp} XP</p>
              <p className="text-green-500 text-xs font-bold mt-1">Bônus de Sequência +15%</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-3 grid-cols-3">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-amber-500 text-lg">target</span>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">Precisão</p>
                </div>
                <p className="font-bold text-xl">{results.accuracy.correct}/{results.accuracy.total}</p>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full mt-2">
                  <div 
                    className="bg-amber-500 h-full rounded-full" 
                    style={{ width: `${(results.accuracy.correct / results.accuracy.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-blue-500 text-lg">schedule</span>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">Tempo</p>
                </div>
                <p className="font-bold text-xl">{results.totalTime}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-green-500 text-lg">timer</span>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">Média</p>
                </div>
                <p className="text-xl font-bold">{results.averageTime}</p>
                <p className="text-slate-400 dark:text-slate-500 text-[8px] mt-1 uppercase font-bold">p/ Questão</p>
              </div>
            </div>

            {/* Confidence Level */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold">Nível de Confiança</h3>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">GERAL</span>
              </div>
              <div className="w-full h-3 flex rounded-full overflow-hidden mb-6 bg-slate-100 dark:bg-slate-700">
                <div className="h-full bg-green-500" style={{ width: `${results.confidenceStats.certeza}%` }}></div>
                <div className="h-full bg-amber-500" style={{ width: `${results.confidenceStats.duvida}%` }}></div>
                <div className="h-full bg-blue-500" style={{ width: `${results.confidenceStats.chute}%` }}></div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center p-2 rounded-xl bg-green-500/5 border border-green-500/10">
                  <span className="text-[9px] font-bold text-green-500 mb-0.5 tracking-wider uppercase">Certeza</span>
                  <span className="text-lg font-bold text-green-500">{results.confidenceStats.certeza}%</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <span className="text-[9px] font-bold text-amber-500 mb-0.5 tracking-wider uppercase">Dúvida</span>
                  <span className="text-lg font-bold text-amber-500">{results.confidenceStats.duvida}%</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <span className="text-[9px] font-bold text-blue-500 mb-0.5 tracking-wider uppercase">Chute</span>
                  <span className="text-lg font-bold text-blue-500">{results.confidenceStats.chute}%</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <p className="text-slate-500 dark:text-slate-400 text-[10px]">Baseado em {results.accuracy.total} questões respondidas</p>
                <button className="text-blue-500 text-[10px] font-bold hover:underline uppercase tracking-wider">Ver Detalhes</button>
              </div>
            </div>

            {/* Filter */}
            <div className="mt-4 mb-2 space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Filtrar por Nível</p>
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                <button 
                  onClick={() => setFilter('todos')}
                  className={`flex-none px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-all ${filter === 'todos' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                >
                  Todos
                </button>
                <button 
                  onClick={() => setFilter('certeza')}
                  className={`flex-none px-4 py-2 rounded-full text-xs font-bold border transition-all ${filter === 'certeza' ? 'bg-green-500 text-white border-green-500' : 'bg-white dark:bg-slate-800 text-green-500 border-green-500/20 hover:bg-green-500/5'}`}
                >
                  Certeza
                </button>
                <button 
                  onClick={() => setFilter('duvida')}
                  className={`flex-none px-4 py-2 rounded-full text-xs font-bold border transition-all ${filter === 'duvida' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white dark:bg-slate-800 text-amber-500 border-amber-500/20 hover:bg-amber-500/5'}`}
                >
                  Dúvida
                </button>
                <button 
                  onClick={() => setFilter('chute')}
                  className={`flex-none px-4 py-2 rounded-full text-xs font-bold border transition-all ${filter === 'chute' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white dark:bg-slate-800 text-blue-500 border-blue-500/20 hover:bg-blue-500/5'}`}
                >
                  Chute
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className="p-4 space-y-4">
          <div className="flex items-center px-1">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Revisão de Questões</h2>
          </div>
          
          {results.questions.map((question, index) => (
            <div key={`${question.id}-${index}`}>
              {question.isCorrect ? (
                <details className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-green-500 text-sm font-variation-fill">check_circle</span>
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Questão {String(index + 1).padStart(2, '0')} <span className="text-slate-400 text-xs font-normal ml-1">- {question.timeSpent}</span></span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">expand_more</span>
                  </summary>
                  <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">
                    Você acertou esta questão! {question.explanation}
                  </div>
                </details>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-red-500/30 overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between p-4 bg-red-500/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-red-500 text-sm font-variation-fill">cancel</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">Questão {String(index + 1).padStart(2, '0')}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase py-1 px-2 rounded-full bg-red-500 text-white flex items-center">
                      <span className="mr-2 text-[10px] font-bold text-white/80">{question.timeSpent}</span>Incorreta
                    </span>
                  </div>
                  <div className="p-4 space-y-4">
                    <p className="text-sm font-medium leading-relaxed">{question.text}</p>
                    <div className="space-y-2">
                      {question.options.filter(opt => opt.id === question.selectedOptionId || opt.id === question.correctOptionId).map(option => (
                        <div 
                          key={option.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border ${
                            option.id === question.correctOptionId 
                              ? 'border-green-500 bg-green-500/5' 
                              : 'border-red-500 bg-red-500/5'
                          }`}
                        >
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                            option.id === question.correctOptionId 
                              ? 'bg-green-500 text-white' 
                              : 'bg-red-500 text-white'
                          }`}>
                            {option.id}
                          </span>
                          <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold">{option.text}</span>
                          <span className={`material-symbols-outlined ml-auto text-lg ${
                            option.id === question.correctOptionId ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {option.id === question.correctOptionId ? 'check_circle' : 'close'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-blue-500/5 dark:bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-blue-500 text-sm">lightbulb</span>
                        <span className="text-xs font-bold text-blue-500 uppercase">Explicação</span>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        {question.explanation}
                      </p>
                    </div>
                    <div className={`pt-2 p-3 rounded-2xl transition-all ${!errorReasons[question.id] ? 'border-2 border-blue-500 bg-blue-500/5' : ''}`}>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 text-center tracking-widest">Qual foi o motivo do erro?</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => handleErrorReasonSelect(question.id, 'Interpretação')}
                          className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-colors text-xs font-medium ${
                            errorReasons[question.id] === 'Interpretação'
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'border-slate-200 dark:border-slate-700 hover:border-blue-500/50 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <span className="material-symbols-outlined text-blue-500 text-sm">search</span>
                          Interpretação
                        </button>
                        <button 
                          onClick={() => handleErrorReasonSelect(question.id, 'Conteúdo')}
                          className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-colors text-xs font-medium ${
                            errorReasons[question.id] === 'Conteúdo'
                              ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                              : 'border-slate-200 dark:border-slate-700 hover:border-amber-500/50 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <span className="material-symbols-outlined text-amber-500 text-sm">menu_book</span>
                          Conteúdo
                        </button>
                        <button 
                          onClick={() => handleErrorReasonSelect(question.id, 'Distração')}
                          className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-colors text-xs font-medium ${
                            errorReasons[question.id] === 'Distração'
                              ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                              : 'border-slate-200 dark:border-slate-700 hover:border-red-500/50 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <span className="material-symbols-outlined text-red-500 text-sm">bolt</span>
                          Distração
                        </button>
                        <button 
                          onClick={() => handleErrorReasonSelect(question.id, 'Outro')}
                          className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-colors text-xs font-medium ${
                            errorReasons[question.id] === 'Outro'
                              ? 'border-slate-500 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <span className="material-symbols-outlined text-slate-500 text-sm">more_horiz</span>
                          Outro
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="pt-2 pb-8">
            <button 
              onClick={handleFinish}
              disabled={!allReasonsSelected}
              className={`w-full font-bold py-4 rounded-2xl shadow-lg transition-all ${
                allReasonsSelected 
                  ? 'bg-blue-500 text-white shadow-blue-500/20 hover:brightness-110 active:scale-[0.98]' 
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              {allReasonsSelected ? 'Concluir Sessão' : 'Selecione os motivos dos erros'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BattleResultsView;
