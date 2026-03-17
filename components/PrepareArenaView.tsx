
import React, { useState } from 'react';
import { motion } from 'motion/react';

interface PrepareArenaViewProps {
  onBack: () => void;
  onStartArena: (settings: ArenaSettings) => void;
  userAvatar?: string;
}

export interface ArenaSettings {
  questionCount: number;
  pressureTimer: boolean;
  dynamicDifficulty: boolean;
}

const PrepareArenaView: React.FC<PrepareArenaViewProps> = ({ onBack, onStartArena, userAvatar }) => {
  const [questionCount, setQuestionCount] = useState(15);
  const [pressureTimer, setPressureTimer] = useState(false);
  const [dynamicDifficulty, setDynamicDifficulty] = useState(true);

  const xpPotential = 950;
  const dynamicBonus = 1.1;

  return (
    <div className="min-h-screen pb-40 antialiased bg-[#F8FAFC] text-[#0F172A] font-['Inter']">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 transition-colors"
          >
            <span className="material-icons-round text-[#0F172A]">chevron_left</span>
          </button>
          <h1 className="text-lg font-bold leading-tight flex-1 text-center">Preparar Arena</h1>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <img 
              alt="User Avatar" 
              className="w-full h-full object-cover" 
              src={userAvatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuA438U4TmMH7jdK8cocHKcNge-fk1uuGCYvwvf-pfvyLn0gigMdHEN5DCdr2j9nnUTbstJcn_wncQXKSeThGfiTY1KlPP8uPkR-zV3xvpGOBczRwCaBxfRp9WEwg5HSPnCbAGO5l7FMpru6R1kB77FgebTkEAJS_TwmPvlDV_GjndEtulJoi5gRpYXjRIH7yDLXYrLn8ATJXtGHGriVEq8dVu-aOJVbID3MdrhSlBd8H7nuRnJM6-5siYExnMVv_sZH8rRlMKQPKblk"} 
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto space-y-6">
        {/* Battle Fronts Card */}
        <div className="bg-white rounded-2xl shadow-[0_4px_6px_-1px_rgb(0_0_0/0.1),0_2px_4px_-2px_rgb(0_0_0/0.1)] p-6">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              <div className="w-12 h-12 bg-blue-50 rounded-xl border-2 border-white flex items-center justify-center text-[#3B82F6] shadow-sm">
                <span className="material-symbols-outlined filled">gavel</span>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl border-2 border-white flex items-center justify-center text-purple-600 shadow-sm">
                <span className="material-symbols-outlined filled">terminal</span>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0F172A]">2 Frentes de Combate</h2>
              <p className="text-xs text-[#64748B] font-medium">• ~438 Inimigos disponíveis</p>
            </div>
          </div>
        </div>

        {/* Battle Size Slider */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="text-xs font-extrabold text-[#64748B] uppercase tracking-wider">Tamanho da Batalha</h3>
            <span className="text-2xl font-black text-[#3B82F6]">{questionCount} <small className="text-xs uppercase font-bold text-[#94A3B8] tracking-tighter">questões</small></span>
          </div>
          <div className="px-2">
            <input 
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#3B82F6]" 
              max="20" 
              min="5" 
              step="5" 
              type="range" 
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
            />
            <div className="flex justify-between mt-3 px-1">
              <span className="text-[10px] font-bold text-[#94A3B8]">5</span>
              <span className="text-[10px] font-bold text-[#94A3B8]">10</span>
              <span className="text-[10px] font-bold text-[#94A3B8]">15</span>
              <span className="text-[10px] font-bold text-[#94A3B8]">20</span>
            </div>
          </div>
        </section>

        {/* Options Grid */}
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-[#F1F5F9] rounded-xl p-4 flex items-center justify-between border border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#94A3B8]">
                <span className="material-icons-round text-lg">timer</span>
              </div>
              <span className="text-sm font-bold text-[#64748B]">Cronômetro de Pressão</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                className="sr-only peer" 
                type="checkbox" 
                checked={pressureTimer}
                onChange={() => setPressureTimer(!pressureTimer)}
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B82F6]"></div>
            </label>
          </div>

          <div className="bg-[#F1F5F9] rounded-xl p-4 flex items-center justify-between border border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#3B82F6]">
                <span className="material-icons-round text-lg">bolt</span>
              </div>
              <span className="text-sm font-bold text-[#0F172A]">Dificuldade Dinâmica</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                className="sr-only peer" 
                type="checkbox" 
                checked={dynamicDifficulty}
                onChange={() => setDynamicDifficulty(!dynamicDifficulty)}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B82F6]"></div>
            </label>
          </div>
        </div>

        {/* XP Potential Card */}
        <div className="bg-blue-600/10 border-2 border-blue-600/30 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <span className="material-icons-round text-7xl text-[#1E40AF]">bolt</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-[#1E40AF] uppercase tracking-widest">XP Potencial:</span>
              <span className="text-lg font-black text-[#1E40AF]">+{xpPotential} XP</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Bônus Dinâmico:</span>
              <span className="text-sm font-bold text-blue-500">{dynamicBonus}x</span>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-[84px] left-0 right-0 px-4 pb-6 pt-4 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent z-40">
        <div className="max-w-md mx-auto">
          <button 
            onClick={() => onStartArena({ questionCount, pressureTimer, dynamicDifficulty })}
            className="w-full py-4 rounded-2xl text-white font-extrabold text-sm tracking-widest uppercase shadow-[0_0_15px_-3px_rgba(59,130,246,0.4)] flex items-center justify-center gap-3 active:scale-[0.98] transition-all bg-gradient-to-br from-[#3B82F6] to-[#1E40AF]"
          >
            <span>Entrar na Arena</span>
            <span className="material-symbols-outlined filled">swords</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrepareArenaView;
