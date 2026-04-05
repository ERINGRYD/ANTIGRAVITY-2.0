import React, { useState, useMemo, useEffect } from 'react';
import { format, startOfDay, differenceInDays, differenceInWeeks, differenceInMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Calendar as CalendarIcon, Clock, Zap, Flag, ChevronRight, AlertCircle } from 'lucide-react';
import { WizardState } from '../../../types/wizard.types';
import { getUrgency, getIntensity, generateMilestones, deduplicateMilestones } from '../../../utils/examDateUtils';

interface StepProps {
  state: WizardState;
  updateState: (updates: Partial<WizardState>) => void;
}

const ExamDateSelection: React.FC<StepProps> = ({ state, updateState }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const today = startOfDay(new Date());

  const selectedDate = useMemo(() => {
    if (!state.deadline) return null;
    const [year, month, day] = state.deadline.split('-').map(Number);
    return new Date(year, month - 1, day);
  }, [state.deadline]);

  const urgency = useMemo(() => {
    return selectedDate ? getUrgency(selectedDate) : null;
  }, [selectedDate]);

  const daysRemaining = useMemo(() => {
    return selectedDate ? differenceInDays(startOfDay(selectedDate), today) : null;
  }, [selectedDate, today]);

  const intensity = useMemo(() => {
    return daysRemaining !== null ? getIntensity(daysRemaining) : null;
  }, [daysRemaining]);

  const intensityScore = useMemo(() => {
    if (daysRemaining === null) return 0;
    if (daysRemaining <= 3) return 1;
    if (daysRemaining >= 30) return 0;
    return 1 - ((daysRemaining - 3) / 27);
  }, [daysRemaining]);

  const intensityLabel = useMemo(() => {
    if (daysRemaining === null) return 'Nível Base';
    if (daysRemaining <= 3) return 'Nível Extremo';
    if (daysRemaining <= 15) return 'Nível Hard';
    if (daysRemaining <= 30) return 'Nível Moderado';
    return 'Nível Base';
  }, [daysRemaining]);

  const dynamicStyles = useMemo(() => {
    // Hue: 220 (Blue) -> 360/0 (Red)
    const hue = 220 + (140 * intensityScore);
    // Saturation: 70% -> 90%
    const saturation = 70 + (20 * intensityScore);
    // Lightness: 50%
    const lightness = 50;

    const shadowOpacity = 0.2 + (0.4 * intensityScore);
    
    return {
      backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
      boxShadow: `0 10px 25px -5px hsla(${hue}, ${saturation}%, ${lightness}%, ${shadowOpacity})`,
    } as React.CSSProperties;
  }, [intensityScore]);

  const hudHue = useMemo(() => {
    if (daysRemaining === null) return 220;
    if (daysRemaining >= 30) return 220; // Blue
    if (daysRemaining >= 15) return 220 - (180 * ((30 - daysRemaining) / 15)); // 220 -> 40 (Yellow)
    if (daysRemaining >= 3) return 40 - (25 * ((15 - daysRemaining) / 12)); // 40 -> 15 (Orange)
    if (daysRemaining >= 0) return 15 - (15 * ((3 - daysRemaining) / 3)); // 15 -> 0 (Red)
    return 0; // Red
  }, [daysRemaining]);

  const hudStyles = useMemo(() => {
    const lightness = daysRemaining !== null && daysRemaining <= 3 ? 20 : 15;
    const saturation = daysRemaining !== null && daysRemaining <= 3 ? 80 : 60;
    
    return {
      backgroundColor: `hsl(${hudHue}, ${saturation}%, ${lightness}%)`,
      borderColor: `hsla(${hudHue}, ${saturation}%, 50%, 0.2)`,
    } as React.CSSProperties;
  }, [hudHue, daysRemaining]);

  const milestones = useMemo(() => {
    if (!selectedDate || daysRemaining === null) return [];
    return deduplicateMilestones(generateMilestones(selectedDate));
  }, [selectedDate, daysRemaining]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      updateState({ deadline: format(date, 'yyyy-MM-dd') });
      setIsPopoverOpen(false);
    }
  };

  const getUrgencyColorClass = (label: string) => {
    const lower = label.toLowerCase();
    if (lower.includes('crítico') || lower.includes('urgente') || lower.includes('reta final')) return 'red';
    if (lower.includes('atenção') || lower.includes('moderado') || lower.includes('intenso')) return 'yellow';
    return 'emerald';
  };

  const uColorName = urgency ? getUrgencyColorClass(urgency.label) : 'blue';
  const urgencyColors = {
    red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-500', ping: 'bg-red-400', dot: 'bg-red-500' },
    yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-500', ping: 'bg-yellow-400', dot: 'bg-yellow-500' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-500', ping: 'bg-emerald-400', dot: 'bg-emerald-500' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-500', ping: 'bg-blue-400', dot: 'bg-blue-500' }
  };
  const uColor = urgencyColors[uColorName as keyof typeof urgencyColors];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Section */}
      <section className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Quando é o grande dia?</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Ajustaremos seu cronograma com base no tempo restante.</p>
      </section>

      <div className="space-y-8">
        {/* Banca Input for Custom/Faculdade Objectives */}
        {(state.objective === 'custom' || state.objective === 'faculdade') && (
          <div className="max-w-md mx-auto space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Banca Examinadora / Instituição</label>
            <div className="relative group">
              <input
                type="text"
                value={state.banca || ''}
                onChange={(e) => updateState({ banca: e.target.value })}
                placeholder="Ex: FGV, Vunesp, USP..."
                className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-base font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 transition-all outline-none shadow-sm"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <span className="material-symbols-outlined">account_balance</span>
              </div>
            </div>
          </div>
        )}

        {/* Date Picker Section */}
        <div className="relative flex justify-center max-w-md mx-auto">
          <button
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-500 transition-all shadow-sm group w-full justify-between"
          >
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <span className="text-base font-bold text-slate-800 dark:text-white">
                {selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecionar Data'}
              </span>
            </div>
            <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isPopoverOpen ? 'rotate-90' : ''}`} />
          </button>

          {isPopoverOpen && (
            <div className="absolute top-full mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl p-4 animate-in fade-in zoom-in-95 duration-200">
              <DayPicker
                mode="single"
                selected={selectedDate || undefined}
                onSelect={handleDateSelect}
                disabled={{ before: today }}
                locale={ptBR}
                className="dark:text-white"
              />
            </div>
          )}
        </div>

        {/* Results Sections */}
        {selectedDate && urgency && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: HUD & Metrics */}
            <div className="lg:col-span-5 space-y-6">
              {/* Mission Status HUD (Bento Style) */}
              <section className="grid grid-cols-2 gap-4">
              {/* New Cockpit/High-Tech Countdown Card */}
              <div 
                className="col-span-2 p-6 rounded-[2.5rem] border shadow-2xl relative overflow-hidden group transition-colors duration-1000"
                style={hudStyles}
              >
                {/* HUD Background Accents */}
                <div 
                  className="absolute inset-0 opacity-20 transition-colors duration-1000"
                  style={{ background: `linear-gradient(to bottom right, hsl(${hudHue}, 80%, 50%), transparent, hsl(${hudHue}, 80%, 40%))` }}
                ></div>
                <div 
                  className="absolute top-0 right-0 w-48 h-48 rounded-full -mr-24 -mt-24 blur-3xl animate-pulse-soft opacity-20 transition-colors duration-1000"
                  style={{ backgroundColor: `hsl(${hudHue}, 80%, 50%)` }}
                ></div>
                <div 
                  className="absolute -left-10 bottom-0 w-32 h-32 rounded-full blur-3xl opacity-20 transition-colors duration-1000"
                  style={{ backgroundColor: `hsl(${hudHue}, 80%, 50%)` }}
                ></div>
                
                <div className="relative z-10">
                  {/* Top Status Bar */}
                  <div className="flex justify-between items-center mb-6">
                    <span className={`${uColor.bg} ${uColor.border} ${uColor.text} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5`}>
                      <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${uColor.ping} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${uColor.dot}`}></span>
                      </span>
                      Status: {urgency.label}
                    </span>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Previsão</span>
                      <span className="text-sm font-mono font-bold text-white tracking-tighter">
                        {format(selectedDate, "dd.MMM.yyyy", { locale: ptBR }).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Main Telemetry */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-2">
                        <span className="text-7xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                          {daysRemaining}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-white/80 font-black text-xl leading-none">DIAS</span>
                          <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Restantes</span>
                        </div>
                      </div>
                    </div>

                    {/* Circular Progress HUD */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                        {/* Background Track */}
                        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"></circle>
                        {/* Active Progress */}
                        <circle 
                          cx="50" cy="50" r="45" fill="none" 
                          stroke="url(#hud-gradient)" 
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray="282.7" 
                          strokeDashoffset={282.7 - (282.7 * (intensity?.progress || 0)) / 100}
                          className="transition-all duration-1000"
                          style={{ filter: `drop-shadow(0 0 8px hsla(${hudHue}, 80%, 50%, 0.5))` }}
                        ></circle>
                        <defs>
                          <linearGradient id="hud-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={`hsl(${hudHue}, 80%, 50%)`}></stop>
                            <stop offset="100%" stopColor={`hsl(${hudHue}, 80%, 70%)`}></stop>
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-white font-mono font-bold text-sm">{intensity?.progress || 0}%</span>
                        <span className="text-[8px] text-white/50 font-black uppercase tracking-tighter">Focus</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Metrics */}
                  <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full transition-colors duration-1000" style={{ backgroundColor: `hsl(${hudHue}, 80%, 60%)`, boxShadow: `0 0 8px hsl(${hudHue}, 80%, 60%)` }}></div>
                      <span className="text-[10px] text-white/80 font-bold uppercase">Meta Diária: 100%</span>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-1.5 h-1.5 rounded-full transition-colors duration-1000" style={{ backgroundColor: `hsl(${hudHue}, 80%, 70%)`, boxShadow: `0 0 8px hsl(${hudHue}, 80%, 70%)` }}></div>
                      <span className="text-[10px] text-white/80 font-bold uppercase">Eficiência: Alta</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Intensity Status */}
              <div 
                className="relative p-4 rounded-2xl text-white overflow-hidden transition-all duration-500"
                style={dynamicStyles}
              >
                <style>{`
                  @keyframes pulse-intensity {
                    0%, 100% { opacity: 0; }
                    50% { opacity: ${0.1 + (0.3 * intensityScore)}; }
                  }
                `}</style>
                {intensityScore > 0 && (
                  <div 
                    className="absolute inset-0 bg-white"
                    style={{
                      opacity: 0,
                      animation: `pulse-intensity ${3 - (2.5 * intensityScore)}s infinite ease-in-out`
                    }}
                  />
                )}
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-white/90 block mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {intensityScore > 0.8 ? 'local_fire_department' : 'bolt'}
                  </span>
                  <div className="text-xs font-medium opacity-80 uppercase">Intensidade</div>
                  <div className="text-lg font-bold">{intensityLabel}</div>
                </div>
              </div>

              {/* Study Hours */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <span className="material-symbols-outlined dark:text-indigo-400 block mb-2 text-[#1978e5]">schedule</span>
                <div className="text-xs font-medium text-slate-400 uppercase">Foco Diário</div>
                <div className="text-lg font-bold">{intensity?.hours}</div>
              </div>
            </section>

            {/* IA Tip & Sync Cards */}
            <section className="grid grid-cols-1 gap-3">
              {/* IA Tip */}
              <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-slate-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/50 flex gap-4">
                <div className="shrink-0 w-10 h-10 bg-[#1978e5] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200">Dica da IA</h4>
                  <p className="text-sm text-blue-700/80 dark:text-blue-300/70 mt-0.5">
                    Com {daysRemaining} dias, sugerimos focar {intensity?.progress}% do tempo em revisão ativa e o restante em novos conteúdos.
                  </p>
                </div>
              </div>

              {/* Sync Calendar */}
              <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">sync</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Sincronizar Calendário</p>
                    <p className="text-xs text-slate-500">Google Calendar, Outlook...</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
              </button>
            </section>
            </div>

            {/* Right Column: Timeline */}
            <div className="lg:col-span-7">
            {/* Progression Map (Timeline) */}
            {milestones.length > 0 && (
              <section className="space-y-6 bg-slate-50/50 dark:bg-slate-800/20 p-6 sm:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800/50">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Mapa da Jornada</h3>
                <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800">
                  {milestones.map((milestone) => {
                    const isExamDay = milestone.id === 'dia-da-prova';
                    const isNear = milestone.daysFromNow <= 7 && !isExamDay;
                    
                    return (
                      <div key={milestone.id} className="relative">
                        {/* Dot */}
                        {isNear ? (
                          <div className="absolute -left-[29px] -top-0 w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-500 border-4 border-blue-100 dark:border-blue-900 shadow-[0_0_12px_rgba(37,99,235,0.4)]"></div>
                        ) : isExamDay ? (
                          <div className="absolute -left-[29px] -top-0 w-6 h-6 rounded-full bg-emerald-500 border-4 border-emerald-100 dark:border-emerald-900 shadow-[0_0_12px_rgba(16,185,129,0.4)]"></div>
                        ) : (
                          <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-white dark:border-slate-950"></div>
                        )}

                        {/* Content */}
                        <div className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${
                          isNear 
                            ? 'bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-800 shadow-sm ring-2 ring-blue-500/5' 
                            : 'hover:bg-white dark:hover:bg-slate-900 opacity-80 hover:opacity-100'
                        }`}>
                          <div className="flex-1">
                            <p className={`font-bold ${isNear ? 'text-blue-600 dark:text-blue-400' : isExamDay ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                              {milestone.title}
                            </p>
                            <p className="text-xs text-slate-500">
                              {format(milestone.date, "dd 'de' MMM", { locale: ptBR })} • {milestone.description}
                            </p>
                          </div>
                          <span className={`material-symbols-outlined ${isNear ? 'text-blue-600 dark:text-blue-400' : isExamDay ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} style={isNear || isExamDay ? { fontVariationSettings: "'FILL' 1" } : {}}>
                            {milestone.icon}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamDateSelection;
