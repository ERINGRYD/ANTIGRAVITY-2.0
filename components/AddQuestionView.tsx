import React, { useState, useEffect, useMemo } from 'react';
import { Topic, Subject, SubTopic } from '../types';
import { useApp } from '../contexts/AppContext';
import UploadImageView from './UploadImageView';

interface AddQuestionViewProps {
  subjects?: Subject[];
  initialSubjectId?: string;
  initialTopicId?: string;
  onBack: () => void;
  onSave: (data: any) => void;
}

const AddQuestionView: React.FC<AddQuestionViewProps> = ({ 
  subjects = [], 
  initialSubjectId, 
  initialTopicId, 
  onBack, 
  onSave 
}) => {
  const { isDarkMode } = useApp();
  
  // Form State
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId || '');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopicId || '');
  const [selectedSubTopicId, setSelectedSubTopicId] = useState<string>('');
  
  const [questionType, setQuestionType] = useState<'multipla' | 'certo_errado' | 'flashcard'>('flashcard');
  const [difficulty, setDifficulty] = useState<'facil' | 'medio' | 'dificil'>('facil');
  const [showForge, setShowForge] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showUploadImage, setShowUploadImage] = useState(false);

  // Derived State
  const selectedSubject = useMemo(() => 
    subjects.find(s => s.id === selectedSubjectId), 
    [subjects, selectedSubjectId]
  );

  const availableTopics = useMemo(() => 
    selectedSubject?.topics || [], 
    [selectedSubject]
  );

  const selectedTopic = useMemo(() => 
    availableTopics.find(t => t.id === selectedTopicId), 
    [availableTopics, selectedTopicId]
  );

  const availableSubTopics = useMemo(() => 
    selectedTopic?.subTopics || [], 
    [selectedTopic]
  );

  // Effects to reset child selections when parent changes
  useEffect(() => {
    if (selectedSubjectId && !availableTopics.find(t => t.id === selectedTopicId)) {
      setSelectedTopicId('');
    }
  }, [selectedSubjectId, availableTopics]);

  useEffect(() => {
    if (selectedTopicId && !availableSubTopics.find(st => st.id === selectedSubTopicId)) {
      setSelectedSubTopicId('');
    }
  }, [selectedTopicId, availableSubTopics]);

  // Initialize with first available subject if none selected
  useEffect(() => {
    if (!selectedSubjectId && subjects.length > 0) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);


  const [enunciation, setEnunciation] = useState('');
  const [explanation, setExplanation] = useState('');
  const [tags, setTags] = useState('');
  const [options, setOptions] = useState<{id: string, text: string, isCorrect: boolean}[]>([
    { id: 'A', text: '', isCorrect: true },
    { id: 'B', text: '', isCorrect: false },
    { id: 'C', text: '', isCorrect: false },
    { id: 'D', text: '', isCorrect: false },
    { id: 'E', text: '', isCorrect: false },
  ]);
  const [correctAnswerMultipla, setCorrectAnswerMultipla] = useState('A');
  const [correctAnswerCertoErrado, setCorrectAnswerCertoErrado] = useState('Certo');
  const [flashcardAnswer, setFlashcardAnswer] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowForge(true);
    setTimeout(() => {
      setShowForge(false);
      onSave({ 
        subjectId: selectedSubjectId,
        topicId: selectedTopicId,
        subTopicId: selectedSubTopicId,
        questionType,
        difficulty,
        text: enunciation,
        explanation,
        tags: tags.split(',').map(t => t.trim()).filter(t => t !== ''),
        options: questionType === 'multipla' ? options : undefined,
        correctAnswerMultipla: questionType === 'multipla' ? correctAnswerMultipla : undefined,
        correctAnswerCertoErrado: questionType === 'certo_errado' ? correctAnswerCertoErrado : undefined,
        flashcardAnswer: questionType === 'flashcard' ? flashcardAnswer : undefined,
      });
    }, 2500);
  };

  if (showUploadImage) {
    return (
      <UploadImageView 
        onBack={() => setShowUploadImage(false)}
        onConfirm={(images) => {
          setShowUploadImage(false);
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 dark:bg-slate-950 md:bg-slate-900/50 md:backdrop-blur-sm flex flex-col md:items-center md:justify-center animate-in fade-in duration-300 font-display">
      
      {/* Modal Container for Desktop */}
      <div className="w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl md:rounded-2xl md:shadow-2xl bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-hidden md:border md:border-slate-200 md:dark:border-slate-800">
        
        {/* Forge Overlay */}
        {showForge && (
          <div className="absolute inset-0 z-[300] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center flex-col animate-in fade-in duration-300">
            <div className="relative w-64 h-80 animate-in zoom-in duration-500">
              <div className="absolute inset-0 z-0">
                {/* Sparks would go here */}
              </div>
              <div className="relative z-10 w-full h-full bg-white dark:bg-slate-900 rounded-2xl shadow-[0_0_40px_10px_rgba(37,99,235,0.4)] border-2 border-blue-400 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-blue-500/5"></div>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400 shadow-inner">
                  <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                <h3 className="text-slate-800 dark:text-white font-bold text-lg mb-1 relative z-10">Questão Criada</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs relative z-10">Sua questão foi adicionada com sucesso ao banco de dados.</p>
                <div className="mt-6 flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-75"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-300 animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
            <div className="mt-8 text-center animate-in slide-in-from-bottom-4 fade-in duration-500 delay-300">
              <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-lg italic">
                ITEM FORJADO!
              </h1>
              <p className="text-blue-100 text-sm font-medium mt-1 drop-shadow-md">XP +50 Adicionado</p>
            </div>
          </div>
        )}

        {/* Preview Overlay */}
        {showPreview && (
          <div className="absolute inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center flex-col p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-[340px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300">
              <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 py-3 flex justify-center items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Frente (Pergunta)
                </span>
              </div>
              <div className="p-8 min-h-[320px] flex flex-col justify-center items-center text-center">
                <div className="prose prose-slate dark:prose-invert prose-sm max-w-none text-slate-900 dark:text-white font-display">
                  <p className="mb-4 text-lg font-medium leading-snug">Determine o valor de f(x) onde:</p>
                  <div className="my-6 text-xl font-serif italic">
                    f(x) = ax² + bx + c
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Considere a, b e c constantes reais positivas.</p>
                </div>
              </div>
            </div>
            <button className="mt-6 w-14 h-14 bg-blue-600 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center text-white active:scale-90 transition-transform hover:bg-blue-700">
              <span className="material-symbols-outlined text-2xl">sync</span>
            </button>
            <button 
              onClick={() => setShowPreview(false)}
              className="mt-8 w-full max-w-[340px] bg-blue-600 text-white font-bold text-sm py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-blue-700"
            >
              FECHAR PRÉVIA
            </button>
          </div>
        )}

        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-4 py-4 shrink-0">
          <div className="max-w-md mx-auto md:max-w-none flex items-center justify-between">
            <button onClick={onBack} className="w-12 h-12 flex items-center justify-center -ml-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95">
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">close</span>
            </button>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Nova Questão</h1>
            <div className="w-10"></div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-32 md:pb-28">
          <main className="max-w-md mx-auto md:max-w-3xl px-4 py-6 space-y-5 w-full">
            <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 border border-slate-100 dark:border-slate-800">
              <h2 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-3 tracking-wider">Contexto</h2>
              <div className="space-y-3">
                
                {/* Subject Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-1">Matéria</label>
                  <select 
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none dark:text-white"
                  >
                    <option value="" disabled>Selecione uma matéria</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>

                {/* Topic Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-1">Tópico</label>
                  <select 
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    disabled={!selectedSubjectId}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="" disabled>Selecione um tópico</option>
                    {availableTopics.map(topic => (
                      <option key={topic.id} value={topic.id}>{topic.name}</option>
                    ))}
                  </select>
                </div>

                {/* SubTopic Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-1">Subtópico (Opcional)</label>
                  <select 
                    value={selectedSubTopicId}
                    onChange={(e) => setSelectedSubTopicId(e.target.value)}
                    disabled={!selectedTopicId}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Nenhum subtópico selecionado</option>
                    {availableSubTopics.map(subTopic => (
                      <option key={subTopic.id} value={subTopic.id}>{subTopic.name}</option>
                    ))}
                  </select>
                </div>

              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 border border-slate-100 dark:border-slate-800">
              <h2 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-3 tracking-wider">Metadados</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-1 truncate">Banca</label>
                  <input className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm p-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" placeholder="Ex: FGV" type="text"/>
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-1">Ano</label>
                  <input className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm p-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" placeholder="2024" type="number"/>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-1">Cargo</label>
                  <input className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm p-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" placeholder="Ex: Auditor Fiscal" type="text"/>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-1">Instituição</label>
                  <input className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm p-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" placeholder="Ex: SEFAZ-SP" type="text"/>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 border border-slate-100 dark:border-slate-800">
              <h2 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-3 tracking-wider">Formato da Questão</h2>
              <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex">
                <button 
                  onClick={() => setQuestionType('multipla')}
                  className={`flex-1 py-1.5 text-[10px] sm:text-xs font-semibold rounded-md transition-all ${questionType === 'multipla' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Múltipla Escolha
                </button>
                <button 
                  onClick={() => setQuestionType('certo_errado')}
                  className={`flex-1 py-1.5 text-[10px] sm:text-xs font-semibold rounded-md transition-all ${questionType === 'certo_errado' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Certo / Errado
                </button>
                <button 
                  onClick={() => setQuestionType('flashcard')}
                  className={`flex-1 py-1.5 text-[10px] sm:text-xs font-semibold rounded-md transition-all ${questionType === 'flashcard' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Flashcard
                </button>
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Enunciado</h2>
                <div className="flex items-center gap-1 group cursor-pointer" title="Inserir Fórmula LaTeX">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 group-hover:text-blue-600 transition-colors hidden sm:block">LaTeX</span>
                  <button className="text-slate-400 dark:text-slate-500 hover:text-blue-600 transition-colors p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                    <span className="font-serif italic font-bold text-sm tracking-wide">$ f(x) $</span>
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <input className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium p-2.5 pr-8 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" placeholder="Título da Questão (opcional)" type="text"/>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2" title="Suporte LaTeX">
                    <span className="font-serif italic font-bold text-xs text-slate-300 dark:text-slate-600">$ f(x) $</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setDifficulty('facil')} className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg border transition-colors ${difficulty === 'facil' ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' : 'border-slate-200 bg-white text-slate-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'}`}>Fácil</button>
                  <button onClick={() => setDifficulty('medio')} className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg border transition-colors ${difficulty === 'medio' ? 'border-amber-200 bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400' : 'border-slate-200 bg-white text-slate-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'}`}>Médio</button>
                  <button onClick={() => setDifficulty('dificil')} className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg border transition-colors ${difficulty === 'dificil' ? 'border-red-200 bg-red-50 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400' : 'border-slate-200 bg-white text-slate-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'}`}>Difícil</button>
                </div>
                <div className="relative">
                  <textarea 
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm p-3 focus:ring-2 focus:ring-blue-500 resize-none outline-none dark:text-white" 
                    placeholder="Digite aqui o enunciado (Frente do Card)..." 
                    rows={6}
                    value={enunciation}
                    onChange={(e) => setEnunciation(e.target.value)}
                  ></textarea>
                  <div className="absolute right-2 top-2" title="Suporte LaTeX">
                    <span className="font-serif italic font-bold text-xs text-slate-400 dark:text-slate-500">$ f(x) $</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 ml-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  <span>Dica: Use $$ para fórmulas (ex: <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-slate-500 dark:text-slate-400">$$E=mc^2$$</span>)</span>
                </p>
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Alternativas</h2>
              </div>
              <div className="space-y-3">
                {questionType === 'multipla' && (
                  <div className="space-y-3">
                    {options.map((opt, idx) => (
                      <div key={opt.id} className="flex gap-3 items-center">
                        <button className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs flex-shrink-0">{opt.id}</button>
                        <input 
                          className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500" 
                          type="text" 
                          placeholder={`Alternativa ${opt.id}`}
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
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${correctAnswerMultipla === opt.id ? 'text-[#10B981] bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-[#10B981]'}`}
                        >
                          <span className="material-symbols-outlined text-lg">{correctAnswerMultipla === opt.id ? 'check_circle' : 'radio_button_unchecked'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {questionType === 'certo_errado' && (
                  <div className="space-y-3">
                    <div className="flex gap-3 items-center">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs flex-shrink-0 flex items-center justify-center">C</div>
                      <div className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-700 dark:text-slate-200">Certo</div>
                      <button 
                        onClick={() => setCorrectAnswerCertoErrado('Certo')}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${correctAnswerCertoErrado === 'Certo' ? 'text-[#10B981] bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-[#10B981]'}`}
                      >
                        <span className="material-symbols-outlined text-lg">{correctAnswerCertoErrado === 'Certo' ? 'check_circle' : 'radio_button_unchecked'}</span>
                      </button>
                    </div>
                    <div className="flex gap-3 items-center">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs flex-shrink-0 flex items-center justify-center">E</div>
                      <div className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-700 dark:text-slate-200">Errado</div>
                      <button 
                        onClick={() => setCorrectAnswerCertoErrado('Errado')}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${correctAnswerCertoErrado === 'Errado' ? 'text-[#10B981] bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-[#10B981]'}`}
                      >
                        <span className="material-symbols-outlined text-lg">{correctAnswerCertoErrado === 'Errado' ? 'check_circle' : 'radio_button_unchecked'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {questionType === 'flashcard' && (
                  <div className="relative">
                    <div className="flex justify-between items-end mb-2">
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Verso do Flashcard (Resposta)</label>
                      <div className="flex items-center gap-1 group cursor-pointer" title="Inserir Fórmula LaTeX">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 group-hover:text-blue-600 transition-colors hidden sm:block">LaTeX</span>
                        <button className="text-slate-400 dark:text-slate-500 hover:text-blue-600 transition-colors p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                          <span className="font-serif italic font-bold text-sm tracking-wide">$ f(x) $</span>
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <textarea 
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm p-3 focus:ring-2 focus:ring-blue-500 resize-none placeholder-slate-400 dark:placeholder-slate-500 outline-none dark:text-white" 
                        placeholder="Digite a resposta correta que aparecerá no verso..." 
                        rows={4}
                        value={flashcardAnswer}
                        onChange={(e) => setFlashcardAnswer(e.target.value)}
                      ></textarea>
                      <div className="absolute right-2 top-2" title="Suporte LaTeX">
                        <span className="font-serif italic font-bold text-xs text-slate-400 dark:text-slate-500">$ f(x) $</span>
                      </div>
                    </div>
                  </div>
                )}
                <button 
                  onClick={() => setShowPreview(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all active:scale-[0.99]"
                >
                  <span className="material-symbols-outlined text-lg">sync</span>
                  <span className="text-sm font-semibold">Girar para Pré-visualizar</span>
                </button>
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 border border-slate-100 dark:border-slate-800">
              <h2 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-3 tracking-wider">Recursos Adicionais</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-1">Explicação / Resolução</label>
                  <div className="relative">
                    <textarea 
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm p-2.5 focus:ring-2 focus:ring-blue-500 resize-none outline-none dark:text-white" 
                      placeholder="Explique a resolução correta..." 
                      rows={3}
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                    ></textarea>
                    <div className="absolute right-2 top-2" title="Suporte LaTeX">
                      <span className="font-serif italic font-bold text-xs text-slate-300 dark:text-slate-600">$ f(x) $</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-1">Tags (separadas por vírgula)</label>
                  <input 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm p-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" 
                    placeholder="Ex: triângulos, reta, área" 
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => setShowUploadImage(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined">image</span>
                  <span className="text-sm font-medium">Upload de Imagem</span>
                </button>
              </div>
            </section>
          </main>

          <div className="fixed md:absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50 dark:via-slate-950 to-transparent z-40 pointer-events-none pb-8 md:bg-white md:dark:bg-slate-900 md:border-t md:border-slate-100 md:dark:border-slate-800 md:from-transparent md:via-transparent">
            <div className="max-w-md mx-auto md:max-w-3xl pointer-events-auto flex flex-col md:flex-row gap-3">
              <button 
                onClick={() => handleSubmit()}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-semibold py-3.5 rounded-lg shadow-sm active:scale-[0.98] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">add_circle</span>
                Salvar e Criar Outro
              </button>
              <button 
                onClick={() => handleSubmit()}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-blue-700"
              >
                <span className="material-symbols-outlined">save</span>
                Salvar Questão
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddQuestionView;
