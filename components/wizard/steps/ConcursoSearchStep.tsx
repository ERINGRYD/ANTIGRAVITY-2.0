import React, { useState } from 'react';
// import { GoogleGenAI, Type } from '@google/genai';
import { WizardState, ConcursoInfo } from '../../../types/wizard.types';
import { motion, AnimatePresence } from 'motion/react';

interface ConcursoSearchStepProps {
  state: WizardState;
  updateState: (updates: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const ConcursoSearchStep: React.FC<ConcursoSearchStepProps> = ({ state, updateState, onNext, onBack }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ConcursoInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedConcurso, setSelectedConcurso] = useState<ConcursoInfo | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setSelectedConcurso(null);
    try {
      // API call disabled temporarily per user request
      /*
      // const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY_DISABLED });
      const response = await ai.models.generateContent({
        ...
      });
      const data = JSON.parse(response.text || '[]');
      */
      
      // Mocked data for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500));
      const data: ConcursoInfo[] = [
        {
          name: "Concurso Simulado - Banco do Brasil",
          banca: "Cesgranrio",
          date: "2025-10-15",
          positions: [
            {
              name: "Escriturário - Agente de Tecnologia",
              subjects: [
                {
                  name: "Língua Portuguesa",
                  topics: [
                    {
                      name: "Compreensão de textos",
                      subtopics: [
                        { name: "Tipologia textual" }
                      ]
                    }
                  ]
                },
                {
                  name: "Conhecimentos Bancários",
                  topics: [
                    {
                      name: "Sistema Financeiro Nacional",
                      subtopics: []
                    }
                  ]
                }
              ]
            }
          ]
        }
      ];
      
      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setError('Ocorreu um erro ao buscar os concursos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConcurso = (concurso: ConcursoInfo) => {
    if (concurso.positions.length === 1) {
      updateState({ 
        concursoInfo: concurso,
        selectedPosition: concurso.positions[0].name
      });
      onNext();
    } else {
      setSelectedConcurso(concurso);
    }
  };

  const handleSelectPosition = (positionName: string) => {
    if (!selectedConcurso) return;
    updateState({ 
      concursoInfo: selectedConcurso,
      selectedPosition: positionName
    });
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Pesquisar Concursos</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Digite o nome do concurso ou órgão para encontrar as matérias e temas.</p>
      </section>

      {!selectedConcurso ? (
        <>
          <div className="relative max-w-2xl mx-auto">
            <div className="relative group">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ex: Concurso Banco do Brasil 2025, Receita Federal..."
                className="w-full pl-14 pr-32 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] text-lg font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-xl shadow-slate-200/20 dark:shadow-none"
              />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <span className="material-symbols-outlined text-2xl">search</span>
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-2xl text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {results.map((concurso, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleSelectConcurso(concurso)}
                  className="group text-left p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-500/10 transition-colors" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{concurso.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">calendar_today</span>
                          {concurso.date ? new Date(concurso.date).toLocaleDateString('pt-BR') : 'Data a definir'}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">work</span>
                          {concurso.positions.length} Cargos
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                      Selecionar
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {concurso.positions.slice(0, 3).map((p, pIdx) => (
                      <span key={pIdx} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded-full">
                        {p.name}
                      </span>
                    ))}
                    {concurso.positions.length > 3 && (
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded-full">
                        +{concurso.positions.length - 3}
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>

            {!loading && results.length === 0 && !error && query && (
              <div className="text-center py-12 space-y-4">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <span className="material-symbols-outlined text-4xl">search_off</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum concurso encontrado. Tente outro termo.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedConcurso(null)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{selectedConcurso.name}</h3>
              <p className="text-sm text-slate-500">Selecione o cargo que você deseja prestar:</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedConcurso.positions.map((position, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPosition(position.name)}
                className="p-6 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-blue-500 hover:shadow-lg transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">work</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-blue-500 transition-colors">arrow_forward</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">{position.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {position.subjects.length} Matérias identificadas
                </p>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ConcursoSearchStep;
