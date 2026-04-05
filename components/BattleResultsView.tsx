import React, { useState } from 'react';
import { motion } from 'motion/react';

interface QuestionResult {
  id: number;
  text: string;
  timeSpent: string;
  isCorrect: boolean;
  selectedOptionId: string;
  correctOptionId: string;
  explanation: string;
  confidence: 'certain' | 'doubtful' | 'guess';
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
  mode?: string;
}

const BattleResultsView: React.FC<BattleResultsViewProps> = ({ results, onFinish, sessionSummary, mode }) => {
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
    console.log(`Motivo do erro na questão ${questionId}: ${reason}`);
  };

  const missedQuestions = results.questions.filter(q => !q.isCorrect);
  const allReasonsSelected = missedQuestions.every(q => errorReasons[q.id]);
  const accuracyPercent = Math.round((results.accuracy.correct / results.accuracy.total) * 100);
  
  const isVictory = accuracyPercent >= 70;
  const isPerfect = accuracyPercent === 100;

  const confidenceMap: Record<string, string> = {
    'certain': 'certeza',
    'doubtful': 'duvida',
    'guess': 'chute'
  };

  const filteredQuestions = results.questions.filter(q => {
    if (filter === 'todos') return true;
    return confidenceMap[q.confidence] === filter;
  });

  return (
    <div className="absolute inset-0 z-50 bg-[#f6f7f8] dark:bg-[#0B1120] font-['Inter'] text-slate-900 dark:text-slate-100 flex flex-col min-h-screen overflow-y-auto no-scrollbar">
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-md mx-auto flex items-center p-4">
          <button 
            onClick={handleFinish} 
            disabled={!allReasonsSelected}
            className={`p-2 rounded-full transition-colors ${!allReasonsSelected ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <span className="material-symbols-outlined block">arrow_back</span>
          </button>
          <h1 className="flex-1 text-center text-lg font-bold tracking-tight uppercase">Relatório de Missão</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full flex flex-col pb-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 space-y-4"
        >
          {/* Victory/Defeat Banner */}
          <div className={`rounded-[32px] p-8 text-center relative overflow-hidden shadow-2xl ${
            isPerfect ? 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600' :
            isVictory ? 'bg-gradient-to-br from-emerald-500 to-teal-700' :
            'bg-gradient-to-br from-slate-700 to-slate-900'
          }`}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-9xl">
                {isPerfect ? 'workspace_premium' : isVictory ? 'military_tech' : 'skull'}
              </span>
            </div>
            
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <span className="material-symbols-outlined text-6xl text-white mb-2 font-variation-fill">
                {isPerfect ? 'auto_awesome' : isVictory ? 'emoji_events' : 'flag'}
              </span>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-1">
                {isPerfect ? 'PERFEITO!' : isVictory ? 'VITÓRIA!' : 'MISSÃO CONCLUÍDA'}
              </h2>
              <p className="text-white/80 text-xs font-bold uppercase tracking-widest">
                {mode ? `MODO: ${mode.toUpperCase()}` : 'COMBATE FINALIZADO'}
              </p>
            </motion.div>

            <div className="mt-6 flex justify-center gap-8">
              <div className="text-center">
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Precisão</p>
                <p className="text-2xl font-black text-white">{accuracyPercent}%</p>
              </div>
              <div className="w-px h-10 bg-white/20 self-center"></div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">XP Ganho</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-amber-300 text-sm font-variation-fill">stars</span>
                  <p className="text-2xl font-black text-white">+{results.totalXp}</p>
                </div>
              </div>
            </div>

            {isVictory && (
              <motion.div 
                initial={{ scale: 2, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: -12 }}
                transition={{ delay: 0.8, type: 'spring' }}
                className="absolute bottom-4 right-4 border-4 border-white/30 rounded-full p-2 rotate-[-12deg]"
              >
                <div className="border-2 border-white/30 rounded-full px-3 py-1">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">APROVADO</span>
                </div>
              </motion.div>
            )}
          </div>

          {sessionSummary && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-indigo-500 text-xl">trending_up</span>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white">Evolução do Tópico</h3>
              </div>
              
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Anterior</span>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400 capitalize">{sessionSummary.previousRoom}</span>
                </div>
                
                <div className="flex flex-col items-center px-2">
                  <span className="material-symbols-outlined text-indigo-500 animate-pulse">double_arrow</span>
                </div>
                
                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Nova Sala</span>
                  <span className="text-sm font-black text-emerald-500 capitalize">{sessionSummary.newRoom}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-700">
                  <div className="text-[9px] text-slate-400 font-bold uppercase mb-1">Score</div>
                  <div className="font-black text-slate-800 dark:text-white">{sessionSummary.weightedScore}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-700">
                  <div className="text-[9px] text-slate-400 font-bold uppercase mb-1">Acurácia</div>
                  <div className="font-black text-slate-800 dark:text-white">{sessionSummary.accuracyRate}%</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-700">
                  <div className="text-[9px] text-slate-400 font-bold uppercase mb-1">Estabilidade</div>
                  <div className="font-black text-slate-800 dark:text-white">{sessionSummary.memoryStability}d</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats Grid */}
          <div className="grid gap-3 grid-cols-2">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-blue-500 text-xl">schedule</span>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">Tempo Total</p>
              </div>
              <p className="font-black text-2xl text-slate-800 dark:text-white">{results.totalTime}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-emerald-500 text-xl">timer</span>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">Média/Questão</p>
              </div>
              <p className="font-black text-2xl text-slate-800 dark:text-white">{results.averageTime}</p>
            </div>
          </div>

          {/* Confidence Level */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-800 dark:text-white text-base font-bold">Nível de Confiança</h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">ANÁLISE</span>
            </div>
            <div className="w-full h-3 flex rounded-full overflow-hidden mb-6 bg-slate-100 dark:bg-slate-800">
              <div className="h-full bg-emerald-500" style={{ width: `${results.confidenceStats.certeza}%` }}></div>
              <div className="h-full bg-amber-500" style={{ width: `${results.confidenceStats.duvida}%` }}></div>
              <div className="h-full bg-rose-500" style={{ width: `${results.confidenceStats.chute}%` }}></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <span className="text-[9px] font-bold text-emerald-500 mb-1 uppercase">Certeza</span>
                <span className="text-lg font-black text-emerald-500">{results.confidenceStats.certeza}%</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                <span className="text-[9px] font-bold text-amber-500 mb-1 uppercase">Dúvida</span>
                <span className="text-lg font-black text-amber-500">{results.confidenceStats.duvida}%</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                <span className="text-[9px] font-bold text-rose-500 mb-1 uppercase">Chute</span>
                <span className="text-lg font-black text-rose-500">{results.confidenceStats.chute}%</span>
              </div>
            </div>
          </div>

          {/* Question Review Section */}
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Revisão de Questões</h2>
              <div className="flex gap-1">
                {['todos', 'certeza', 'duvida', 'chute'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${
                      filter === f 
                        ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            
            {filteredQuestions.map((question, index) => (
              <motion.div 
                key={`${question.id}-${index}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                {question.isCorrect ? (
                  <details className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all hover:border-emerald-500/30">
                    <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-emerald-500 text-xl font-variation-fill">check_circle</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 dark:text-white block">Questão {String(index + 1).padStart(2, '0')}</span>
                          <span className="text-slate-400 text-[10px] font-bold uppercase">{question.timeSpent} • {confidenceMap[question.confidence]}</span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-slate-300 group-open:rotate-180 transition-transform">expand_more</span>
                    </summary>
                    <div className="p-6 border-t border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                        "{question.text}"
                      </p>
                      <div className="mt-4 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  </details>
                ) : (
                  <div className="bg-white dark:bg-slate-900 rounded-[32px] border-2 border-rose-500/20 overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between p-5 bg-rose-500/5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-rose-500 text-xl font-variation-fill">cancel</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 dark:text-white block">Questão {String(index + 1).padStart(2, '0')}</span>
                          <span className="text-rose-400 text-[10px] font-bold uppercase">{question.timeSpent} • {confidenceMap[question.confidence]}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase py-1 px-3 rounded-full bg-rose-500 text-white">Incorreta</span>
                    </div>
                    <div className="p-6 space-y-5">
                      <p className="text-sm font-bold text-slate-800 dark:text-white leading-relaxed">{question.text}</p>
                      
                      <div className="space-y-3">
                        {question.options.filter(opt => opt.id === question.selectedOptionId || opt.id === question.correctOptionId).map(option => (
                          <div 
                            key={option.id}
                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                              option.id === question.correctOptionId 
                                ? 'border-emerald-500 bg-emerald-500/5' 
                                : 'border-rose-500 bg-rose-500/5'
                            }`}
                          >
                            <span className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black ${
                              option.id === question.correctOptionId 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-rose-500 text-white'
                            }`}>
                              {option.id}
                            </span>
                            <span className="text-sm text-slate-700 dark:text-slate-300 font-bold">{option.text}</span>
                            <span className={`material-symbols-outlined ml-auto ${
                              option.id === question.correctOptionId ? 'text-emerald-500' : 'text-rose-500'
                            }`}>
                              {option.id === question.correctOptionId ? 'check_circle' : 'close'}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-blue-500/5 dark:bg-blue-500/10 border-l-4 border-blue-500 p-5 rounded-r-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-blue-500 text-sm">lightbulb</span>
                          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Análise do QG</span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                          {question.explanation}
                        </p>
                      </div>

                      <div className={`p-5 rounded-3xl transition-all ${!errorReasons[question.id] ? 'bg-indigo-500/5 border-2 border-dashed border-indigo-500/30' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-4 text-center tracking-widest">Identifique a Falha</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'Interpretação', icon: 'search' },
                            { id: 'Conteúdo', icon: 'school' },
                            { id: 'Distração', icon: 'timer_off' },
                            { id: 'Outro', icon: 'more_horiz' }
                          ].map((reason) => (
                            <button 
                              key={reason.id}
                              onClick={() => handleErrorReasonSelect(question.id, reason.id)}
                              className={`flex items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all text-[11px] font-bold ${
                                errorReasons[question.id] === reason.id
                                  ? 'border-indigo-500 bg-indigo-500 text-white'
                                  : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:border-indigo-500/50'
                              }`}
                            >
                              <span className="material-symbols-outlined text-sm">{reason.icon}</span>
                              {reason.id}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="pt-6">
            <button 
              onClick={handleFinish}
              disabled={!allReasonsSelected}
              className={`w-full font-black text-lg py-5 rounded-[32px] shadow-2xl transition-all transform active:scale-95 ${
                allReasonsSelected 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-blue-500/30 hover:brightness-110' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              {allReasonsSelected ? 'CONCLUIR MISSÃO' : 'IDENTIFIQUE OS ERROS'}
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default BattleResultsView;

