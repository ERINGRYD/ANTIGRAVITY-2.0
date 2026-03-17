
import React, { useState } from 'react';
import { Subject, Tab, Topic } from '../types';
import BottomNav from './BottomNav';

interface AddBattleEnemyViewProps {
  subjects: Subject[];
  onBack: () => void;
  onSave: (subjectId: string, newTopic: Topic) => void;
}

const ENEMY_ICONS = [
  { icon: 'skull', label: 'Caveira' },
  { icon: 'pest_control_rodent', label: 'Praga' },
  { icon: 'smart_toy', label: 'Robô' },
  { icon: 'dangerous', label: 'Perigo' },
  { icon: 'rocket', label: 'Rápido' },
  { icon: 'coronavirus', label: 'Vírus' },
  { icon: 'castle', label: 'Fortaleza' },
];

const AddBattleEnemyView: React.FC<AddBattleEnemyViewProps> = ({ subjects, onBack, onSave }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [enemyName, setEnemyName] = useState('');
  const [threatLevel, setThreatLevel] = useState(3);
  const [questionsCount, setQuestionsCount] = useState('10');
  const [selectedIcon, setSelectedIcon] = useState('skull');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enemyName || !selectedSubjectId) return;

    const newTopic: Topic = {
      id: `enemy-${crypto.randomUUID()}`,
      name: enemyName,
      isCompleted: false,
      icon: selectedIcon,
      studiedMinutes: 0,
      totalMinutes: 60,
      totalQuestions: parseInt(questionsCount) || 10,
      completedQuestions: 0
    };

    onSave(selectedSubjectId, newTopic);
  };

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col animate-in slide-in-from-bottom duration-500 overflow-y-auto no-scrollbar pb-32">
      {/* Header Estilo RPG */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-red-100 px-5 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full text-red-500 hover:bg-red-50 transition-all">
              <span className="material-icons-round">close</span>
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-tight">Novo Desafio</h1>
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Invocação de Inimigo</p>
            </div>
          </div>
          <div className="bg-red-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-red-500/20">
            MODO BATALHA
          </div>
        </div>
      </header>

      <main className="px-5 py-8 max-w-xl mx-auto w-full flex flex-col gap-8">
        {/* Visualização Prévia do Inimigo */}
        <section className="flex flex-col items-center justify-center py-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/5 blur-[50px] rounded-full scale-150 animate-pulse"></div>
            <div className="relative w-32 h-32 rounded-[40px] bg-white border-2 border-red-100 shadow-xl flex items-center justify-center transform rotate-3">
              <span className="material-symbols-outlined text-6xl text-red-500 font-variation-fill-1">
                {selectedIcon}
              </span>
              <div className="absolute -top-3 -right-3 bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-black border-4 border-white">
                LVL {threatLevel}
              </div>
            </div>
          </div>
          <h2 className="mt-8 text-xl font-black text-slate-900 tracking-tight">
            {enemyName || 'Nome do Inimigo'}
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            Recompensa: +{parseInt(questionsCount) * threatLevel * 5} XP
          </p>
        </section>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Seletor de Matéria */}
          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Vincular à Matéria</label>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSubjectId(s.id)}
                  className={`flex items-center gap-3 px-5 py-4 rounded-2xl border-2 transition-all whitespace-nowrap ${
                    selectedSubjectId === s.id 
                      ? 'bg-white shadow-lg scale-105 border-red-200' 
                      : 'bg-slate-50 border-transparent text-slate-400'
                  }`}
                  style={selectedSubjectId === s.id ? { borderColor: s.color } : {}}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: s.color }}>
                    <span className="material-icons-round text-lg">{s.icon}</span>
                  </div>
                  <span className={`text-sm font-bold ${selectedSubjectId === s.id ? 'text-slate-900' : 'text-slate-400'}`}>{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Nome e Tropas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nome do Tópico</label>
              <input 
                value={enemyName}
                onChange={(e) => setEnemyName(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-red-500 rounded-2xl px-5 py-4 focus:ring-0 transition-all text-slate-900 font-bold outline-none shadow-sm"
                placeholder="Ex: Revolução Francesa"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Qtd. de Questões</label>
              <div className="relative">
                <input 
                  value={questionsCount}
                  onChange={(e) => setQuestionsCount(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-red-500 rounded-2xl px-5 py-4 focus:ring-0 transition-all text-slate-900 font-bold outline-none shadow-sm"
                  type="number"
                  placeholder="10"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Tropas</span>
              </div>
            </div>
          </div>

          {/* Nível de Ameaça */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nível de Ameaça</label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setThreatLevel(lvl)}
                  className={`py-3 rounded-xl font-black text-xs transition-all border-2 ${
                    threatLevel === lvl 
                      ? 'bg-red-600 border-red-700 text-white shadow-lg scale-105' 
                      : 'bg-white border-slate-100 text-slate-400 hover:border-red-200'
                  }`}
                >
                  LVL {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Ícones de Avatar */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Avatar do Desafio</label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
              {ENEMY_ICONS.map(item => (
                <button
                  key={item.icon}
                  type="button"
                  onClick={() => setSelectedIcon(item.icon)}
                  className={`aspect-square rounded-2xl flex items-center justify-center transition-all border-2 ${
                    selectedIcon === item.icon 
                      ? 'bg-red-50 border-red-500 text-red-600 shadow-md' 
                      : 'bg-white border-slate-100 text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl font-variation-fill-1">{item.icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Botão de Finalização */}
          <div className="pt-6">
            <button 
              type="submit"
              className="w-full bg-red-600 text-white py-5 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-red-500/40 hover:bg-red-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined text-[24px]">swords</span>
              Lançar Desafio no Ciclo
            </button>
          </div>
        </form>
      </main>

      <BottomNav activeTab={Tab.BATALHA} setActiveTab={() => {}} />
    </div>
  );
};

export default AddBattleEnemyView;
