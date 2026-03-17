import React, { useState } from 'react';

interface BattleStatsViewProps {
  onBack: () => void;
}

const BattleStatsView: React.FC<BattleStatsViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'materias' | 'temas' | 'confianca' | 'erros' | 'tempo' | 'tempo_questao'>('geral');
  const [searchTerm, setSearchTerm] = useState('');

  const topics = [
    { id: 1, name: 'Crimes do Periodo Composto', subject: 'Direito Penal', questions: 85, accuracy: 62, status: 'REVISAR', color: 'amber' },
    { id: 2, name: 'Controle de Constitucionalidade', subject: 'Direito Const.', questions: 45, accuracy: 40, status: 'ALERTA', color: 'red' },
    { id: 3, name: 'Atos Administrativos', subject: 'Direito Adm.', questions: 60, accuracy: 72, status: 'REVISAR', color: 'amber' },
    { id: 4, name: 'Redes de Computadores', subject: 'Informática', questions: 30, accuracy: 90, status: 'DOMINADO', color: 'emerald' },
  ];

  const filteredTopics = topics.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col font-['Inter'] transition-colors duration-300 overflow-hidden">
      {/* Header Section */}
      <header className="bg-white dark:bg-slate-900 px-4 pt-6 pb-2 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors -ml-1"
            >
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">arrow_back</span>
            </button>
            <span className="material-symbols-outlined text-primary">analytics</span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Estatísticas</h1>
          </div>
          <button className="flex items-center gap-1 text-primary font-semibold text-sm px-3 py-1 rounded-lg hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-lg">download</span>
            Exportar
          </button>
        </div>
        {/* Period Selector */}
        <div className="flex gap-2 pb-4 overflow-x-auto no-scrollbar">
          <button className="flex items-center gap-2 bg-primary text-white px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap">
            <span className="material-symbols-outlined text-sm">calendar_today</span> 7d
          </button>
          <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap">
            <span className="material-symbols-outlined text-sm">calendar_today</span> 15d
          </button>
          <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap">
            <span className="material-symbols-outlined text-sm">calendar_today</span> 30d
          </button>
          <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap">
            <span className="material-symbols-outlined text-sm">calendar_today</span> Tudo
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        {/* Insights Row (Horizontal Scroll) - Global for all tabs as per screenshot */}
        <div className="flex gap-4 overflow-x-auto px-4 py-4 no-scrollbar">
          {activeTab === 'tempo' ? (
            <>
              <div className="flex-shrink-0 min-w-[180px] bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-blue-100/50 dark:bg-blue-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 text-4xl">schedule</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-blue-500 tracking-wider mb-1">Tempo Total</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">124h 30m</p>
              </div>
              <div className="flex-shrink-0 min-w-[180px] bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-blue-100/50 dark:bg-blue-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 text-4xl">calendar_today</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-blue-500 tracking-wider mb-1">Média Diária</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">4h 15m</p>
              </div>
              <div className="flex-shrink-0 min-w-[180px] bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-emerald-100/50 dark:bg-emerald-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600 text-4xl">trending_up</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider mb-1">Eficiência</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">88%</p>
              </div>
              <div className="flex-shrink-0 min-w-[180px] bg-orange-50 dark:bg-orange-900/10 p-4 rounded-2xl border border-orange-100 dark:border-orange-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-orange-100/50 dark:bg-orange-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-600 text-4xl">local_fire_department</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-orange-500 tracking-wider mb-1">Streak</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">12 Dias</p>
              </div>
            </>
          ) : activeTab === 'materias' ? (
            <>
              <div className="flex-shrink-0 min-w-[180px] bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-blue-100/50 dark:bg-blue-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 text-4xl">favorite</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-blue-500 tracking-wider mb-1">Matéria Favorita</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">Física</p>
              </div>
              <div className="flex-shrink-0 min-w-[180px] bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-emerald-100/50 dark:bg-emerald-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600 text-4xl">grade</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider mb-1">Melhor Desempenho</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">Matemática (92%)</p>
              </div>
              <div className="flex-shrink-0 min-w-[180px] bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-amber-100/50 dark:bg-amber-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-600 text-4xl">fitness_center</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-amber-500 tracking-wider mb-1">Maior Esforço</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">Biologia (24h)</p>
              </div>
              <div className="flex-shrink-0 min-w-[180px] bg-purple-50 dark:bg-purple-900/10 p-4 rounded-2xl border border-purple-100 dark:border-purple-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-purple-100/50 dark:bg-purple-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-purple-600 text-4xl">balance</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-purple-500 tracking-wider mb-1">Equilíbrio</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">70% das Matérias</p>
              </div>
            </>
          ) : activeTab === 'temas' ? (
            <>
              <div className="flex-shrink-0 min-w-[180px] bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-blue-100/50 dark:bg-blue-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 text-4xl">menu_book</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-blue-500 tracking-wider mb-1">Tema Mais Estudado</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">Cinemática</p>
              </div>
              <div className="flex-shrink-0 min-w-[180px] bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-emerald-100/50 dark:bg-emerald-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600 text-4xl">auto_graph</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider mb-1">Maior Evolução</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">Óptica (+15%)</p>
              </div>
              <div className="flex-shrink-0 min-w-[180px] bg-rose-50 dark:bg-rose-900/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-rose-100/50 dark:bg-rose-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-rose-600 text-4xl">priority_high</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-rose-500 tracking-wider mb-1">Tema Crítico</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">Eletrodinâmica</p>
              </div>
              <div className="flex-shrink-0 min-w-[180px] bg-purple-50 dark:bg-purple-900/10 p-4 rounded-2xl border border-purple-100 dark:border-purple-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-purple-100/50 dark:bg-purple-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-purple-600 text-4xl">verified</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-purple-500 tracking-wider mb-1">Consistência</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">85% dos Temas</p>
              </div>
            </>
          ) : activeTab === 'confianca' ? (
            <>
              <div className="flex-shrink-0 min-w-[180px] bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-blue-100/50 dark:bg-blue-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 text-4xl">shield</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-blue-500 tracking-wider mb-1">Nível de Segurança</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">Alta (78%)</p>
              </div>
              <div className="flex-shrink-0 min-w-[180px] bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-emerald-100/50 dark:bg-emerald-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600 text-4xl">sentiment_very_satisfied</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider mb-1">Zona de Conforto</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">Matemática</p>
              </div>
              <div className="flex-shrink-0 min-w-[180px] bg-rose-50 dark:bg-rose-900/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-rose-100/50 dark:bg-rose-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-rose-600 text-4xl">sentiment_very_dissatisfied</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-rose-500 tracking-wider mb-1">Zona de Risco</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">Química</p>
              </div>
              <div className="flex-shrink-0 min-w-[180px] bg-purple-50 dark:bg-purple-900/10 p-4 rounded-2xl border border-purple-100 dark:border-purple-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-purple-100/50 dark:bg-purple-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-purple-600 text-4xl">trending_up</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-purple-500 tracking-wider mb-1">Evolução</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">+5% este mês</p>
              </div>
            </>
          ) : activeTab === 'erros' ? (
            <>
              <div className="flex-shrink-0 min-w-[180px] bg-rose-50 dark:bg-rose-900/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-rose-100/50 dark:bg-rose-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-rose-600 text-4xl">error</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-rose-500 tracking-wider mb-1">Taxa de Erro</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">18%</p>
              </div>
              <div className="flex-shrink-0 min-w-[180px] bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-amber-100/50 dark:bg-amber-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-600 text-4xl">psychology_alt</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-amber-500 tracking-wider mb-1">Causa Principal</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">Falta de Atenção</p>
              </div>
              <div className="flex-shrink-0 min-w-[180px] bg-rose-50 dark:bg-rose-900/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-rose-100/50 dark:bg-rose-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-rose-600 text-4xl">repeat</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-rose-500 tracking-wider mb-1">Recorrência</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">3 Temas Críticos</p>
              </div>
              <div className="flex-shrink-0 min-w-[180px] bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-emerald-100/50 dark:bg-emerald-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600 text-4xl">health_and_safety</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider mb-1">Recuperação</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">65% dos Erros</p>
              </div>
            </>
          ) : activeTab === 'tempo_questao' ? (
            <>
              <div className="flex-shrink-0 min-w-[180px] bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-blue-100/50 dark:bg-blue-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 text-4xl">timer</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-blue-500 tracking-wider mb-1">Tempo Médio</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">45s por questão</p>
              </div>
              <div className="flex-shrink-0 min-w-[180px] bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-emerald-100/50 dark:bg-emerald-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600 text-4xl">bolt</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider mb-1">Mais Rápido</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">Mat 30s</p>
              </div>
              <div className="flex-shrink-0 min-w-[180px] bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-amber-100/50 dark:bg-amber-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-600 text-4xl">hourglass_empty</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-amber-500 tracking-wider mb-1">Mais Lento</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">Bio 75s</p>
              </div>
              <div className="flex-shrink-0 min-w-[180px] bg-rose-50 dark:bg-rose-900/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-rose-100/50 dark:bg-rose-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-rose-600 text-4xl">warning</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-rose-500 tracking-wider mb-1">Fadiga</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">Ponto: Q15</p>
              </div>
            </>
          ) : (
            <>
              {/* Metacognição */}
              <div className="flex-shrink-0 min-w-[180px] bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-blue-100/50 dark:bg-blue-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 text-4xl">psychology</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-blue-500 tracking-wider mb-1">Metacognição</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">75/100</p>
              </div>
              {/* Ponto Cego */}
              <div className="flex-shrink-0 min-w-[180px] bg-purple-50 dark:bg-purple-900/10 p-4 rounded-2xl border border-purple-100 dark:border-purple-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-purple-100/50 dark:bg-purple-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-purple-600 text-4xl">visibility_off</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-purple-500 tracking-wider mb-1">Ponto Cego</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">Óptica</p>
              </div>
              {/* Batalha Ideal */}
              <div className="flex-shrink-0 min-w-[180px] bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-blue-100/50 dark:bg-blue-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 text-4xl">schedule</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-blue-500 tracking-wider mb-1">Batalha Ideal</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">45 min</p>
              </div>
              {/* Horário de Pico */}
              <div className="flex-shrink-0 min-w-[180px] bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                <div className="w-full h-24 mb-3 rounded-xl bg-emerald-100/50 dark:bg-emerald-800/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600 text-4xl">target</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider mb-1">Horário de Pico</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">10h - 12h</p>
              </div>
            </>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="px-4 mb-4">
          <div className="flex gap-6 overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setActiveTab('geral')}
              className={`pb-3 text-sm whitespace-nowrap transition-all ${activeTab === 'geral' ? 'font-bold text-primary border-b-2 border-primary' : 'font-medium text-slate-500 dark:text-slate-400 border-b-2 border-transparent'}`}
            >
              Geral
            </button>
            <button 
              onClick={() => setActiveTab('materias')}
              className={`pb-3 text-sm whitespace-nowrap transition-all ${activeTab === 'materias' ? 'font-bold text-primary border-b-2 border-primary' : 'font-medium text-slate-500 dark:text-slate-400 border-b-2 border-transparent'}`}
            >
              Matérias
            </button>
            <button 
              onClick={() => setActiveTab('temas')}
              className={`pb-3 text-sm whitespace-nowrap transition-all ${activeTab === 'temas' ? 'font-bold text-primary border-b-2 border-primary' : 'font-medium text-slate-500 dark:text-slate-400 border-b-2 border-transparent'}`}
            >
              Temas
            </button>
            <button 
              onClick={() => setActiveTab('confianca')}
              className={`pb-3 text-sm whitespace-nowrap transition-all ${activeTab === 'confianca' ? 'font-bold text-primary border-b-2 border-primary' : 'font-medium text-slate-500 dark:text-slate-400 border-b-2 border-transparent'}`}
            >
              Confiança
            </button>
            <button 
              onClick={() => setActiveTab('erros')}
              className={`pb-3 text-sm whitespace-nowrap transition-all ${activeTab === 'erros' ? 'font-bold text-primary border-b-2 border-primary' : 'font-medium text-slate-500 dark:text-slate-400 border-b-2 border-transparent'}`}
            >
              Erros
            </button>
            <button 
              onClick={() => setActiveTab('tempo')}
              className={`pb-3 text-sm whitespace-nowrap transition-all ${activeTab === 'tempo' ? 'font-bold text-primary border-b-2 border-primary' : 'font-medium text-slate-500 dark:text-slate-400 border-b-2 border-transparent'}`}
            >
              Tempo Total
            </button>
            <button 
              onClick={() => setActiveTab('tempo_questao')}
              className={`pb-3 text-sm whitespace-nowrap transition-all ${activeTab === 'tempo_questao' ? 'font-bold text-primary border-b-2 border-primary' : 'font-medium text-slate-500 dark:text-slate-400 border-b-2 border-transparent'}`}
            >
              Tempo/Questão
            </button>
          </div>
        </div>

        {activeTab === 'geral' && (
          <>
            {/* Summary Grid */}
            <div className="grid grid-cols-2 gap-4 px-4 mb-6">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm">
                <p className="text-xs font-medium text-slate-500 mb-1">Total Questões</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">450</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm">
                <p className="text-xs font-medium text-slate-500 mb-1">Acertos</p>
                <p className="text-2xl font-bold text-emerald-500">369 <span className="text-sm font-medium text-slate-400">(82%)</span></p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm">
                <p className="text-xs font-medium text-slate-500 mb-1">Score Ponderado</p>
                <p className="text-2xl font-bold text-blue-500">78/100</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm">
                <p className="text-xs font-medium text-slate-500 mb-1">XP Total</p>
                <p className="text-2xl font-bold text-amber-500">12.450</p>
              </div>
            </div>

            {/* Weekly Evolution Chart Area */}
            <div className="px-4 mb-6">
              <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                <h4 className="text-sm font-bold mb-6 text-slate-700 dark:text-slate-200 uppercase tracking-widest">Evolução de Questões Semanal</h4>
                <div className="h-40 flex items-end justify-between gap-2 relative">
                  {/* Chart Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
                    <div className="w-full h-[1px] bg-slate-400"></div>
                    <div className="w-full h-[1px] bg-slate-400"></div>
                    <div className="w-full h-[1px] bg-slate-400"></div>
                  </div>
                  {/* Area Chart Bars */}
                  <div className="flex-1 bg-blue-500/20 rounded-t-lg relative group h-[40%] hover:bg-blue-500 transition-colors cursor-pointer">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">45 questões</div>
                  </div>
                  <div className="flex-1 bg-blue-500/20 rounded-t-lg h-[60%] hover:bg-blue-500 transition-colors cursor-pointer"></div>
                  <div className="flex-1 bg-blue-500/40 rounded-t-lg h-[55%] hover:bg-blue-500 transition-colors cursor-pointer"></div>
                  <div className="flex-1 bg-blue-500/30 rounded-t-lg h-[80%] hover:bg-blue-500 transition-colors cursor-pointer"></div>
                  <div className="flex-1 bg-blue-500/60 rounded-t-lg h-[70%] hover:bg-blue-500 transition-colors cursor-pointer"></div>
                  <div className="flex-1 bg-blue-500/80 rounded-t-lg h-[95%] hover:bg-blue-500 transition-colors cursor-pointer"></div>
                  <div className="flex-1 bg-blue-500 rounded-t-lg h-[85%] hover:bg-blue-500 transition-colors cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.3)]"></div>
                </div>
                <div className="flex justify-between mt-4 px-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Seg</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Ter</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Qua</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Qui</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Sex</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Sáb</span>
                  <span className="text-[10px] font-bold text-blue-500 uppercase">Dom</span>
                </div>
              </section>
            </div>

            {/* Room Distribution (Donut Chart representation) */}
            <div className="px-4 mb-6">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Distribuição de Salas</h3>
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 shrink-0">
                    <div className="w-full h-full rounded-full border-[10px] border-slate-100 dark:border-slate-800"></div>
                    <div className="absolute top-0 left-0 w-full h-full rounded-full border-[10px] border-blue-500 border-t-transparent border-r-transparent rotate-45"></div>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-lg font-bold">12</span>
                      <span className="text-[8px] text-slate-400 uppercase">Total</span>
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-1 gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Reconhecimento</span>
                      </div>
                      <span className="text-xs font-bold">45%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Crítica</span>
                      </div>
                      <span className="text-xs font-bold">20%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Alerta</span>
                      </div>
                      <span className="text-xs font-bold">25%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Vencidos</span>
                      </div>
                      <span className="text-xs font-bold">10%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Heatmap */}
            <div className="px-4 mb-6">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 dark:text-white">Consistência <span className="text-slate-400 font-normal">(28d)</span></h3>
                  <span className="text-xs font-bold text-emerald-500">Streak: 12 dias</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {/* Generation of small squares representing days */}
                  <div className="w-6 h-6 rounded bg-blue-500"></div>
                  <div className="w-6 h-6 rounded bg-blue-500/80"></div>
                  <div className="w-6 h-6 rounded bg-blue-500/40"></div>
                  <div className="w-6 h-6 rounded bg-blue-500"></div>
                  <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800"></div>
                  <div className="w-6 h-6 rounded bg-blue-500/60"></div>
                  <div className="w-6 h-6 rounded bg-blue-500"></div>
                  <div className="w-6 h-6 rounded bg-blue-500"></div>
                  <div className="w-6 h-6 rounded bg-blue-500/20"></div>
                  <div className="w-6 h-6 rounded bg-blue-500"></div>
                  <div className="w-6 h-6 rounded bg-blue-500"></div>
                  <div className="w-6 h-6 rounded bg-blue-500/80"></div>
                  <div className="w-6 h-6 rounded bg-blue-500/40"></div>
                  <div className="w-6 h-6 rounded bg-blue-500"></div>
                  <div className="w-6 h-6 rounded bg-blue-500"></div>
                  <div className="w-6 h-6 rounded bg-blue-500"></div>
                  <div className="w-6 h-6 rounded bg-blue-500/60"></div>
                  <div className="w-6 h-6 rounded bg-blue-500"></div>
                  <div className="w-6 h-6 rounded bg-blue-500"></div>
                  <div className="w-6 h-6 rounded bg-blue-500"></div>
                  <div className="w-6 h-6 rounded bg-blue-500/80"></div>
                  <div className="w-6 h-6 rounded bg-blue-500"></div>
                  <div className="w-6 h-6 rounded bg-blue-500/40"></div>
                  <div className="w-6 h-6 rounded bg-blue-500/20"></div>
                  <div className="w-6 h-6 rounded bg-blue-500"></div>
                  <div className="w-6 h-6 rounded bg-blue-500"></div>
                  <div className="w-6 h-6 rounded bg-blue-500/60"></div>
                  <div className="w-6 h-6 rounded bg-blue-500"></div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'materias' && (
          <div className="space-y-4 px-4">
            {/* Quick Stats Cards */}
            <section className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {/* Score Geral */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 min-w-[160px] flex-shrink-0 shadow-sm">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Score Geral</span>
                <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">78.5</div>
                <div className="flex items-center gap-1 text-emerald-500 text-xs font-semibold mt-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  +5.2%
                </div>
              </div>
              {/* Acurácia */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 min-w-[160px] flex-shrink-0 shadow-sm">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acurácia</span>
                <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">82%</div>
                <div className="flex items-center gap-1 text-emerald-500 text-xs font-semibold mt-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  +1.5%
                </div>
              </div>
              {/* Metas */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 min-w-[160px] flex-shrink-0 shadow-sm opacity-50">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Metas</span>
                <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">12/15</div>
              </div>
            </section>

            {/* Quadrant Analysis */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-slate-800 dark:text-slate-200 text-base leading-tight">Análise de Quadrantes (Tempo x Score)</h2>
                <button className="text-slate-400">
                  <span className="material-symbols-outlined">info</span>
                </button>
              </div>
              {/* Quadrant Chart Wrapper */}
              <div className="relative w-full aspect-square bg-slate-50/30 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
                {/* Prominent Divider Lines */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-[1.5px] bg-slate-300 dark:bg-slate-600"></div> {/* Horizontal Axis */}
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-full w-[1.5px] bg-slate-300 dark:bg-slate-600"></div> {/* Vertical Axis */}
                </div>
                {/* Y-Axis Label */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  SCORE (0-100)
                </div>
                {/* X-Axis Label */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                  TEMPO (MIN)
                </div>
                {/* Quadrant Labels */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 border border-yellow-200 dark:border-yellow-900/50 px-2 py-1 rounded-md text-[10px] font-bold text-yellow-600 dark:text-yellow-500 shadow-sm">
                    Talento ⭐
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900/50 px-2 py-1 rounded-md text-[10px] font-bold text-emerald-600 dark:text-emerald-500 shadow-sm">
                    Consolidado ✅
                  </span>
                </div>
                <div className="absolute bottom-10 left-4">
                  <span className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md text-[10px] font-bold text-slate-500 dark:text-slate-400 shadow-sm">
                    Negligenciado 📚
                  </span>
                </div>
                <div className="absolute bottom-10 right-4">
                  <span className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 px-2 py-1 rounded-md text-[10px] font-bold text-red-600 dark:text-red-500 shadow-sm">
                    Ineficiente ⚠️
                  </span>
                </div>
                {/* Scatter Points */}
                <div className="absolute w-3 h-3 rounded-full bg-purple-500 border-2 border-white dark:border-slate-900 top-[18%] left-[30%] shadow-sm"></div>
                <div className="absolute w-3 h-3 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 top-[22%] right-[20%] shadow-sm"></div>
                <div className="absolute w-3 h-3 rounded-full bg-orange-500 border-2 border-white dark:border-slate-900 top-[38%] right-[35%] shadow-sm"></div>
                <div className="absolute w-3 h-3 rounded-full bg-pink-500 border-2 border-white dark:border-slate-900 bottom-[25%] left-[20%] shadow-sm"></div>
                <div className="absolute w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 bottom-[35%] right-[25%] shadow-sm"></div>
              </div>
            </section>

            {/* Performance By Subject */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <h2 className="font-bold text-slate-800 dark:text-slate-200 text-base">Desempenho por Matéria</h2>
                <button className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span className="material-symbols-outlined text-sm">filter_list</span>
                  Filtrar
                </button>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                      <th className="pl-5 py-3 font-bold">Matéria</th>
                      <th className="px-2 py-3 text-center">Score Pond.</th>
                      <th className="px-2 py-3 text-center">Acurácia</th>
                      <th className="px-2 py-3 text-center">Confiança (C|D|C)</th>
                      <th className="px-2 py-3 text-center">Erro (C|I|D)</th>
                      <th className="px-2 py-3 text-center">Eficiência</th>
                      <th className="pr-5 py-3 text-right">Δ Δ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {/* Português */}
                    <tr className="group">
                      <td className="pl-5 py-4 border-l-4 border-blue-500">
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">Português</div>
                        <div className="text-[10px] text-slate-400 mt-1">Último treino: Hoje</div>
                      </td>
                      <td className="px-2 py-4 text-center font-bold text-slate-800 dark:text-slate-200 text-sm">88.2</td>
                      <td className="px-2 py-4 text-center font-medium text-slate-600 dark:text-slate-400 text-sm">91%</td>
                      <td className="px-2 py-4 text-center">
                        <div className="flex h-1.5 w-16 mx-auto rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <div className="h-full bg-emerald-500" style={{ width: '70%' }}></div>
                          <div className="h-full bg-amber-500" style={{ width: '20%' }}></div>
                          <div className="h-full bg-red-500" style={{ width: '10%' }}></div>
                        </div>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <div className="flex h-1.5 w-16 mx-auto rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <div className="h-full bg-slate-400" style={{ width: '10%' }}></div>
                          <div className="h-full bg-blue-500" style={{ width: '60%' }}></div>
                          <div className="h-full bg-yellow-500" style={{ width: '30%' }}></div>
                        </div>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">Consolidado</span>
                      </td>
                      <td className="pr-5 py-4 text-right font-bold text-emerald-500 text-xs">+4.2</td>
                    </tr>
                    {/* Direito Const. */}
                    <tr className="group">
                      <td className="pl-5 py-4 border-l-4 border-purple-500">
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">Direito Const.</div>
                        <div className="text-[10px] text-slate-400 mt-1">Último treino: Ontem</div>
                      </td>
                      <td className="px-2 py-4 text-center font-bold text-slate-800 dark:text-slate-200 text-sm">76.5</td>
                      <td className="px-2 py-4 text-center font-medium text-slate-600 dark:text-slate-400 text-sm">79%</td>
                      <td className="px-2 py-4 text-center">
                        <div className="flex h-1.5 w-16 mx-auto rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <div className="h-full bg-emerald-500" style={{ width: '50%' }}></div>
                          <div className="h-full bg-amber-500" style={{ width: '30%' }}></div>
                          <div className="h-full bg-red-500" style={{ width: '20%' }}></div>
                        </div>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <div className="flex h-1.5 w-16 mx-auto rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <div className="h-full bg-slate-400" style={{ width: '40%' }}></div>
                          <div className="h-full bg-blue-500" style={{ width: '30%' }}></div>
                          <div className="h-full bg-yellow-500" style={{ width: '30%' }}></div>
                        </div>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-0.5 rounded-md">Talento</span>
                      </td>
                      <td className="pr-5 py-4 text-right font-bold text-red-500 text-xs">-2.1</td>
                    </tr>
                    {/* Matemática */}
                    <tr className="group">
                      <td className="pl-5 py-4 border-l-4 border-orange-500">
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">Matemática</div>
                        <div className="text-[10px] text-slate-400 mt-1">Último treino: 3 dias atrás</div>
                      </td>
                      <td className="px-2 py-4 text-center font-bold text-slate-800 dark:text-slate-200 text-sm">64.0</td>
                      <td className="px-2 py-4 text-center font-medium text-slate-600 dark:text-slate-400 text-sm">68%</td>
                      <td className="px-2 py-4 text-center">
                        <div className="flex h-1.5 w-16 mx-auto rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <div className="h-full bg-emerald-500" style={{ width: '30%' }}></div>
                          <div className="h-full bg-amber-500" style={{ width: '40%' }}></div>
                          <div className="h-full bg-red-500" style={{ width: '30%' }}></div>
                        </div>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <div className="flex h-1.5 w-16 mx-auto rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <div className="h-full bg-slate-400" style={{ width: '70%' }}></div>
                          <div className="h-full bg-blue-500" style={{ width: '10%' }}></div>
                          <div className="h-full bg-yellow-500" style={{ width: '20%' }}></div>
                        </div>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-md">Ineficiente</span>
                      </td>
                      <td className="pr-5 py-4 text-right font-bold text-emerald-500 text-xs">+1.8</td>
                    </tr>
                    {/* Informática */}
                    <tr className="group">
                      <td className="pl-5 py-4 border-l-4 border-emerald-500">
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">Informática</div>
                        <div className="text-[10px] text-slate-400 mt-1">Último treino: 1 semana atrás</div>
                      </td>
                      <td className="px-2 py-4 text-center font-bold text-slate-800 dark:text-slate-200 text-sm">92.0</td>
                      <td className="px-2 py-4 text-center font-medium text-slate-600 dark:text-slate-400 text-sm">94%</td>
                      <td className="px-2 py-4 text-center">
                        <div className="flex h-1.5 w-16 mx-auto rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <div className="h-full bg-emerald-500" style={{ width: '80%' }}></div>
                          <div className="h-full bg-amber-500" style={{ width: '15%' }}></div>
                          <div className="h-full bg-red-500" style={{ width: '5%' }}></div>
                        </div>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <div className="flex h-1.5 w-16 mx-auto rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <div className="h-full bg-slate-400" style={{ width: '5%' }}></div>
                          <div className="h-full bg-blue-500" style={{ width: '80%' }}></div>
                          <div className="h-full bg-yellow-500" style={{ width: '15%' }}></div>
                        </div>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">Consolidado</span>
                      </td>
                      <td className="pr-5 py-4 text-right font-bold text-red-500 text-xs">-0.5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <button className="w-full text-center text-blue-500 font-bold text-sm hover:underline">
                  Ver todas as matérias
                </button>
              </div>
            </section>

            {/* Legend Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
              <section className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Distribuição de Erros</div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400"><b className="text-slate-700 dark:text-slate-200">C:</b> Falta de Conteúdo (Teoria)</span>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400"><b className="text-slate-700 dark:text-slate-200">I:</b> Erro de Interpretação</span>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400"><b className="text-slate-700 dark:text-slate-200">D:</b> Distração / Falta de Atenção</span>
                </div>
              </section>

              <section className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Níveis de Confiança</div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Certeza</span>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Dúvida</span>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Chute</span>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'temas' && (
          <div className="space-y-4 px-4 pb-24">
            {/* Quick Stats Topics */}
            <section className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 min-w-[160px] flex-shrink-0 shadow-sm">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Temas Estudados</span>
                <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">42</div>
                <div className="text-[10px] text-slate-400 mt-1">De um total de 156</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 min-w-[160px] flex-shrink-0 shadow-sm">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acurácia Média</span>
                <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">74%</div>
                <div className="flex items-center gap-1 text-red-500 text-xs font-semibold mt-1">
                  <span className="material-symbols-outlined text-sm">trending_down</span>
                  -2.1%
                </div>
              </div>
            </section>

            {/* Quadrant Analysis Section */}
            <section className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Análise de Quadrantes (Tempo x Score)</h3>
                <span className="material-symbols-outlined text-slate-400 cursor-help">info</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 aspect-square max-w-sm mx-auto relative p-6">
                {/* Y-axis (Score) */}
                <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800 flex flex-col justify-between py-6">
                  <span className="absolute -left-6 top-6 text-[8px] font-bold text-slate-400">100%</span>
                  <span className="absolute -left-6 bottom-6 text-[8px] font-bold text-slate-400">0%</span>
                  <div className="absolute -left-10 top-1/2 -rotate-90 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Score</div>
                </div>
                
                {/* X-axis (Tempo) */}
                <div className="absolute left-0 right-0 bottom-0 h-px bg-slate-200 dark:bg-slate-800 flex justify-between px-6">
                  <span className="absolute left-6 -bottom-4 text-[8px] font-bold text-slate-400">Rápido</span>
                  <span className="absolute right-6 -bottom-4 text-[8px] font-bold text-slate-400">Lento</span>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Tempo</div>
                </div>

                {/* Quadrants */}
                {/* Top Left: Mastered (High Score, Low Time) */}
                <div className="bg-emerald-50/30 dark:bg-emerald-900/5 rounded-tl-lg border-r border-b border-slate-100 dark:border-slate-800/50 p-2 relative flex flex-col items-center justify-center gap-1">
                  <div className="absolute top-2 left-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase flex items-center gap-1">
                    Consolidado <span className="material-symbols-outlined text-[8px]">check_circle</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1 mt-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/20"></div>
                  </div>
                </div>
                
                {/* Top Right: Slow but Sure (High Score, High Time) */}
                <div className="bg-blue-50/30 dark:bg-blue-900/5 rounded-tr-lg border-b border-slate-100 dark:border-slate-800/50 p-2 relative flex flex-col items-center justify-center gap-1">
                  <div className="absolute top-2 right-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase flex items-center gap-1">
                    Seguro <span className="material-symbols-outlined text-[8px]">verified_user</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1 mt-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/20"></div>
                  </div>
                </div>
                
                {/* Bottom Left: Fast but Wrong (Low Score, Low Time) */}
                <div className="bg-amber-50/30 dark:bg-amber-900/5 rounded-bl-lg border-r border-slate-100 dark:border-slate-800/50 p-2 relative flex flex-col items-center justify-center gap-1">
                  <div className="absolute bottom-2 left-2 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase flex items-center gap-1">
                    Em desenvolvimento <span className="material-symbols-outlined text-[8px]">star</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/20"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/20"></div>
                  </div>
                </div>
                
                {/* Bottom Right: Critical (Low Score, High Time) */}
                <div className="bg-rose-50/30 dark:bg-rose-900/5 rounded-br-lg p-2 relative flex flex-col items-center justify-center gap-1">
                  <div className="absolute bottom-2 right-2 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase flex items-center gap-1">
                    Crítico <span className="material-symbols-outlined text-[8px]">warning</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/20 animate-pulse"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Temas Dominados: 12</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Temas Críticos: 4</span>
                </div>
              </div>

              {/* Subject Legend */}
              <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">D. Penal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">D. Const.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">D. Adm.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Informática</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Português</span>
                </div>
              </div>
            </section>

            {/* Topic Performance Table */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <h2 className="font-bold text-slate-800 dark:text-slate-200 text-base">Desempenho por Tema</h2>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                  <input 
                    type="text" 
                    placeholder="Buscar tema..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border-none rounded-md text-xs focus:ring-1 focus:ring-blue-500 w-40"
                  />
                </div>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                      <th className="pl-5 py-3 font-bold">Tema</th>
                      <th className="px-2 py-3 text-center">Questões</th>
                      <th className="px-2 py-3 text-center">Acurácia</th>
                      <th className="px-2 py-3 text-center">Confiança</th>
                      <th className="px-2 py-3 text-center">Tempo</th>
                      <th className="pr-5 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredTopics.map(topic => (
                      <tr key={topic.id} className="group">
                        <td className="pl-5 py-4">
                          <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{topic.name}</div>
                          <div className="text-[10px] text-slate-400 mt-1">{topic.subject}</div>
                        </td>
                        <td className="px-2 py-4 text-center font-bold text-slate-800 dark:text-slate-200 text-sm">{topic.questions}</td>
                        <td className="px-2 py-4 text-center font-medium text-slate-600 dark:text-slate-400 text-sm">
                          <div className="flex flex-col items-center gap-1">
                            <span>{topic.accuracy}%</span>
                            <div className="w-12 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full bg-${topic.color}-500`} style={{ width: `${topic.accuracy}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-4 text-center">
                          <div className="flex h-1.5 w-16 mx-auto rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                            <div className="h-full bg-emerald-500" style={{ width: topic.id === 1 ? '70%' : topic.id === 2 ? '40%' : topic.id === 3 ? '20%' : topic.id === 4 ? '50%' : '80%' }}></div>
                            <div className="h-full bg-amber-500" style={{ width: topic.id === 1 ? '20%' : topic.id === 2 ? '40%' : topic.id === 3 ? '30%' : topic.id === 4 ? '30%' : '15%' }}></div>
                            <div className="h-full bg-red-500" style={{ width: topic.id === 1 ? '10%' : topic.id === 2 ? '20%' : topic.id === 3 ? '50%' : topic.id === 4 ? '20%' : '5%' }}></div>
                          </div>
                        </td>
                        <td className="px-2 py-4 text-center">
                          <div className="flex h-1.5 w-16 mx-auto rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                            <div className="h-full bg-blue-400" style={{ width: topic.id === 1 ? '40%' : topic.id === 2 ? '70%' : topic.id === 3 ? '30%' : '80%' }}></div>
                            <div className="h-full bg-blue-600" style={{ width: topic.id === 1 ? '40%' : topic.id === 2 ? '20%' : topic.id === 3 ? '50%' : '15%' }}></div>
                            <div className="h-full bg-amber-400" style={{ width: topic.id === 1 ? '20%' : topic.id === 2 ? '10%' : topic.id === 3 ? '20%' : '5%' }}></div>
                          </div>
                        </td>
                        <td className="pr-5 py-4 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-${topic.color}-100 text-${topic.color}-600 dark:bg-${topic.color}-900/30 dark:text-${topic.color}-400`}>{topic.status}</span>
                        </td>
                      </tr>
                    ))}
                    {filteredTopics.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">Nenhum tema encontrado</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <button className="w-full text-center text-blue-500 font-bold text-sm hover:underline">
                  Ver todos os temas
                </button>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'confianca' && (
          <div className="space-y-6 px-4 pb-8">
            {/* Matriz de Confiança */}
            <section className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6">Matriz de Confiança</h3>
              <div className="space-y-6">
                {/* Certeza */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Certeza</span>
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">67% do total</span>
                    </div>
                    <div className="flex gap-3 text-[10px] font-bold">
                      <span className="text-emerald-600">Acerto: 52%</span>
                      <span className="text-red-500">Erro: 15%</span>
                    </div>
                  </div>
                  <div className="flex h-4 w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <div className="bg-emerald-500 h-full flex items-center px-2" style={{ width: '77.6%' }}>
                      <span className="text-[9px] font-bold text-white truncate">642 Acertos</span>
                    </div>
                    <div className="bg-red-500 h-full flex items-center px-2 justify-end" style={{ width: '22.4%' }}>
                      <span className="text-[9px] font-bold text-white truncate">186 Erros</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-red-500 dark:text-red-400 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[10px]">warning</span>
                    Alerta de Excesso: 15% de erros com alta confiança
                  </p>
                </div>

                {/* Dúvida */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Dúvida</span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">18% do total</span>
                    </div>
                    <div className="flex gap-3 text-[10px] font-bold">
                      <span className="text-slate-500">Acerto: 10%</span>
                      <span className="text-slate-400">Erro: 8%</span>
                    </div>
                  </div>
                  <div className="flex h-4 w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <div className="bg-slate-400 h-full flex items-center px-2" style={{ width: '55.5%' }}>
                      <span className="text-[9px] font-bold text-white truncate">124 Acertos</span>
                    </div>
                    <div className="bg-slate-300 dark:bg-slate-600 h-full flex items-center px-2 justify-end" style={{ width: '44.5%' }}>
                      <span className="text-[9px] font-bold text-white truncate">98 Erros</span>
                    </div>
                  </div>
                </div>

                {/* Chute */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Chute</span>
                      <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">15% do total</span>
                    </div>
                    <div className="flex gap-3 text-[10px] font-bold">
                      <span className="text-amber-600">Acerto: 11%</span>
                      <span className="text-slate-400">Erro: 4%</span>
                    </div>
                  </div>
                  <div className="flex h-4 w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <div className="bg-amber-500 h-full flex items-center px-2" style={{ width: '73.3%' }}>
                      <span className="text-[9px] font-bold text-white truncate">136 Acertos</span>
                    </div>
                    <div className="bg-slate-300 dark:bg-slate-600 h-full flex items-center px-2 justify-end" style={{ width: '26.7%' }}>
                      <span className="text-[9px] font-bold text-white truncate">54 Erros</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Evolução da Calibração */}
            <section className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Evolução da Calibração</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-4">Quanto mais próximas as linhas, melhor.</p>
              <div className="relative h-40 w-full">
                <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                  {/* Certeza (Blue) */}
                  <polyline fill="none" points="0,100 60,90 120,85 180,80 240,75 300,70 400,65" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"></polyline>
                  {/* Precisão (Green) */}
                  <polyline fill="none" points="0,110 60,105 120,95 180,85 240,70 300,65 400,60" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"></polyline>
                </svg>
                <div className="flex justify-between mt-2 text-[10px] font-medium text-slate-400">
                  <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sab</span><span>Dom</span>
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1 bg-blue-500 rounded-full"></div>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">% Certeza</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1 bg-emerald-500 rounded-full"></div>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">% Precisão</span>
                </div>
              </div>
            </section>

            {/* Confiança por Matéria */}
            <section className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Confiança por Matéria</h3>
              <div className="space-y-4">
                {/* Subject 1 */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Direito Constitucional</span>
                  </div>
                  <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <div className="bg-blue-500 h-full" style={{ width: '60%' }}></div>
                    <div className="bg-slate-300 dark:bg-slate-600 h-full" style={{ width: '25%' }}></div>
                    <div className="bg-amber-400 h-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
                {/* Subject 2 */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Direito Administrativo</span>
                  </div>
                  <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <div className="bg-blue-500 h-full" style={{ width: '45%' }}></div>
                    <div className="bg-slate-300 dark:bg-slate-600 h-full" style={{ width: '40%' }}></div>
                    <div className="bg-amber-400 h-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
                {/* Subject 3 */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Direito Civil</span>
                  </div>
                  <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <div className="bg-blue-500 h-full" style={{ width: '30%' }}></div>
                    <div className="bg-slate-300 dark:bg-slate-600 h-full" style={{ width: '50%' }}></div>
                    <div className="bg-amber-400 h-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400">Certeza</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                  <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400">Dúvida</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400">Chute</span>
                </div>
              </div>
            </section>

            {/* Alertas de Padrão */}
            <section className="space-y-3">
              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                <div className="flex gap-3">
                  <span className="text-xl">🚀</span>
                  <div>
                    <p className="text-xs font-bold text-blue-900 dark:text-blue-300">Calibração Positiva</p>
                    <p className="text-[10px] text-blue-700 dark:text-blue-400 mt-0.5">Sua precisão aumentou 12% em questões marcadas com 'Certeza'.</p>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                <div className="flex gap-3">
                  <span className="text-xl">🍀</span>
                  <div>
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-300">Fator Sorte Alto</p>
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">Você acertou 25% das questões por chute em Direito Civil. Revise a base.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'erros' && (
          <div className="space-y-6 px-4 pb-24">
            {/* Actionable Insight Alert */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-xl flex gap-3">
              <span className="material-symbols-outlined text-distracao">warning</span>
              <div>
                <p className="text-sm font-bold text-orange-900 dark:text-orange-200">Insight: Fadiga Detectada</p>
                <p className="text-xs text-orange-800 dark:text-orange-300 mt-1">
                  Seus erros por <span className="font-bold">distração</span> aumentam 40% após 50min de sessão. Recomendamos pausas curtas a cada 45min.
                </p>
              </div>
            </div>

            {/* Distribution Chart Section */}
            <section className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold mb-6 text-slate-800 dark:text-slate-200">Distribuição por Categoria</h2>
              <div className="flex items-center gap-8">
                <div 
                  className="relative w-32 h-32 rounded-full flex items-center justify-center shrink-0"
                  style={{ 
                    background: 'conic-gradient(#3b82f6 0% 45%, #8b5cf6 45% 75%, #f97316 75% 100%)' 
                  }}
                >
                  <div className="absolute w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-slate-800 dark:text-slate-100">142</span>
                    <span className="text-[10px] uppercase text-slate-400">Total</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-conteudo"></span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">Conteúdo</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-interpretacao"></span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">Interpretação</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">30%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-distracao"></span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">Distração</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">25%</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Subject Weakness Map */}
            <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Mapa de Fraquezas por Matéria</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                      <th className="px-5 py-3 font-semibold">Disciplina</th>
                      <th className="px-5 py-3 font-semibold">Perfil de Erro</th>
                      <th className="px-5 py-3 font-semibold">Ação Recom.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {/* Physics */}
                    <tr>
                      <td className="px-5 py-4 text-sm font-bold text-slate-800 dark:text-slate-200">Física</td>
                      <td className="px-5 py-4">
                        <div className="w-32 h-2 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
                          <div className="bg-conteudo h-full" style={{ width: '70%' }}></div>
                          <div className="bg-interpretacao h-full" style={{ width: '20%' }}></div>
                          <div className="bg-distracao h-full" style={{ width: '10%' }}></div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[11px] px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium whitespace-nowrap">Revise a teoria</span>
                      </td>
                    </tr>
                    {/* Portuguese */}
                    <tr>
                      <td className="px-5 py-4 text-sm font-bold text-slate-800 dark:text-slate-200">Português</td>
                      <td className="px-5 py-4">
                        <div className="w-32 h-2 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
                          <div className="bg-conteudo h-full" style={{ width: '10%' }}></div>
                          <div className="bg-interpretacao h-full" style={{ width: '80%' }}></div>
                          <div className="bg-distracao h-full" style={{ width: '10%' }}></div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[11px] px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-medium whitespace-nowrap">Leitura ativa</span>
                      </td>
                    </tr>
                    {/* Math */}
                    <tr>
                      <td className="px-5 py-4 text-sm font-bold text-slate-800 dark:text-slate-200">Matemática</td>
                      <td className="px-5 py-4">
                        <div className="w-32 h-2 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
                          <div className="bg-conteudo h-full" style={{ width: '30%' }}></div>
                          <div className="bg-interpretacao h-full" style={{ width: '20%' }}></div>
                          <div className="bg-distracao h-full" style={{ width: '50%' }}></div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[11px] px-2 py-1 rounded bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 font-medium whitespace-nowrap">Foco no cálculo</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Evolution Line Chart */}
            <section className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Evolução (7 dias)</h2>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1 text-[10px] text-slate-400"><span className="w-2 h-2 rounded-full bg-conteudo"></span> Cont.</span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-400"><span className="w-2 h-2 rounded-full bg-interpretacao"></span> Int.</span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-400"><span className="w-2 h-2 rounded-full bg-distracao"></span> Distr.</span>
                </div>
              </div>
              <div className="h-40 flex items-end justify-between gap-2 px-2 relative">
                {/* Seg */}
                <div className="flex-1 flex flex-col justify-end gap-1 group">
                  <div className="w-full flex flex-col gap-0.5">
                    <div className="bg-conteudo/30 h-12 rounded-t-sm"></div>
                    <div className="bg-interpretacao/30 h-6"></div>
                    <div className="bg-distracao/30 h-4 rounded-b-sm"></div>
                  </div>
                  <span className="text-[10px] text-center text-slate-400">Seg</span>
                </div>
                {/* Ter */}
                <div className="flex-1 flex flex-col justify-end gap-1">
                  <div className="w-full flex flex-col gap-0.5">
                    <div className="bg-conteudo/30 h-8 rounded-t-sm"></div>
                    <div className="bg-interpretacao/30 h-10"></div>
                    <div className="bg-distracao/30 h-6 rounded-b-sm"></div>
                  </div>
                  <span className="text-[10px] text-center text-slate-400">Ter</span>
                </div>
                {/* Qua */}
                <div className="flex-1 flex flex-col justify-end gap-1">
                  <div className="w-full flex flex-col gap-0.5">
                    <div className="bg-conteudo/30 h-10 rounded-t-sm"></div>
                    <div className="bg-interpretacao/30 h-4"></div>
                    <div className="bg-distracao/30 h-14 rounded-b-sm"></div>
                  </div>
                  <span className="text-[10px] text-center text-slate-400">Qua</span>
                </div>
                {/* Qui */}
                <div className="flex-1 flex flex-col justify-end gap-1">
                  <div className="w-full flex flex-col gap-0.5">
                    <div className="bg-conteudo/30 h-6 rounded-t-sm"></div>
                    <div className="bg-interpretacao/30 h-12"></div>
                    <div className="bg-distracao/30 h-8 rounded-b-sm"></div>
                  </div>
                  <span className="text-[10px] text-center text-slate-400">Qui</span>
                </div>
                {/* Sex */}
                <div className="flex-1 flex flex-col justify-end gap-1">
                  <div className="w-full flex flex-col gap-0.5">
                    <div className="bg-conteudo/30 h-14 rounded-t-sm"></div>
                    <div className="bg-interpretacao/30 h-6"></div>
                    <div className="bg-distracao/30 h-4 rounded-b-sm"></div>
                  </div>
                  <span className="text-[10px] text-center text-slate-400">Sex</span>
                </div>
                {/* Sab */}
                <div className="flex-1 flex flex-col justify-end gap-1">
                  <div className="w-full flex flex-col gap-0.5">
                    <div className="bg-conteudo/30 h-10 rounded-t-sm"></div>
                    <div className="bg-interpretacao/30 h-8"></div>
                    <div className="bg-distracao/30 h-16 rounded-b-sm"></div>
                  </div>
                  <span className="text-[10px] text-center text-slate-400">Sab</span>
                </div>
                {/* Dom */}
                <div className="flex-1 flex flex-col justify-end gap-1">
                  <div className="w-full flex flex-col gap-0.5">
                    <div className="bg-conteudo/30 h-4 rounded-t-sm"></div>
                    <div className="bg-interpretacao/30 h-4"></div>
                    <div className="bg-distracao/30 h-2 rounded-b-sm"></div>
                  </div>
                  <span className="text-[10px] text-center text-slate-400">Dom</span>
                </div>
              </div>
            </section>
          </div>
        )}
        {activeTab === 'tempo' && (
          <div className="space-y-6 px-4 pb-24">
            {/* Tempo Total por Matéria */}
            <section className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold mb-4 text-slate-800 dark:text-slate-200">Tempo Total por Matéria</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Matemática</span>
                    <span className="text-slate-800 dark:text-slate-200">32h 15m</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Português</span>
                    <span className="text-slate-800 dark:text-slate-200">24h 40m</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Biologia</span>
                    <span className="text-slate-800 dark:text-slate-200">18h 20m</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '48%' }}></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600 dark:text-slate-400">História</span>
                    <span className="text-slate-800 dark:text-slate-200">15h 10m</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                    <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Física</span>
                    <span className="text-slate-800 dark:text-slate-200">12h 05m</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                    <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '32%' }}></div>
                  </div>
                </div>
              </div>
            </section>

            {/* Distribuição Semanal */}
            <section className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Carga Horária Semanal</h3>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Meta: 30h</span>
              </div>
              <div className="flex items-end justify-between h-40 gap-2 px-2">
                {[
                  { day: 'Seg', hours: 5.5, color: 'bg-primary' },
                  { day: 'Ter', hours: 4.2, color: 'bg-primary' },
                  { day: 'Qua', hours: 6.0, color: 'bg-primary' },
                  { day: 'Qui', hours: 3.5, color: 'bg-primary' },
                  { day: 'Sex', hours: 5.0, color: 'bg-primary' },
                  { day: 'Sab', hours: 2.5, color: 'bg-blue-400' },
                  { day: 'Dom', hours: 1.0, color: 'bg-slate-300' },
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className={`w-full ${item.color} rounded-t-md transition-all duration-500`} 
                      style={{ height: `${(item.hours / 6) * 100}%` }}
                    ></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{item.day}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total na Semana</span>
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-200">27.2h</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Aproveitamento</span>
                  <span className="text-lg font-bold text-emerald-500">91%</span>
                </div>
              </div>
            </section>

            {/* Metas de Estudo */}
            <section className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold mb-4 text-slate-800 dark:text-slate-200">Metas de Estudo</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center text-xs font-bold text-emerald-600">
                    85%
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Meta Semanal</p>
                    <p className="text-xs text-slate-500">27.2h de 32h planejadas</p>
                  </div>
                  <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-4 border-blue-500 flex items-center justify-center text-xs font-bold text-blue-600">
                    60%
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Revisões Pendentes</p>
                    <p className="text-xs text-slate-500">12 de 20 temas revisados</p>
                  </div>
                  <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'tempo_questao' && (
          <div className="space-y-6 px-4 pb-24">
            {/* Média de Tempo por Matéria */}
            <section className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold mb-4 text-slate-800 dark:text-slate-200">Média de Tempo por Matéria</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Matemática</span>
                    <span className="text-slate-800 dark:text-slate-200">30s</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Português</span>
                    <span className="text-slate-800 dark:text-slate-200">42s</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: '56%' }}></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Biologia</span>
                    <span className="text-slate-800 dark:text-slate-200">75s</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600 dark:text-slate-400">História</span>
                    <span className="text-slate-800 dark:text-slate-200">55s</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                    <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: '73%' }}></div>
                  </div>
                </div>
              </div>
            </section>

            {/* Curva de Fadiga */}
            <section className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Curva de Fadiga</h3>
                <span className="text-[10px] bg-rose-100 dark:bg-rose-900/30 text-rose-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Alerta de Queda</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 h-48 relative overflow-hidden">
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Tempo/Q</span>
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span> Início</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Final</span>
                    </div>
                  </div>
                  <div className="relative h-24 mt-4">
                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                      <path d="M0,10 Q25,8 50,15 T100,35" fill="none" stroke="#ec5b13" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                      <circle cx="0" cy="10" fill="#ec5b13" r="2"></circle>
                      <circle cx="100" cy="35" fill="#ec5b13" r="2"></circle>
                    </svg>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-2">
                    <span>Q1</span>
                    <span>Q10</span>
                    <span>Q20</span>
                    <span>Q30</span>
                    <span>Q45</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Você gasta em média +25% de tempo após a questão 15.</p>
            </section>

            {/* Tempo vs. Assertividade */}
            <section className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold mb-4 text-slate-800 dark:text-slate-200">Tempo vs. Assertividade</h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 h-48 flex items-end justify-around relative">
                <div className="absolute inset-0 p-4">
                  <div className="flex h-full w-full relative">
                    <div className="absolute bottom-[20%] left-[10%] w-3 h-3 rounded-full bg-emerald-500/60 ring-4 ring-emerald-500/20"></div>
                    <div className="absolute bottom-[35%] left-[25%] w-3 h-3 rounded-full bg-emerald-500/60 ring-4 ring-emerald-500/20"></div>
                    <div className="absolute bottom-[40%] left-[40%] w-3 h-3 rounded-full bg-emerald-500/60 ring-4 ring-emerald-500/20"></div>
                    <div className="absolute bottom-[10%] left-[60%] w-3 h-3 rounded-full bg-rose-500/60 ring-4 ring-rose-500/20"></div>
                    <div className="absolute bottom-[15%] left-[75%] w-3 h-3 rounded-full bg-rose-500/60 ring-4 ring-rose-500/20"></div>
                    <div className="absolute bottom-[5%] left-[85%] w-3 h-3 rounded-full bg-rose-500/60 ring-4 ring-rose-500/20"></div>
                  </div>
                </div>
                <div className="flex justify-between w-full text-[9px] text-slate-400 absolute bottom-1 px-4">
                  <span>Rápido</span>
                  <span>Tempo Gasto</span>
                  <span>Lento</span>
                </div>
                <div className="absolute left-1 top-1/2 -rotate-90 text-[9px] text-slate-400 origin-left">
                  Acertos
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Questões respondidas muito lentamente têm 65% mais chance de erro.</p>
            </section>

            {/* Tempo por Confiança */}
            <section className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold mb-4 text-slate-800 dark:text-slate-200">Tempo por Confiança</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-emerald-600 block mb-1 uppercase">Certeza</span>
                  <div className="text-xl font-bold text-slate-800 dark:text-slate-200">28s</div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-amber-500 block mb-1 uppercase">Dúvida</span>
                  <div className="text-xl font-bold text-slate-800 dark:text-slate-200">52s</div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-500 block mb-1 uppercase">Chute</span>
                  <div className="text-xl font-bold text-slate-800 dark:text-slate-200">15s</div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2">
                    <div className="bg-slate-400 h-1.5 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default BattleStatsView;
