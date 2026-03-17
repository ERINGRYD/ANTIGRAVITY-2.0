
import React, { useState } from 'react';
import { Subject } from '../types';

interface AddTopicViewProps {
  subject: Subject;
  onBack: () => void;
  onSave: (name: string, totalMinutes: number, icon: string) => void;
}

const AddTopicView: React.FC<AddTopicViewProps> = ({ subject, onBack, onSave }) => {
  const [name, setName] = useState('');
  const [totalMinutes, setTotalMinutes] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('shapes');
  const [difficulty, setDifficulty] = useState<'facil' | 'medio' | 'dificil'>('facil');

  const icons = ['shapes', 'calculate', 'change_history', 'casino', 'grid_on'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name, parseInt(totalMinutes) || 0, selectedIcon);
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom duration-300 min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col w-full transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-4 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex items-center gap-4 w-full">
          <button 
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center -ml-3 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold leading-tight text-slate-900 dark:text-white">Novo Tópico</h1>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: subject.color }}>{subject.name}</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6 w-full pb-32">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 transition-colors duration-300">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Topic Name */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nome do Tópico</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent rounded-2xl px-5 py-4 focus:ring-0 transition-all text-slate-900 dark:text-white font-semibold placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none" 
                style={{ '--tw-focus-border-color': subject.color } as any}
                onFocus={(e) => (e.currentTarget.style.borderColor = subject.color)}
                onBlur={(e) => (e.currentTarget.style.borderColor = '')}
                placeholder="Ex: Geometria Espacial" 
                type="text"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Difficulty */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Dificuldade</label>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setDifficulty('facil')}
                    className={`flex-1 py-3 px-2 rounded-xl border-2 font-bold text-[10px] uppercase tracking-wider transition-all ${
                      difficulty === 'facil' 
                      ? 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' 
                      : 'border-transparent bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    Fácil
                  </button>
                  <button 
                    type="button"
                    onClick={() => setDifficulty('medio')}
                    className={`flex-1 py-3 px-2 rounded-xl border-2 font-bold text-[10px] uppercase tracking-wider transition-all ${
                      difficulty === 'medio' 
                      ? 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-500/10' 
                      : 'border-transparent bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    Médio
                  </button>
                  <button 
                    type="button"
                    onClick={() => setDifficulty('dificil')}
                    className={`flex-1 py-3 px-2 rounded-xl border-2 font-bold text-[10px] uppercase tracking-wider transition-all ${
                      difficulty === 'dificil' 
                      ? 'border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-500/10' 
                      : 'border-transparent bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    Difícil
                  </button>
                </div>
              </div>

              {/* Time Goal */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Meta de Estudo</label>
                <div className="relative">
                  <input 
                    value={totalMinutes}
                    onChange={(e) => setTotalMinutes(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent rounded-2xl px-5 py-4 focus:ring-0 transition-all text-slate-900 dark:text-white font-semibold outline-none" 
                    style={{ '--tw-focus-border-color': subject.color } as any}
                    onFocus={(e) => (e.currentTarget.style.borderColor = subject.color)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '')}
                    placeholder="0" 
                    type="number"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-tighter">MIN</span>
                </div>
              </div>
            </div>

            {/* Icon Selector */}
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Ícone Representativo</label>
              <div className="flex justify-between md:justify-start md:gap-4 overflow-x-auto pb-2 no-scrollbar">
                {icons.map(icon => (
                  <button 
                    key={icon}
                    onClick={() => setSelectedIcon(icon)}
                    type="button"
                    className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-all ${
                      selectedIcon === icon 
                      ? 'text-white shadow-xl' 
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    style={selectedIcon === icon ? { backgroundColor: subject.color, boxShadow: `0 12px 24px ${subject.color}4D` } : {}}
                  >
                    <span className={`material-symbols-outlined text-2xl ${selectedIcon === icon ? 'filled-icon' : ''}`}>{icon}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button 
                type="submit"
                className="w-full text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-[0.98] hover:brightness-110"
                style={{ 
                  backgroundColor: subject.color,
                  boxShadow: `0 12px 24px ${subject.color}66`
                }}
              >
                Criar Novo Tópico
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div 
          className="flex items-start gap-4 p-5 rounded-3xl border backdrop-blur-sm"
          style={{ backgroundColor: `${subject.color}10`, borderColor: `${subject.color}20` }}
        >
          <div 
            className="p-2 rounded-xl text-white"
            style={{ backgroundColor: subject.color }}
          >
            <span className="material-symbols-outlined text-xl">info</span>
          </div>
          <p className="text-xs font-semibold leading-relaxed" style={{ color: subject.color }}>
            Tópicos bem divididos aumentam sua retenção em até 40%. Foque em tópicos específicos para dominar a matéria.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AddTopicView;
