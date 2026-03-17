import React, { useState, useEffect } from 'react';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import { Question } from '../types';

interface EditQuestionViewProps {
  initialData?: Question;
  onBack: () => void;
  onSave: (updatedQuestion: Partial<Question>) => void;
}

const EditQuestionView: React.FC<EditQuestionViewProps> = ({ initialData, onBack, onSave }) => {
  const [questionType, setQuestionType] = useState<'multipla' | 'certo_errado' | 'flashcard'>(initialData?.questionType || 'multipla');
  const [difficulty, setDifficulty] = useState<'FÁCIL' | 'MÉDIO' | 'DIFÍCIL'>(initialData?.difficulty || 'MÉDIO');
  const [correctAnswerMultipla, setCorrectAnswerMultipla] = useState<string>(initialData?.correctAnswerMultipla || 'A');
  const [correctAnswerCertoErrado, setCorrectAnswerCertoErrado] = useState<string>(initialData?.correctAnswerCertoErrado || 'Certo');
  const [flashcardAnswer, setFlashcardAnswer] = useState<string>(initialData?.flashcardAnswer || String.raw`O determinante é $det(A) = (1)(4) - (2)(3) = 4 - 6 = -2$.`);
  const [enunciation, setEnunciation] = useState<string>(initialData?.text || String.raw`Dada a matriz $A = \begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix}$, calcule o determinante e assinale a alternativa correta.`);
  const [tags, setTags] = useState<string[]>(initialData?.tags || ['vestibular', 'concursos']);
  const [newTag, setNewTag] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [title, setTitle] = useState(initialData?.code || 'Nova Questão'); // Using code as title for now or add title field to Question

  const [options, setOptions] = useState<{id: string, text: string, isCorrect: boolean}[]>(initialData?.options || [
    { id: 'A', text: '', isCorrect: initialData?.correctAnswerMultipla === 'A' },
    { id: 'B', text: '', isCorrect: initialData?.correctAnswerMultipla === 'B' },
    { id: 'C', text: '', isCorrect: initialData?.correctAnswerMultipla === 'C' },
    { id: 'D', text: '', isCorrect: initialData?.correctAnswerMultipla === 'D' },
    { id: 'E', text: '', isCorrect: initialData?.correctAnswerMultipla === 'E' },
  ]);
  const [explanation, setExplanation] = useState<string>(initialData?.explanation || '');

  const handleSave = () => {
    const updatedData: Partial<Question> = {
      ...initialData,
      questionType,
      difficulty,
      text: enunciation,
      tags,
      explanation,
      options: questionType === 'multipla' ? options : undefined,
      correctAnswerMultipla: questionType === 'multipla' ? correctAnswerMultipla : undefined,
      correctAnswerCertoErrado: questionType === 'certo_errado' ? correctAnswerCertoErrado : undefined,
      flashcardAnswer: questionType === 'flashcard' ? flashcardAnswer : undefined,
    };
    onSave(updatedData);
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-[#F8FAFC] dark:bg-slate-950 pb-48 font-display animate-in slide-in-from-right duration-300">
      <header className="sticky top-0 z-40 bg-[#F8FAFC]/95 dark:bg-slate-950/95 backdrop-blur-md pt-4 px-4 pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-[#0F172A] dark:text-white tracking-tight">Editar Questão</h1>
            <span className="text-xs font-bold text-[#1978e5] opacity-80">#{title}</span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#1978e5] text-xl">category</span>
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Classificação</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">MATÉRIA</label>
              <select className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#1978e5] transition-all appearance-none">
                <option>Matemática</option>
                <option>Português</option>
                <option>Direito Constitucional</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">TEMA</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#1978e5] transition-all">
                  <option>Álgebra Linear</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">SUBTEMA</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#1978e5] transition-all">
                  <option>Matrizes</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#1978e5] text-xl">description</span>
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Conteúdo</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">TÍTULO DA QUESTÃO</label>
              <input 
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#1978e5] transition-all" 
                type="text" 
                defaultValue="Determinantes de Matriz 3x3"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1">DIFICULDADE</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setDifficulty('FÁCIL')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${difficulty === 'FÁCIL' ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' : 'border-slate-200 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                >
                  FÁCIL
                </button>
                <button 
                  onClick={() => setDifficulty('MÉDIO')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${difficulty === 'MÉDIO' ? 'border-orange-200 bg-orange-500 text-white shadow-sm' : 'border-slate-200 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                >
                  MÉDIO
                </button>
                <button 
                  onClick={() => setDifficulty('DIFÍCIL')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${difficulty === 'DIFÍCIL' ? 'border-red-200 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' : 'border-slate-200 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                >
                  DIFÍCIL
                </button>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1 ml-1">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">ENUNCIADO (SUPORTE LATEX)</label>
                <span className="text-[10px] font-bold text-[#1978e5] bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1978e5]"></span>MODO VISUAL
                </span>
              </div>
              <textarea 
                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#1978e5] transition-all leading-relaxed mb-3" 
                rows={4}
                value={enunciation}
                onChange={(e) => setEnunciation(e.target.value)}
              />
              <div className="bg-[#F1F5F9] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-slate-400 text-sm">visibility</span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Pré-visualização</span>
                </div>
                <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-serif">
                  <Latex>{enunciation}</Latex>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#1978e5] text-xl">checklist</span>
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Respostas</h2>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1">
            <button 
              onClick={() => setQuestionType('multipla')}
              className={`flex-1 py-2 text-[10px] font-black rounded-lg uppercase transition-all ${questionType === 'multipla' ? 'bg-white dark:bg-slate-700 text-[#1978e5] shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Múltipla Escolha
            </button>
            <button 
              onClick={() => setQuestionType('certo_errado')}
              className={`flex-1 py-2 text-[10px] font-black rounded-lg uppercase transition-all ${questionType === 'certo_errado' ? 'bg-white dark:bg-slate-700 text-[#1978e5] shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Certo/Errado
            </button>
            <button 
              onClick={() => setQuestionType('flashcard')}
              className={`flex-1 py-2 text-[10px] font-black rounded-lg uppercase transition-all ${questionType === 'flashcard' ? 'bg-white dark:bg-slate-700 text-[#1978e5] shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Flashcard
            </button>
          </div>
          <div className="space-y-3 mt-4">
            {questionType === 'multipla' && (
              <>
                {options.map((opt, idx) => (
                  <div key={opt.id} className="flex gap-3 items-center">
                    <button className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs flex-shrink-0">{opt.id}</button>
                    <input 
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#1978e5]" 
                      type="text" 
                      value={opt.text}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[idx].text = e.target.value;
                        setOptions(newOptions);
                      }}
                    />
                    <button 
                      onClick={() => {
                        setCorrectAnswerMultipla(opt.id);
                        setOptions(options.map(o => ({ ...o, isCorrect: o.id === opt.id })));
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${correctAnswerMultipla === opt.id ? 'text-[#10B981] bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-[#10B981] hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800'}`}
                    >
                      <span className="material-symbols-outlined text-lg">{correctAnswerMultipla === opt.id ? 'check_circle' : 'radio_button_unchecked'}</span>
                    </button>
                  </div>
                ))}
              </>
            )}

            {questionType === 'certo_errado' && (
              <>
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs flex-shrink-0 flex items-center justify-center">C</div>
                  <input className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#1978e5]" type="text" defaultValue="Certo"/>
                  <button 
                    onClick={() => setCorrectAnswerCertoErrado('Certo')}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${correctAnswerCertoErrado === 'Certo' ? 'text-[#10B981] bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-[#10B981] hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800'}`}
                  >
                    <span className="material-symbols-outlined text-lg">{correctAnswerCertoErrado === 'Certo' ? 'check_circle' : 'radio_button_unchecked'}</span>
                  </button>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs flex-shrink-0 flex items-center justify-center">E</div>
                  <input className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#1978e5]" type="text" defaultValue="Errado"/>
                  <button 
                    onClick={() => setCorrectAnswerCertoErrado('Errado')}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${correctAnswerCertoErrado === 'Errado' ? 'text-[#10B981] bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-[#10B981] hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800'}`}
                  >
                    <span className="material-symbols-outlined text-lg">{correctAnswerCertoErrado === 'Errado' ? 'check_circle' : 'radio_button_unchecked'}</span>
                  </button>
                </div>
              </>
            )}

            {questionType === 'flashcard' && (
              <div>
                <div className="flex justify-between items-center mb-1 ml-1">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">VERSO DO FLASHCARD (RESPOSTA)</label>
                  <span className="text-[10px] font-bold text-[#1978e5] bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1978e5]"></span>MODO VISUAL
                  </span>
                </div>
                <textarea 
                  className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#1978e5] transition-all leading-relaxed mb-3" 
                  placeholder="Digite a resposta do flashcard aqui..." 
                  rows={4}
                  value={flashcardAnswer}
                  onChange={(e) => setFlashcardAnswer(e.target.value)}
                />
                <div className="bg-[#F1F5F9] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-slate-400 text-sm">visibility</span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Pré-visualização</span>
                  </div>
                  <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-serif">
                    <Latex>{flashcardAnswer}</Latex>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">EXPLICAÇÃO DO MESTRE</label>
            <textarea 
              className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#1978e5]" 
              placeholder="Dica ou resolução passo a passo..." 
              rows={3}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1">TAGS</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-[#1978e5] dark:text-blue-400 text-[10px] font-bold rounded-full flex items-center gap-1 border border-blue-100 dark:border-blue-800">
                  #{tag} 
                  <span 
                    className="material-symbols-outlined text-xs cursor-pointer hover:text-blue-700 dark:hover:text-blue-300"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    close
                  </span>
                </span>
              ))}
              
              {isAddingTag ? (
                <input
                  autoFocus
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onBlur={handleAddTag}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-full text-[10px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1978e5] w-24"
                  placeholder="Nova tag..."
                />
              ) : (
                <button 
                  onClick={() => setIsAddingTag(true)}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-full border border-dashed border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  + Adicionar Tag
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4 pt-4">
          <button 
            onClick={handleSave}
            className="w-full bg-[#1978e5] text-white font-bold py-4 rounded-2xl shadow-[0_10px_25px_-5px_rgba(25,120,229,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-blue-600"
          >
            SALVAR ALTERAÇÕES
          </button>
          <button className="w-full py-2 text-sm font-bold text-[#EF4444] flex items-center justify-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-lg">delete</span>
            Excluir Questão
          </button>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-2 py-2 pb-8 flex justify-between items-end z-50">
        <div className="flex-1 flex justify-center">
          <button className="flex flex-col items-center gap-1 py-1 text-slate-400 group">
            <span className="material-symbols-outlined text-[26px] group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">home</span>
            <span className="text-[10px] font-medium group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Início</span>
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          <button className="flex flex-col items-center gap-1 py-1 text-slate-400 group">
            <span className="material-symbols-outlined text-[26px] group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">donut_large</span>
            <span className="text-[10px] font-medium group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Ciclo</span>
          </button>
        </div>
        <div className="flex-1 flex justify-center relative">
          <div className="absolute -top-2 w-12 h-1 bg-[#1978e5] rounded-full"></div>
          <div className="flex flex-col items-center gap-1 -mt-4">
            <div className="bg-[#1978e5] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/40 border-4 border-white dark:border-slate-900 transition-transform active:scale-95">
              <span className="material-symbols-outlined text-2xl">swords</span>
            </div>
            <span className="text-[10px] font-bold text-[#1978e5]">Batalha</span>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <button className="flex flex-col items-center gap-1 py-1 text-slate-400 group">
            <span className="material-symbols-outlined text-[26px] group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">stadium</span>
            <span className="text-[10px] font-medium group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Coliseu</span>
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          <button className="flex flex-col items-center gap-1 py-1 text-slate-400 group">
            <span className="material-symbols-outlined text-[26px] group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">more_horiz</span>
            <span className="text-[10px] font-medium group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Mais</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default EditQuestionView;
