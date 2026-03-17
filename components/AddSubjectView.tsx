
import React, { useState } from 'react';
import { Tab, Subject } from '../types';
import BottomNav from './BottomNav';
import { useApp } from '../contexts/AppContext';

interface AddSubjectViewProps {
  onBack: () => void;
  onSave: (subject: Subject) => void;
}

const COLORS = [
  { name: 'blue', value: '#3B82F6' },
  { name: 'green', value: '#10B981' },
  { name: 'orange', value: '#F59E0B' },
  { name: 'purple', value: '#8B5CF6' },
  { name: 'pink', value: '#EC4899' },
  { name: 'cyan', value: '#06B6D4' },
  { name: 'red', value: '#EF4444' },
  { name: 'indigo', value: '#6366F1' },
];

const AddSubjectView: React.FC<AddSubjectViewProps> = ({ onBack, onSave }) => {
  const { isDarkMode } = useApp();
  const [name, setName] = useState('');
  const [initials, setInitials] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [hours, setHours] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !initials) return;

    const newSubject: Subject = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      shortName: initials.toUpperCase(),
      color: selectedColor,
      icon: 'menu_book',
      studiedMinutes: 0,
      totalMinutes: (parseInt(hours) || 0) * 60,
      topics: []
    };

    onSave(newSubject);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-50 dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom duration-300 overflow-y-auto no-scrollbar pb-32">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto w-full">
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-icons-round">chevron_left</span>
          </button>
          <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-white">Nova Matéria</h1>
          <div className="w-10"></div> 
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-md mx-auto flex flex-col gap-6 w-full">
        <section className="bg-white dark:bg-slate-900 rounded-[1rem] shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)] p-6 border border-slate-100 dark:border-slate-800">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Nome da Matéria */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nome da Matéria</label>
              <input 
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" 
                placeholder="Ex: Biologia" 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Sigla */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sigla</label>
              <input 
                className="w-24 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold uppercase placeholder:normal-case placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" 
                max={3}
                placeholder="Ex: BIO" 
                type="text"
                value={initials}
                onChange={(e) => setInitials(e.target.value.slice(0, 3))}
                required
              />
            </div>

            {/* Cor da Matéria */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cor da Matéria</label>
              <div className="grid grid-cols-4 gap-3">
                {COLORS.map((color) => (
                  <button 
                    key={color.name}
                    className={`w-10 h-10 rounded-full transition-transform active:scale-90 ${selectedColor === color.value ? 'ring-offset-2 ring-2 ring-blue-500 scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: color.value }}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                  />
                ))}
              </div>
            </div>

            {/* Peso / Horas Semanais */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Peso no Ciclo / Horas Semanais</label>
              <div className="relative">
                <input 
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" 
                  placeholder="0" 
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Horas</div>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-4">
              <button 
                className="w-full bg-blue-500 text-white font-bold py-4 rounded-lg shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2" 
                type="submit"
              >
                <span className="material-icons-round text-xl">check_circle</span>
                Salvar Matéria
              </button>
            </div>
          </form>
        </section>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-[1rem] p-4 flex gap-3 border border-blue-100 dark:border-blue-800">
          <span className="material-icons-round text-blue-500 dark:text-blue-400">info</span>
          <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
            As matérias com maior peso aparecerão com destaque maior no seu gráfico de ciclo de estudos.
          </p>
        </div>
      </main>

      <BottomNav activeTab={Tab.CICLO} setActiveTab={() => {}} />
    </div>
  );
};

export default AddSubjectView;
