
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SubjectTopicSelector from './SubjectTopicSelector';
import { useApp } from '../contexts/AppContext';

interface BattleSelectionHUDProps {
  onClose: () => void;
  onStartBattle?: (room: string, mode: string, questionLimit: number, mixSubjects: boolean, selectedSubjectIds?: string[], selectedTopicIds?: string[]) => void;
}

const BattleSelectionHUD: React.FC<BattleSelectionHUDProps> = ({ onClose, onStartBattle }) => {
  const { subjects } = useApp();
  const [selectedMode, setSelectedMode] = useState('revisao');
  const [mixSubjects, setMixSubjects] = useState(true);
  const [questionLimit, setQuestionLimit] = useState(20);
  const [selectedRoom, setSelectedRoom] = useState('sala-1');

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);

  const handleToggleSubject = (id: string) => {
    setSelectedSubjectIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleToggleTopic = (id: string) => {
    setSelectedTopicIds(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const rooms = [
    { 
      id: 'sala-1', 
      name: 'Sala Principal', 
      icon: 'stadium',
      description: 'Equilibrado',
      color: 'blue'
    },
    { 
      id: 'sala-2', 
      name: 'Arena Elite', 
      icon: 'military_tech',
      description: 'Alta Dificuldade',
      color: 'amber'
    },
    { 
      id: 'sala-3', 
      name: 'Laboratório', 
      icon: 'science',
      description: 'Experimental',
      color: 'cyan'
    }
  ];

  const modes = [
    {
      id: 'reconhecimento',
      title: 'Reconhecimento',
      description: 'Mapear novos conteúdos',
      icon: 'track_changes',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      id: 'critica',
      title: 'Crítico',
      description: 'Focar em pontos fracos',
      icon: 'report_problem',
      bgColor: 'bg-red-50',
      textColor: 'text-red-500',
    },
    {
      id: 'alerta',
      title: 'Alerta',
      description: 'Questões pendentes e urgentes',
      icon: 'notifications',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-500',
    },
    {
      id: 'revisao',
      title: 'Revisão',
      description: 'Consolidar conhecimento',
      icon: 'history',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-500',
    },
  ];

  const getRoomColor = (color: string, isSelected: boolean) => {
    if (!isSelected) return 'border-slate-50 bg-white hover:border-slate-100';
    switch (color) {
      case 'amber': return 'border-amber-500 bg-white shadow-xl shadow-amber-500/10';
      case 'cyan': return 'border-cyan-500 bg-white shadow-xl shadow-cyan-500/10';
      default: return 'border-blue-500 bg-white shadow-xl shadow-blue-500/10';
    }
  };

  const getRoomIconBg = (color: string, isSelected: boolean) => {
    if (!isSelected) return 'bg-transparent text-slate-400';
    switch (color) {
      case 'amber': return 'bg-amber-600 text-white shadow-md shadow-amber-500/40';
      case 'cyan': return 'bg-cyan-600 text-white shadow-md shadow-cyan-500/40';
      default: return 'bg-blue-600 text-white shadow-md shadow-blue-500/40';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-500/30">
              <span className="material-symbols-outlined text-2xl font-variation-fill-1">swords</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-tight text-slate-900">Seleção de Batalha</h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em]">Painel de Controle HUD</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl text-blue-600 hover:bg-white transition-all">
              <span className="material-icons-round text-xl font-bold">add</span>
            </button>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:bg-white transition-all">
              <span className="material-icons-round text-xl">close</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 no-scrollbar">
          {/* Modes Section */}
          <section className="flex flex-col gap-4">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Modos de Operação</h2>
            <div className="flex flex-col gap-3">
              {modes.map((mode) => (
                <button 
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`bg-white p-4 rounded-[2rem] border-2 transition-all flex items-center justify-between text-left group ${
                    selectedMode === mode.id 
                      ? 'border-blue-500 shadow-xl shadow-blue-500/10' 
                      : 'border-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl ${mode.bgColor} flex items-center justify-center ${mode.textColor} transition-transform group-active:scale-90`}>
                      <span className="material-icons-round text-2xl">{mode.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">{mode.title}</h3>
                      <p className="text-xs text-slate-400 font-medium">{mode.description}</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedMode === mode.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                  }`}>
                    <div className={`w-3 h-3 rounded-full bg-blue-500 transition-transform duration-300 ${
                      selectedMode === mode.id ? 'scale-100' : 'scale-0'
                    }`}></div>
                  </div>
                </button>
              ))}
            </div>

            {/* Global Sub-options for the selected mode */}
            <div className="bg-slate-50/80 rounded-[2rem] p-5 border border-slate-100 flex flex-col gap-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-bold text-slate-700">Misturar todas as matérias</span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={mixSubjects}
                    onChange={() => setMixSubjects(!mixSubjects)}
                  />
                  <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 rtl:peer-checked:after:-translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
              </label>
              <div className="h-px bg-slate-200/60"></div>
              <button 
                onClick={() => setIsSelectorOpen(true)}
                className={`flex items-center justify-between text-sm font-bold hover:translate-x-1 transition-transform p-2 rounded-xl ${
                  !mixSubjects && selectedSubjectIds.length === 0 && selectedTopicIds.length === 0
                    ? 'text-red-600 bg-red-50 border border-red-200 animate-pulse'
                    : 'text-blue-600'
                }`}
              >
                <span>Selecionar Individualmente</span>
                <div className="flex items-center gap-2">
                  {(selectedSubjectIds.length > 0 || selectedTopicIds.length > 0) && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      !mixSubjects && selectedSubjectIds.length === 0 && selectedTopicIds.length === 0
                        ? 'bg-red-100 text-red-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {selectedSubjectIds.length} Mat. / {selectedTopicIds.length} Tem.
                    </span>
                  )}
                  <span className="material-icons-round text-lg">chevron_right</span>
                </div>
              </button>
            </div>
          </section>

          {/* Rooms Section */}
          <section className="flex flex-col gap-4">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Escolher Sala</h2>
            <div className="grid grid-cols-3 gap-3">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`relative aspect-[4/5] p-1.5 rounded-[2.5rem] border-2 transition-all flex flex-col items-center justify-center group ${getRoomColor(room.color, selectedRoom === room.id)}`}
                >
                  <div className={`w-full h-full rounded-[2rem] flex flex-col items-center justify-center gap-2 transition-all ${getRoomIconBg(room.color, selectedRoom === room.id)}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedRoom !== room.id ? 'bg-slate-50' : ''}`}>
                      <span className={`material-icons-round text-3xl ${selectedRoom === room.id ? 'font-variation-fill-1' : ''}`}>{room.icon}</span>
                    </div>
                    <div className="text-center px-1 overflow-hidden w-full">
                      <span className={`text-[9px] font-black uppercase tracking-tighter block leading-tight truncate ${
                        selectedRoom === room.id ? 'text-white' : 'text-slate-400'
                      }`}>
                        {room.name}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Question Limit Section */}
          <section className="mt-2">
            <div className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Limite de Questões</span>
                <span className="text-base font-black text-blue-600">{questionLimit} questões</span>
              </div>
              <div className="relative flex items-center h-6">
                <input 
                  type="range" 
                  min="5" 
                  max="50" 
                  value={questionLimit}
                  onChange={(e) => setQuestionLimit(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              <div className="flex justify-between mt-3 px-1">
                <span className="text-[10px] text-slate-400 font-black">5</span>
                <span className="text-[10px] text-slate-400 font-black">50</span>
              </div>
            </div>
          </section>
        </main>

        {/* Footer Action */}
        <footer className="p-6 bg-white border-t border-slate-50">
          {!mixSubjects && selectedSubjectIds.length === 0 && selectedTopicIds.length === 0 && (
            <div className="mb-4 text-center">
              <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full">
                Selecione pelo menos um tema ou matéria para iniciar.
              </span>
            </div>
          )}
          <button 
            disabled={!mixSubjects && selectedSubjectIds.length === 0 && selectedTopicIds.length === 0}
            onClick={() => {
              if (onStartBattle) {
                onStartBattle(selectedRoom, selectedMode, questionLimit, mixSubjects, selectedSubjectIds, selectedTopicIds);
              }
              onClose();
            }}
            className={`w-full font-black py-5 rounded-[1.5rem] transition-all flex items-center justify-center gap-3 text-lg tracking-tight ${
              !mixSubjects && selectedSubjectIds.length === 0 && selectedTopicIds.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 text-white shadow-[0_12px_30px_rgba(37,99,235,0.3)] active:scale-[0.97] hover:bg-blue-700'
            }`}
          >
            <span className="material-symbols-outlined text-2xl font-variation-fill-1">swords</span>
            INICIAR BATALHA
          </button>
        </footer>

        {/* Subject/Topic Selector Overlay */}
        <AnimatePresence>
          {isSelectorOpen && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 z-50 bg-white"
            >
              <SubjectTopicSelector 
                onBack={() => setIsSelectorOpen(false)}
                selectedSubjectIds={selectedSubjectIds}
                selectedTopicIds={selectedTopicIds}
                onToggleSubject={handleToggleSubject}
                onToggleTopic={handleToggleTopic}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default BattleSelectionHUD;
