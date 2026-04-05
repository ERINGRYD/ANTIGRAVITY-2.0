
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Subject, Topic } from '../types';
import { getArchivedEnemies, ArchivedEnemy, calculateBarValue, shouldEnemyReturn } from '../utils/ebbinghaus';

interface FrontLineViewProps {
  subject: Subject;
  onBack: () => void;
  onDefender: (topic: Topic) => void;
}

interface TriagemItem {
  id: string;
  subject: string;
  topic: string;
  description: string;
  xp: number;
  icon: string;
  color: string;
}

type SortOption = 'relevancia' | 'xp_desc' | 'xp_asc' | 'nome';

/* Subcomponents for FrontLineView */

const TriagemCard: React.FC<{ item: TriagemItem; onStart: () => void }> = ({ item, onStart }) => (
  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg`} style={{ backgroundColor: item.color }}>
      <span className="material-symbols-outlined">{item.icon}</span>
    </div>
    <h3 className="font-bold text-slate-900 mb-1">{item.topic}</h3>
    <p className="text-xs text-slate-500 mb-4 line-clamp-2">{item.description}</p>
    <div className="flex items-center justify-between mt-auto">
      <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">+{item.xp} XP</span>
      <button onClick={onStart} className="text-blue-500 hover:text-blue-600 transition-colors">
        <span className="material-symbols-outlined">play_circle</span>
      </button>
    </div>
  </div>
);

const VencidosCard: React.FC<{ item: ArchivedEnemy; onRevise: () => void }> = ({ item, onRevise }) => {
  const now = new Date();
  const daysSince = (now.getTime() - new Date(item.lastVictoryDate).getTime()) / (1000 * 60 * 60 * 24);
  const barValue = calculateBarValue(daysSince, item.memoryStability, item);
  const isReturning = barValue === 100 || shouldEnemyReturn(item);

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl p-4 border shadow-sm hover:shadow-md transition-all flex items-center gap-4 ${isReturning ? 'border-purple-500/50 shadow-purple-500/20' : 'border-slate-100 dark:border-slate-700'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${isReturning ? 'bg-purple-500' : 'bg-emerald-500'}`}>
        <span className="material-symbols-outlined text-xl">{isReturning ? 'warning' : 'emoji_events'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{item.topicName}</h3>
        <div className="mt-1">
          <div className="flex justify-between items-center mb-1">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              {isReturning ? 'Retornando!' : 'Força de retorno'}
            </p>
            <span className={`text-[9px] font-black ${isReturning ? 'text-purple-500' : 'text-emerald-500'}`}>{barValue}%</span>
          </div>
          <div className="w-full h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${isReturning ? 'bg-purple-500' : 'bg-emerald-500'} rounded-full transition-all duration-500`}
              style={{ width: `${barValue}%` }}
            ></div>
          </div>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[10px] font-black text-emerald-500 mb-1">+{item.lastVictoryXP} XP</p>
        <button onClick={onRevise} className="text-slate-300 hover:text-blue-500 transition-colors">
          <span className="material-symbols-outlined text-lg">history</span>
        </button>
      </div>
    </div>
  );
};

const EnemyCard: React.FC<{
  subject: string;
  topic: string;
  level: number;
  questions: number;
  accuracy: string;
  xp: number;
  force: number;
  onDefender: () => void;
}> = ({ subject, topic, level, questions, accuracy, xp, force, onDefender }) => (
  <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-1">
        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{subject}</span>
        <h3 className="text-lg font-black text-slate-900 leading-tight">{topic}</h3>
      </div>
      <div className="bg-red-50 text-red-500 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-red-100">
        LVL {level}
      </div>
    </div>

    <div className="mb-6">
      <div className="flex justify-between items-end mb-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Força do Inimigo</span>
        <span className="text-xs font-black text-red-500">{force}%</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-red-500 rounded-full transition-all duration-500"
          style={{ width: `${force}%` }}
        ></div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-slate-50 p-3 rounded-2xl">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Questões</p>
        <p className="text-sm font-bold text-slate-900">{questions}</p>
      </div>
      <div className="bg-slate-50 p-3 rounded-2xl">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Precisão</p>
        <p className="text-sm font-bold text-slate-900">{accuracy}</p>
      </div>
    </div>
    <button 
      onClick={onDefender}
      className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-500/20 group-hover:bg-red-600 transition-all flex items-center justify-center gap-2"
    >
      <span className="material-symbols-outlined text-lg">swords</span>
      Defender Linha (+{xp} XP)
    </button>
  </div>
);

