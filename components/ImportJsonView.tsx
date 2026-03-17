import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Question, Subject } from '../types';

interface ImportJsonViewProps {
  onBack: () => void;
  subjects: Subject[];
}

const ImportJsonView: React.FC<ImportJsonViewProps> = ({ onBack, subjects }) => {
  const { setQuestions } = useApp();
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');

  const selectedSubject = useMemo(() => 
    subjects.find(s => s.id === selectedSubjectId), 
    [subjects, selectedSubjectId]
  );

  const availableTopics = useMemo(() => 
    selectedSubject?.topics || [], 
    [selectedSubject]
  );

  const exampleJson = `[
  {
    "id": "q-123",
    "code": "Q-12345",
    "difficulty": "MÉDIO",
    "views": "0",
    "text": "Qual é a capital do Brasil?",
    "status": "Ativa",
    "questionType": "multipla",
    "correctAnswerMultipla": "A",
    "options": [
      { "id": "A", "text": "Brasília", "isCorrect": true },
      { "id": "B", "text": "Rio de Janeiro", "isCorrect": false },
      { "id": "C", "text": "São Paulo", "isCorrect": false },
      { "id": "D", "text": "Salvador", "isCorrect": false }
    ],
    "explanation": "Brasília foi inaugurada em 1960, tornando-se a capital do Brasil."
  }
]`;

  const handleImport = () => {
    if (!selectedSubjectId || !selectedTopicId) {
      setError("Por favor, selecione uma matéria e um tópico para vincular as questões.");
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        throw new Error("O JSON deve ser um array de questões.");
      }
      
      // Basic validation
      const validQuestions = parsed.filter(q => q.id && q.text);
      if (validQuestions.length === 0) {
        throw new Error("Nenhuma questão válida encontrada no JSON.");
      }

      const questionsWithContext = validQuestions.map(q => ({
        ...q,
        id: `q-${crypto.randomUUID()}`,
        subject: selectedSubjectId,
        topic: selectedTopicId
      }));

      setQuestions(prev => [...prev, ...questionsWithContext]);
      setSuccess(`${validQuestions.length} questões importadas com sucesso!`);
      setError(null);
      setJsonInput('');
      
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (err: any) {
      setError(`Erro ao importar: ${err.message}`);
      setSuccess(null);
    }
  };

  const handleDownloadExample = () => {
    const blob = new Blob([exampleJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exemplo_questoes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-right duration-300 min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Importar Questões JSON</h1>
          </div>
        </div>
      </header>

      <main className="flex-grow px-4 py-6 max-w-3xl mx-auto w-full space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-1">Matéria</label>
              <select 
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  setSelectedTopicId('');
                }}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none dark:text-white"
              >
                <option value="" disabled>Selecione uma matéria</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-1">Tópico</label>
              <select 
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                disabled={!selectedSubjectId}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" disabled>Selecione um tópico</option>
                {availableTopics.map(topic => (
                  <option key={topic.id} value={topic.id}>{topic.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 mb-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Cole o JSON das questões</h2>
            <button 
              onClick={handleDownloadExample}
              className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Baixar Exemplo
            </button>
          </div>
          
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Cole seu array JSON aqui..."
            className="w-full h-64 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none dark:text-white resize-none"
          />

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <p>{success}</p>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleImport}
              disabled={!jsonInput.trim()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">upload</span>
              Importar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ImportJsonView;
