
import React, { useState, useEffect } from 'react';
import { Subject, Question } from '../types';

interface BattleRecord {
  bestAccuracy: number;
  bestXp: number;
  totalBattles: number;
  lastPlayed: string;
}

interface ColiseumViewProps {
  subjects: Subject[];
  questions: Question[];
  onStartBattle: (room: string, mode: string, questionLimit: number, mixSubjects: boolean, selectedSubjectIds?: string[], selectedTopicIds?: string[], sessionTimeLimit?: number, distributionMode?: string) => void;
}

const ColiseumView: React.FC<ColiseumViewProps> = ({ subjects, questions, onStartBattle }) => {
  const [selectedMode, setSelectedMode] = useState('escaramuca');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [questionLimit, setQuestionLimit] = useState(20);
  const [mixSubjects, setMixSubjects] = useState(true);
  const [distributionMode, setDistributionMode] = useState<'aleatorio' | 'proporcional_igual' | 'proporcional_prova' | 'automatico_ia'>('aleatorio');
  const [records, setRecords] = useState<Record<string, BattleRecord>>({});

  useEffect(() => {
    const savedRecords = localStorage.getItem('coliseum_records');
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
  }, []);

  const handleToggleSubject = (id: string) => {
    if (id === 'all') {
      setMixSubjects(true);
      setSelectedSubjectIds([]);
      return;
    }
    setMixSubjects(false);
    setSelectedSubjectIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleStart = () => {
    let room = 'sala-1';
    let mode = 'todas';
    let sessionTimeLimit = 0;

    switch (selectedMode) {
      case 'escaramuca':
        mode = 'reconhecimento';
        sessionTimeLimit = 300; // 5m
        break;
      case 'combate-rapido':
        mode = 'todas';
        sessionTimeLimit = 900; // 15m
        break;
      case 'revisao':
        mode = 'revisao';
        break;
      case 'guerra-total':
        mode = 'todas';
        room = 'sala-2'; // Arena Elite
        sessionTimeLimit = 3600; // 60m
        break;
      case 'resgate':
        mode = 'critica';
        break;
      default:
        mode = 'todas';
    }

    onStartBattle(
      room,
      mode,
      questionLimit,
      mixSubjects,
      selectedSubjectIds.length > 0 ? selectedSubjectIds : undefined,
      undefined,
      sessionTimeLimit,
      distributionMode
    );
  };

  const modes = [
    {
      id: 'escaramuca',
      internalMode: 'reconhecimento',
      title: "Escaramuça",
      desc: "Combate rápido para aquecimento mental.",
      time: "5m",
      xp: "50 XP",
      icon: "sprint",
      bgIcon: "timer",
      gradient: "from-emerald-500 to-teal-700",
      shadow: "shadow-emerald-500/20"
    },
    {
      id: 'combate-rapido',
      internalMode: 'todas',
      title: "Combate Rápido",
      desc: "Enfrente questões variadas sem perder tempo.",
      time: "15m",
      xp: "150 XP",
      icon: "swords",
      bgIcon: "flash_on",
      gradient: "from-blue-500 to-indigo-700",
      shadow: "shadow-blue-500/20",
      border: true
    },
    {
      id: 'revisao',
      internalMode: 'revisao',
      title: "Revisão Flashcards",
      desc: "Treine a memória com repetição espaçada.",
      time: "Variável",
      xp: "+XP",
      icon: "layers",
      bgIcon: "style",
      gradient: "from-cyan-500 to-sky-600",
      shadow: "shadow-cyan-500/20"
    },
    {
      id: 'guerra-total',
      internalMode: 'todas',
      title: "Guerra Total",
      desc: "Simulado completo. Sobreviva se puder.",
      time: "60m",
      xp: "500 XP",
      icon: "local_fire_department",
      bgIcon: "skull",
      gradient: "from-slate-700 to-slate-900",
      shadow: "shadow-slate-900/20"
    },
    {
      id: 'resgate',
      internalMode: 'critica',
      title: "Operação Resgate",
      desc: "Revisite seus erros e conquiste o aprendizado.",
      time: "Erros",
      xp: "2x XP",
      icon: "history_edu",
      bgIcon: "replay",
      gradient: "from-violet-600 to-purple-700",
      shadow: "shadow-violet-500/20"
    }
  ];

  return (
    <main className="px-6 py-8 flex flex-col gap-8 animate-in fade-in duration-500 pb-32 max-w-7xl mx-auto w-full">
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Modos de Batalha
          </h2>
          <span className="text-xs text-slate-500 font-medium">Deslize →</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x -mx-6 px-6">
          {modes.map(mode => (
            <BattleModeCard 
              key={mode.id}
              {...mode}
              record={records[mode.internalMode]}
              isSelected={selectedMode === mode.id}
              onClick={() => setSelectedMode(mode.id)}
            />
          ))}
        </div>
      </section>

      {/* Records Panel */}
      <section>
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500 font-variation-fill">workspace_premium</span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Recordes de Batalha</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Melhor Acurácia</p>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-black text-slate-800 dark:text-white">
                  {Object.values(records).length > 0 
                    ? Math.max(...Object.values(records).map(r => r.bestAccuracy)) 
                    : 0}%
                </span>
                <span className="text-[10px] font-bold text-emerald-500 mb-1">RECORDE</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Maior XP</p>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-black text-slate-800 dark:text-white">
                  {Object.values(records).length > 0 
                    ? Math.max(...Object.values(records).map(r => r.bestXp)) 
                    : 0}
                </span>
                <span className="text-[10px] font-bold text-amber-500 mb-1">XP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex-1">
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-slate-400">tune</span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Configurações de Combate</h2>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Selecione o Inimigo (Matéria)</label>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 -mx-6 px-6">
              <button 
                onClick={() => handleToggleSubject('all')}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors border ${
                  mixSubjects 
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-lg">apps</span>
                Todas
              </button>
              {subjects.map(subject => (
                <SubjectButton 
                  key={subject.id}
                  label={subject.name} 
                  isSelected={selectedSubjectIds.includes(subject.id)}
                  onClick={() => handleToggleSubject(subject.id)}
                />
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Distribuição das Questões</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DistributionButton id="aleatorio" label="Aleatório" icon="shuffle" desc="Sorteio padrão de questões" isSelected={distributionMode === 'aleatorio'} onClick={() => setDistributionMode('aleatorio')} />
              <DistributionButton id="proporcional_igual" label="Equilibrado" icon="balance" desc="Mesma quant. por matéria" isSelected={distributionMode === 'proporcional_igual'} onClick={() => setDistributionMode('proporcional_igual')} />
              <DistributionButton id="proporcional_prova" label="Estilo Prova" icon="assignment" desc="Peso baseado no edital" isSelected={distributionMode === 'proporcional_prova'} onClick={() => setDistributionMode('proporcional_prova')} />
              <DistributionButton id="automatico_ia" label="Foco Inteligente" icon="psychology" desc="Foca nas suas fraquezas" isSelected={distributionMode === 'automatico_ia'} onClick={() => setDistributionMode('automatico_ia')} />
            </div>
            {distributionMode === 'proporcional_prova' && (
              <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-800/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <span className="material-icons text-sm">balance</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Usando pesos do seu Edital</h4>
                  <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">
                    A distribuição seguirá os pesos configurados no seu perfil global. Se não houver configuração, as questões serão divididas igualmente.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Intensidade</label>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">{questionLimit} Questões</span>
            </div>
            <div className="relative h-6 flex items-center">
              <input 
                className="custom-range relative z-10 w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                max="50" 
                min="5" 
                step="5" 
                type="range" 
                value={questionLimit}
                onChange={(e) => setQuestionLimit(parseInt(e.target.value))}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1 px-1">
              <span>5</span>
              <span>50</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-dashed border-slate-200 dark:border-slate-700 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400">
              <span className="material-symbols-outlined">visibility</span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Estimativa de Missão</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                ~{questionLimit} min • Dificuldade Média
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Action Button */}
      <div className="fixed bottom-28 left-0 right-0 px-6 z-10 md:static md:mt-2 md:px-0">
        {questions.length === 0 && (
          <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-500">warning</span>
            <p className="text-xs font-bold text-amber-800 dark:text-amber-200">
              Você não possui questões cadastradas. Adicione questões no Banco de Questões para iniciar um combate.
            </p>
          </div>
        )}
        <button 
          onClick={handleStart}
          disabled={(!mixSubjects && selectedSubjectIds.length === 0) || questions.length === 0}
          className={`w-full font-black text-lg py-4 rounded-2xl shadow-xl transform active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 ${
            (!mixSubjects && selectedSubjectIds.length === 0) || questions.length === 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/20'
          }`}
        >
          <span className="material-symbols-outlined text-3xl animate-pulse">swords</span>
          INICIAR COMBATE ÉPICO!
        </button>
      </div>
    </main>
  );
};

const BattleModeCard: React.FC<{
  title: string;
  desc: string;
  time: string;
  xp: string;
  icon: string;
  bgIcon: string;
  gradient: string;
  shadow: string;
  border?: boolean;
  isSelected: boolean;
  record?: BattleRecord;
  onClick: () => void;
}> = ({ title, desc, time, xp, icon, bgIcon, gradient, shadow, border, isSelected, record, onClick }) => (
  <button 
    onClick={onClick}
    className={`snap-center shrink-0 w-64 p-4 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg ${shadow} relative overflow-hidden group hover:scale-[1.02] transition-transform ${border || isSelected ? 'ring-4 ring-white/40' : ''} ${isSelected ? 'scale-[1.02]' : 'opacity-80 hover:opacity-100'}`}
  >
    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity">
      <span className="material-symbols-outlined text-6xl">{bgIcon}</span>
    </div>
    
    {record && record.bestAccuracy > 0 && (
      <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
        <span className="material-symbols-outlined text-[10px] filled text-amber-300">workspace_premium</span>
        <span className="text-[9px] font-black">{record.bestAccuracy}%</span>
      </div>
    )}

    <div className="relative z-10 flex flex-col h-full items-start text-left">
      <div className="bg-white/20 p-2 rounded-lg mb-3 backdrop-blur-sm">
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>
      <h3 className="font-bold text-lg leading-tight">{title}</h3>
      <p className="text-white/80 text-xs mt-1 mb-4">{desc}</p>
      <div className="mt-auto flex gap-3 text-xs font-medium">
        <span className="bg-black/20 px-2 py-1 rounded flex items-center gap-1">
          <span className="material-symbols-outlined text-[10px]">schedule</span> {time}
        </span>
        <span className="bg-black/20 px-2 py-1 rounded flex items-center gap-1">
          <span className="material-symbols-outlined text-[10px] filled">star</span> {xp}
        </span>
      </div>
    </div>
  </button>
);

const SubjectButton: React.FC<{ label: string; isSelected: boolean; onClick: () => void }> = ({ label, isSelected, onClick }) => (
  <button 
    onClick={onClick}
    className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
      isSelected
        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
        : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`}
  >
    {label}
  </button>
);

const DistributionButton: React.FC<{ id: string; label: string; icon: string; desc: string; isSelected: boolean; onClick: () => void }> = ({ label, icon, desc, isSelected, onClick }) => (
  <button 
    onClick={onClick}
    className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col gap-1 ${
      isSelected
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
        : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700'
    }`}
  >
    <div className="flex items-center gap-2">
      <span className={`material-symbols-outlined text-lg ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>{icon}</span>
      <span className={`text-sm font-bold ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>{label}</span>
    </div>
    <span className={`text-[10px] font-medium ${isSelected ? 'text-blue-600/70 dark:text-blue-400/70' : 'text-slate-400'}`}>{desc}</span>
  </button>
);

export default ColiseumView;