const EmptySearchState = () => (
  <div className="py-20 flex flex-col items-center text-center">
    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
      <span className="material-symbols-outlined text-slate-300 text-4xl">search_off</span>
    </div>
    <h3 className="text-lg font-bold text-slate-900">Nenhum resultado encontrado</h3>
    <p className="text-slate-500 text-sm max-w-xs mx-auto">Tente ajustar sua busca ou mudar os filtros para encontrar o que procura.</p>
  </div>
);

const StatSmallBadge: React.FC<{ icon: string; value: string; color: string; isMiddle?: boolean }> = ({ icon, value, color, isMiddle }) => (
  <div className={`flex items-center gap-1.5 px-3 py-1.5 ${isMiddle ? 'border-x border-gray-200' : ''}`}>
    <span className={`material-symbols-outlined text-sm ${color}`}>{icon}</span>
    <span className="text-xs font-black text-gray-700">{value}</span>
  </div>
);

const MiniProgress: React.FC<{ icon: string; color: string; textColor: string; value: number }> = ({ icon, color, textColor, value }) => (
  <div className="flex flex-col gap-1.5 items-center">
    <div className="flex items-center gap-1">
      <span className={`material-symbols-outlined text-[14px] ${textColor}`}>{icon}</span>
      <span className={`text-[9px] font-black ${textColor}`}>{value}%</span>
    </div>
    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

const SortMenuItem: React.FC<{ active: boolean; icon: string; label: string; onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors hover:bg-slate-50 rounded-2xl ${active ? 'text-blue-500' : 'text-slate-600'}`}
  >
    <span className="material-symbols-outlined text-lg">{icon}</span>
    {label}
    {active && <span className="material-symbols-outlined text-blue-500 ml-auto text-lg">check_circle</span>}
  </button>
);

const TabButton: React.FC<{ active: boolean; label: string; icon: string; onClick: () => void }> = ({ active, label, icon, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
  >
    <span className="material-symbols-outlined text-lg">{icon}</span>
    {label}
  </button>
);

const FrontLineView: React.FC<FrontLineViewProps> = ({ subject, onBack, onDefender }) => {
  const [activeSegment, setActiveSegment] = useState<'linha' | 'triagem' | 'vencidos'>('linha');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('relevancia');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const [archivedEnemies, setArchivedEnemies] = useState<ArchivedEnemy[]>([]);

  useEffect(() => {
    const loadArchived = () => {
      const archived = getArchivedEnemies();
      const filtered = archived.filter(e => {
        const room = localStorage.getItem(`room_${e.topicId}`);
        const now = new Date();
        const daysSince = (now.getTime() - new Date(e.lastVictoryDate).getTime()) / (1000 * 60 * 60 * 24);
        const barValue = calculateBarValue(daysSince, e.memoryStability, e);
        const isReturning = barValue === 100 || shouldEnemyReturn(e);
        
        return room === 'vencidos' && !isReturning;
      });
      setArchivedEnemies(filtered);
    };
    loadArchived();
  }, []);

  const enemies = subject.topics;

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setIsSortMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lógica de Filtragem e Ordenação
  const filteredTriagem = useMemo(() => {
    // Generate triagem based on real topics that are not completed and have low accuracy or are behind schedule
    const realTriagemData: TriagemItem[] = subject.topics
      .filter(t => !t.isCompleted)
      .map(t => {
        // Calcula o XP baseado no total de questões ou usa um valor padrão
        const xp = t.totalQuestions > 0 ? t.totalQuestions * 10 : 100;
        return {
          id: t.id,
          subject: subject.name,
          topic: t.name,
          description: `Tópico pendente de ${subject.name}. Continue estudando para dominar este assunto.`,
          xp: xp,
          icon: t.icon || subject.icon,
          color: subject.color
        };
      });

    let result = realTriagemData.filter(item => 
      item.topic.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortBy) {
      case 'xp_desc': result.sort((a, b) => b.xp - a.xp); break;
      case 'xp_asc': result.sort((a, b) => a.xp - b.xp); break;
      case 'nome': result.sort((a, b) => a.topic.localeCompare(b.topic)); break;
    }
    return result;
  }, [subject, searchQuery, sortBy]);

  const filteredVencidos = useMemo(() => {
    let result = archivedEnemies.filter(item => 
      item.topicName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortBy) {
      case 'xp_desc': result.sort((a, b) => b.lastVictoryXP - a.lastVictoryXP); break;
      case 'xp_asc': result.sort((a, b) => a.lastVictoryXP - b.lastVictoryXP); break;
      case 'nome': result.sort((a, b) => a.topicName.localeCompare(b.topicName)); break;
    }
    return result;
  }, [searchQuery, sortBy, archivedEnemies]);

  const filteredEnemies = useMemo(() => {
    let result = enemies.filter(enemy => {
      // Check if it's archived
      const archived = archivedEnemies.find(a => a.topicId === enemy.id);
      if (archived) {
        // If it's returning, it should be in the battlefield
        const now = new Date();
        const daysSince = (now.getTime() - new Date(archived.lastVictoryDate).getTime()) / (1000 * 60 * 60 * 24);
        const barValue = calculateBarValue(daysSince, archived.memoryStability, archived);
        const isReturning = barValue === 100 || shouldEnemyReturn(archived);
        
        if (!isReturning) {
          return false; // Not returning, so it stays in the archive
        }
      }
      
      return enemy.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    switch (sortBy) {
      case 'nome': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'xp_desc': result.sort((a, b) => b.totalQuestions - a.totalQuestions); break;
    }
    return result;
  }, [enemies, searchQuery, sortBy]);

  const renderContent = () => {
    switch (activeSegment) {
      case 'triagem':
        return filteredTriagem.length > 0 ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in zoom-in duration-300">
            {filteredTriagem.map((item) => (
              <TriagemCard key={item.id} item={item} onStart={() => {
                const topic = subject.topics.find(t => t.id === item.id);
                if (topic) onDefender(topic);
              }} />
            ))}
          </section>
        ) : (
          <div className="py-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-slate-300 text-4xl">check_circle</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Tudo em dia!</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">Não há tópicos pendentes precisando de triagem no momento.</p>
          </div>
        );
      case 'vencidos':
        return filteredVencidos.length > 0 ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in zoom-in duration-300">
            {filteredVencidos.map((item) => (
              <VencidosCard key={item.id} item={item} onRevise={() => console.log('Revisando:', item.topicName)} />
            ))}
          </section>
        ) : <EmptySearchState />;
      default:
        return filteredEnemies.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 animate-in fade-in zoom-in duration-300">
            {filteredEnemies.map((enemy) => {
              const archived = archivedEnemies.find(a => a.topicId === enemy.id);
              let force = 100;
              if (archived) {
                const now = new Date();
                const daysSince = (now.getTime() - new Date(archived.lastVictoryDate).getTime()) / (1000 * 60 * 60 * 24);
                force = calculateBarValue(daysSince, archived.memoryStability, archived);
              }

              return (
                <EnemyCard 
                  key={enemy.id}
                  subject={subject.name}
                  topic={enemy.name}
                  level={5}
                  questions={enemy.totalQuestions}
                  accuracy={`${enemy.completedQuestions}/${enemy.totalQuestions}`}
                  xp={enemy.totalQuestions * 10}
                  force={force}
                  onDefender={() => onDefender(enemy)}
                />
              );
            })}
          </section>
        ) : (
          <div className="py-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-slate-300 text-4xl">shield</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Linha de Frente Vazia</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">Adicione tópicos à disciplina para começar a defender a linha de frente.</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[160] bg-[#F8FAFC] flex flex-col animate-in slide-in-from-bottom duration-500 overflow-y-auto no-scrollbar pb-32">
      
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 pt-3 pb-3">
        <div className="px-4 max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={onBack} className="w-12 h-12 flex items-center justify-center -ml-3 text-gray-400 hover:bg-gray-50 rounded-full transition-colors active:scale-95">
                <span className="material-icons-round">chevron_left</span>
              </button>
              <div className={`p-2 rounded-xl text-white shadow-lg transition-all duration-500 ${activeSegment === 'vencidos' ? 'bg-emerald-500 shadow-emerald-500/20' : activeSegment === 'triagem' ? 'bg-blue-600 shadow-blue-500/20' : 'bg-red-500 shadow-red-500/20'}`}>
                <span className="material-symbols-outlined text-xl block">
                  {activeSegment === 'vencidos' ? 'emoji_events' : activeSegment === 'triagem' ? 'radar' : 'swords'}
                </span>
              </div>
              <h1 className="text-base md:text-lg font-black text-gray-900 tracking-tight truncate">
                {activeSegment === 'vencidos' ? 'Vencidos' : activeSegment === 'triagem' ? 'Triagem' : 'Batalha'}
              </h1>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-2 flex-1">
              <div className="flex items-center gap-0.5 bg-gray-50 p-1 rounded-xl border border-gray-100 shrink-0">
                <StatSmallBadge icon="groups" value="12" color="text-blue-500" />
                <StatSmallBadge icon="warning" value="0" color="text-red-500" isMiddle />
                <StatSmallBadge icon="verified" value="48" color="text-green-500" />
              </div>
              
              <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100 shrink-0">
                <span className="material-icons-round text-sm text-yellow-600">local_fire_department</span>
                <span className="text-[10px] md:text-xs font-black text-yellow-700 uppercase tracking-tighter">12 d</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 md:gap-6 border-t border-gray-50 pt-3">
            <MiniProgress icon="favorite" color="bg-red-500" textColor="text-red-500" value={100} />
            <MiniProgress icon="bolt" color="bg-blue-500" textColor="text-blue-500" value={85} />
            <MiniProgress icon="psychology" color="bg-indigo-500" textColor="text-indigo-500" value={98} />
            <MiniProgress icon="ads_click" color="bg-emerald-500" textColor="text-emerald-500" value={95} />
          </div>
        </div>
      </header>

      <main className="px-4 py-6 md:py-8 max-w-7xl mx-auto space-y-6 w-full">
        
        <div className="flex flex-col md:flex-row gap-3 items-stretch max-w-5xl mx-auto w-full">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-gray-400 text-xl">search</span>
            </span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm" 
              placeholder={activeSegment === 'vencidos' ? "Buscar tópicos dominados..." : activeSegment === 'triagem' ? "Buscar novos tópicos..." : "Buscar inimigos..."}
              type="text"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-gray-500"
              >
                <span className="material-icons-round text-xl">cancel</span>
              </button>
            )}
          </div>
          
          <div className="relative shrink-0" ref={sortMenuRef}>
            <button 
              onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
              className={`w-full md:w-auto px-6 py-3.5 bg-white border rounded-2xl transition-all shadow-sm flex items-center justify-center gap-3 h-full group ${isSortMenuOpen ? 'border-blue-500 text-blue-500 ring-4 ring-blue-50' : 'border-gray-200 text-gray-500 hover:text-blue-500'}`}
            >
              <span className="material-symbols-outlined text-xl">tune</span>
              <span className="md:hidden text-sm font-bold">Filtros</span>
              {sortBy !== 'relevancia' && <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>}
            </button>

            {isSortMenuOpen && (
              <div className="absolute right-0 left-0 md:left-auto mt-3 w-full md:w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 z-[200] animate-in fade-in zoom-in duration-200 origin-top">
                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ordenar por</span>
                </div>
                <SortMenuItem 
                  active={sortBy === 'relevancia'} 
                  icon="sort" 
                  label="Relevância" 
                  onClick={() => { setSortBy('relevancia'); setIsSortMenuOpen(false); }} 
                />
                <SortMenuItem 
                  active={sortBy === 'xp_desc'} 
                  icon="trending_up" 
                  label="Maior XP" 
                  onClick={() => { setSortBy('xp_desc'); setIsSortMenuOpen(false); }} 
                />
                <SortMenuItem 
                  active={sortBy === 'xp_asc'} 
                  icon="trending_down" 
                  label="Menor XP" 
                  onClick={() => { setSortBy('xp_asc'); setIsSortMenuOpen(false); }} 
                />
                <SortMenuItem 
                  active={sortBy === 'nome'} 
                  icon="abc" 
                  label="Nome (A-Z)" 
                  onClick={() => { setSortBy('nome'); setIsSortMenuOpen(false); }} 
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-100 p-1 rounded-2xl flex flex-wrap gap-1 max-w-xl mx-auto w-full">
          <TabButton 
            active={activeSegment === 'linha'} 
            label="Linha" 
            icon="swords" 
            onClick={() => { setActiveSegment('linha'); setSearchQuery(''); }} 
          />
          <TabButton 
            active={activeSegment === 'triagem'} 
            label="Triagem" 
            icon="radar" 
            onClick={() => { setActiveSegment('triagem'); setSearchQuery(''); }} 
          />
          <TabButton 
            active={activeSegment === 'vencidos'} 
            label="Vencidos" 
            icon="emoji_events" 
            onClick={() => { setActiveSegment('vencidos'); setSearchQuery(''); }} 
          />
        </div>

        <div className="max-w-7xl mx-auto w-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default FrontLineView;
