import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import ArchivedEnemiesView from './ArchivedEnemiesView';
import BattleQuestionView from './BattleQuestionView';
import FiltersModal from './FiltersModal';
import { readTopicRoom } from '../utils/confidenceScoring';
import { getArchivedEnemies, calculateBarValue, shouldEnemyReturn } from '../utils/ebbinghaus';

interface CombatViewProps {
  onBack: () => void;
  subjectId?: string | null;
}

const CombatView: React.FC<CombatViewProps> = ({ onBack, subjectId }) => {
  const { userStats, isDarkMode, unifyTabsPreference, subjects, questions, studyHistory } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'reconhecimento' | 'critica' | 'alerta' | 'todas'>('reconhecimento');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedEnemyId, setSelectedEnemyId] = useState<string | null>(null);
  const [enemies, setEnemies] = useState<any[]>([]);
  const [defeatedCount, setDefeatedCount] = useState(0);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ subject: subjectId ? subjects.find(s => s.id === subjectId)?.name || '' : '', status: '' });

  // Load defeated enemies count
  useEffect(() => {
    import('../utils/ebbinghaus').then(({ getArchivedEnemies, calculateBarValue, shouldEnemyReturn }) => {
      const archived = getArchivedEnemies();
      const filtered = archived.filter(e => {
        const room = localStorage.getItem(`room_${e.topicId}`);
        const now = new Date();
        const daysSince = (now.getTime() - new Date(e.lastVictoryDate).getTime()) / (1000 * 60 * 60 * 24);
        const barValue = calculateBarValue(daysSince, e.memoryStability, e);
        const isReturning = barValue === 100 || shouldEnemyReturn(e);
        
        return room === 'vencidos' && !isReturning;
      });
      setDefeatedCount(filtered.length);
    });
  }, []);

  // Calculate Accuracy from history
  const accuracy = React.useMemo(() => {
    if (!studyHistory || studyHistory.length === 0) return 92;
    const sessionsWithQuestions = studyHistory.filter(s => s.questionsCompleted > 0);
    if (sessionsWithQuestions.length === 0) return 92;
    
    const totalAccuracy = sessionsWithQuestions.reduce((acc, s) => acc + s.accuracy, 0);
    return Math.round(totalAccuracy / sessionsWithQuestions.length);
  }, [studyHistory]);

  const focus = 65; // Valor de foco padrão
  const hp = userStats?.hp ?? 1000;
  const stamina = userStats?.stamina ?? 100;
  const currentXp = userStats?.xp ?? 0;

  const ranks = [
    { name: 'Recruta', xp: 0 },
    { name: 'Soldado', xp: 1000 },
    { name: 'Cabo', xp: 3000 },
    { name: 'Sargento', xp: 6000 },
    { name: 'Tenente', xp: 10000 },
    { name: 'Capitão', xp: 15000 },
    { name: 'Major', xp: 25000 },
    { name: 'Coronel', xp: 40000 },
    { name: 'General', xp: 60000 },
    { name: 'Marechal', xp: 100000 }
  ];

  const currentRankIndex = ranks.findIndex((r, i) => currentXp >= r.xp && (i === ranks.length - 1 || currentXp < ranks[i + 1].xp));
  const nextRank = currentRankIndex < ranks.length - 1 ? ranks[currentRankIndex + 1] : ranks[ranks.length - 1];
  const currentRank = ranks[currentRankIndex];
  
  const xpProgress = currentRankIndex < ranks.length - 1 
    ? ((currentXp - currentRank.xp) / (nextRank.xp - currentRank.xp)) * 100 
    : 100;

  // Load rooms from localStorage
  useEffect(() => {
    const loadRooms = async () => {
      console.log('CombatView: Loading rooms...', { 
        subjectsCount: subjects.length, 
        questionsCount: questions.length,
        subjectIdFilter: subjectId,
        firstFewQuestions: questions.slice(0, 3).map(q => ({ id: q.id, subject: q.subject, topic: q.topic })),
        firstFewSubjects: subjects.slice(0, 2).map(s => ({ id: s.id, name: s.name, topicsCount: s.topics.length }))
      });

      // Generate enemies from subjects, filtering only topics that have questions
      const filteredSubjects = subjectId 
        ? subjects.filter(s => s.id === subjectId)
        : subjects;

      const generatedEnemies = filteredSubjects.flatMap(subject => 
        subject.topics
          .filter(topic => {
            const hasQuestions = questions.some(q => q.topic === topic.id);
            return hasQuestions;
          })
          .map(topic => ({
            id: topic.id,
            subject: subject.name,
            name: topic.name,
            level: Math.max(1, Math.ceil(topic.completedQuestions / 10) || 1),
            room: 'reconhecimento', // Default, will be updated
            status: topic.isCompleted ? 'Pronto' : 'Observando',
            icon: topic.icon || subject.icon || 'radar',
            color: subject.color || 'blue',
            locked: false,
          }))
      );

      console.log('CombatView: Generated enemies count:', generatedEnemies.length);

      const archivedEnemies = getArchivedEnemies();
      const now = new Date();

      const updatedEnemies = await Promise.all(
        generatedEnemies.map(async (enemy) => {
          const savedRoom = await readTopicRoom(enemy.id);
          let finalRoom = savedRoom || enemy.room;
          let force = 100;
          
          if (finalRoom === 'vencidos' || finalRoom === 'alerta') {
            const archived = archivedEnemies.find(a => a.topicId === enemy.id);
            if (archived) {
              const daysSince = (now.getTime() - new Date(archived.lastVictoryDate).getTime()) / (1000 * 60 * 60 * 24);
              force = calculateBarValue(daysSince, archived.memoryStability, archived);
              const isReturning = force === 100 || shouldEnemyReturn(archived);
              
              if (isReturning) {
                finalRoom = 'alerta';
              }
            }
          }

          return { ...enemy, room: finalRoom, force };
        })
      );
      setEnemies(updatedEnemies);
    };
    
    // Load when component mounts or when returning from a question
    if (!selectedEnemyId) {
      loadRooms();
    }

    // Listen for archiving events to refresh the list
    const handleEnemyArchived = () => {
      loadRooms();
    };

    window.addEventListener('enemy_archived', handleEnemyArchived);
    window.addEventListener('rooms_updated', handleEnemyArchived);
    return () => {
      window.removeEventListener('enemy_archived', handleEnemyArchived);
      window.removeEventListener('rooms_updated', handleEnemyArchived);
    };
  }, [selectedEnemyId, subjects, questions]);

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set default tab based on preference
  useEffect(() => {
    if (unifyTabsPreference) {
      setActiveTab('todas');
    } else if (activeTab === 'todas') {
      setActiveTab('reconhecimento');
    }
  }, [unifyTabsPreference]);

  if (selectedEnemyId) {
    const selectedEnemy = enemies.find(e => e.id === selectedEnemyId);
    const mode = selectedEnemy ? selectedEnemy.room : 'reconhecimento';
    return <BattleQuestionView onBack={() => setSelectedEnemyId(null)} mode={mode as any} topicId={selectedEnemyId} room="sala-1" />;
  }

  if (showArchived) {
    return (
      <ArchivedEnemiesView 
        onBack={() => setShowArchived(false)} 
        subjectId={subjectId}
        onReviewNow={(topicId) => {
          setSelectedEnemyId(topicId);
          setShowArchived(false);
        }}
      />
    );
  }

  const renderEnemyCard = (enemy: any) => {
    if (enemy.locked) {
      return (
        <div key={enemy.id} className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex flex-col md:flex-row items-center justify-between group hover:border-gray-300 dark:hover:border-gray-600 transition-all opacity-70 gap-4 md:gap-0">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-400 shrink-0">
              <span className="material-symbols-outlined text-3xl">{enemy.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{enemy.subject}</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">Bloqueado</span>
              </div>
              <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400 leading-tight">{enemy.name}</h3>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-xs text-gray-400 font-semibold">
                  <span className="material-symbols-outlined text-[14px]">military_tech</span> Nível {enemy.level}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 pl-0 md:pl-6 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 w-full md:w-auto justify-between md:justify-end pt-4 md:pt-0">
            <div className="text-right hidden xl:block">
              <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Abertura em</span>
              <span className="text-sm font-black text-gray-500">{enemy.unlockIn || 'Em breve'}</span>
            </div>
            <button className="bg-gray-100 dark:bg-slate-700 text-gray-400 font-bold px-8 py-4 rounded-2xl flex items-center gap-2 cursor-not-allowed shrink-0 w-full md:w-auto justify-center">
              <span className="material-symbols-outlined text-xl">lock</span>
              Bloqueado
            </button>
          </div>
        </div>
      );
    }

    let theme = {
      border: 'border-blue-500/20',
      hoverBorder: 'hover:border-blue-500/40',
      bgLight: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-500',
      bgBadge: 'bg-blue-50 dark:bg-blue-900/30',
      btnBg: 'bg-blue-500 hover:bg-blue-600 text-white',
      btnShadow: 'shadow-blue-500/20',
      icon: 'radar',
      btnText: 'Reconhecer',
      statusText: 'Pronto',
      actionText: 'Status'
    };

    if (enemy.room === 'critica') {
      theme = {
        border: 'border-red-500/20',
        hoverBorder: 'hover:border-red-500/40',
        bgLight: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-500',
        bgBadge: 'bg-red-50 dark:bg-red-900/30',
        btnBg: 'bg-red-500 hover:bg-red-600 text-white',
        btnShadow: 'shadow-red-500/20',
        icon: 'fitness_center',
        btnText: 'Reforçar',
        statusText: 'Crítico',
        actionText: 'Prioridade'
      };
    } else if (enemy.room === 'alerta') {
      theme = {
        border: 'border-amber-500/20',
        hoverBorder: 'hover:border-amber-500/40',
        bgLight: 'bg-amber-50 dark:bg-amber-900/20',
        text: 'text-amber-500',
        bgBadge: 'bg-amber-50 dark:bg-amber-900/30',
        btnBg: 'bg-amber-500 hover:bg-amber-600 text-white',
        btnShadow: 'shadow-amber-500/20',
        icon: 'security',
        btnText: 'Interceptar',
        statusText: 'Atenção',
        actionText: 'Ação'
      };
    }

    return (
      <div key={enemy.id} className={`w-full bg-white dark:bg-slate-800 rounded-3xl border-2 ${theme.border} shadow-sm p-5 flex flex-col md:flex-row items-center justify-between group ${theme.hoverBorder} transition-all gap-4 md:gap-0`}>
        <div className="flex items-center gap-6 w-full md:w-auto min-w-0">
          <div className={`w-16 h-16 rounded-2xl ${theme.bgLight} flex items-center justify-center ${theme.text} shrink-0`}>
            <span className="material-symbols-outlined text-3xl">{enemy.icon}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-black ${theme.text} uppercase tracking-widest ${theme.bgBadge} px-2 py-0.5 rounded-full`}>{enemy.subject}</span>
              <span className={`text-[10px] ${theme.text} font-bold uppercase ${theme.bgBadge} px-2 py-0.5 rounded-full flex items-center gap-1`}>
                <span className="material-symbols-outlined text-[10px]">{theme.icon}</span> {theme.statusText}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight truncate">{enemy.name}</h3>
            
            {/* Force Bar */}
            <div className="mt-3 w-full max-w-[200px]">
              <div className="flex justify-between items-end mb-1">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Força do Inimigo</span>
                <span className={`text-[10px] font-black ${theme.text}`}>{enemy.force || 100}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${theme.btnBg.split(' ')[0]} rounded-full transition-all duration-500`}
                  style={{ width: `${enemy.force || 100}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-semibold">
                <span className="material-symbols-outlined text-[14px]">military_tech</span> Nível {enemy.level}
              </div>
              {enemy.errorRate && enemy.room === 'critica' && (
                <div className={`flex items-center gap-1 text-xs ${theme.text} font-semibold`}>
                  <span className="material-symbols-outlined text-[14px]">trending_down</span> Taxa de Erro {enemy.errorRate}
                </div>
              )}
              {enemy.approachIn && enemy.room === 'alerta' && (
                <div className={`flex items-center gap-1 text-xs ${theme.text} font-semibold`}>
                  <span className="material-symbols-outlined text-[14px]">timer</span> Aproximação em {enemy.approachIn}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6 pl-0 md:pl-6 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 w-full md:w-auto justify-between md:justify-end pt-4 md:pt-0">
          <div className="text-right hidden xl:block">
            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{theme.actionText}</span>
            <span className={`text-sm font-black ${theme.text}`}>Imediata</span>
          </div>
          <button 
            onClick={() => setSelectedEnemyId(enemy.id)}
            className={`${theme.btnBg} font-bold px-8 py-4 rounded-2xl shadow-lg ${theme.btnShadow} flex items-center gap-2 transition-all active:scale-95 shrink-0 w-full md:w-auto justify-center`}
          >
            <span className="material-symbols-outlined text-xl">{theme.icon}</span>
            {theme.btnText}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col lg:flex-row min-h-screen lg:h-[calc(100vh-6rem)] bg-[#F9FAFB] dark:bg-[#0B1120]">
      {/* Sidebar - Comando de Guerra */}
      <aside className={`border-r border-gray-100 dark:border-gray-800 overflow-y-auto no-scrollbar bg-white dark:bg-slate-900/30 transition-all duration-300 flex flex-col ${isCollapsed ? 'w-full lg:w-24 p-4 items-center' : 'w-full lg:w-1/3 p-6 lg:p-8 space-y-8'}`}>
        
        {/* Header & Toggle */}
        <div className={`flex items-center ${isCollapsed ? 'flex-row lg:flex-col gap-4 justify-between lg:justify-center mb-0 lg:mb-6 w-full lg:w-auto' : 'justify-between mb-6'}`}>
          {!isCollapsed && (
            <div className="flex-1">
              <button onClick={onBack} className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors lg:hidden">
                <span className="material-symbols-outlined">arrow_back</span>
                Voltar
              </button>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 whitespace-nowrap">
                <span className="material-symbols-outlined text-red-500 text-3xl">shield</span>
                Comando de Guerra
              </h2>
            </div>
          )}
          
          {isCollapsed && (
             <div className="flex items-center gap-3 lg:flex-col lg:gap-0">
               <span className="material-symbols-outlined text-red-500 text-3xl lg:mb-2">shield</span>
               <span className="text-sm font-bold text-gray-900 dark:text-white lg:hidden">Comando</span>
             </div>
          )}

          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? "Expandir" : "Recolher"}
          >
            <span className="material-symbols-outlined">{isCollapsed ? 'expand_more' : 'expand_less'}</span>
            <span className="sr-only">{isCollapsed ? "Expandir" : "Recolher"}</span>
          </button>
        </div>

        {/* Content */}
        <div className={`flex flex-col ${isCollapsed ? 'hidden lg:flex gap-6 w-full items-center' : 'space-y-8 w-full'}`}>
          
          {!isCollapsed && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">Status Vital do Guerreiro</p>
            </div>
          )}

          <div className={`${isCollapsed ? 'space-y-6 w-full flex flex-col items-center' : 'bg-gray-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 space-y-8 shadow-sm'}`}>
            {/* Vida */}
            <div className={`space-y-3 ${isCollapsed ? 'w-full flex flex-col items-center group relative' : ''}`}>
              <div className={`flex justify-between items-center ${isCollapsed ? 'justify-center' : 'mb-2'}`}>
                <span className={`flex items-center gap-2 text-sm font-bold uppercase text-red-500 tracking-wider ${isCollapsed ? '' : ''}`}>
                  <span className="material-symbols-outlined text-lg font-variation-fill">favorite</span> 
                  {!isCollapsed && 'Vida'}
                </span>
                {!isCollapsed && <span className="text-sm font-black text-red-500">{hp}/1000</span>}
              </div>
              
              {isCollapsed ? (
                <div className="w-1.5 h-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                   <div className="absolute bottom-0 w-full bg-red-500 rounded-full" style={{ height: `${(hp / 1000) * 100}%` }}></div>
                </div>
              ) : (
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full relative" style={{ width: `${(hp / 1000) * 100}%` }}>
                    <div className="absolute inset-0 bg-white/20"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Energia */}
            <div className={`space-y-3 ${isCollapsed ? 'w-full flex flex-col items-center group relative' : ''}`}>
              <div className={`flex justify-between items-center ${isCollapsed ? 'justify-center' : 'mb-2'}`}>
                <span className="flex items-center gap-2 text-sm font-bold uppercase text-blue-500 tracking-wider">
                  <span className="material-symbols-outlined text-lg font-variation-fill">bolt</span> 
                  {!isCollapsed && 'Energia'}
                </span>
                {!isCollapsed && <span className="text-sm font-black text-blue-500">{stamina}/100</span>}
              </div>
              
              {isCollapsed ? (
                <div className="w-1.5 h-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                   <div className="absolute bottom-0 w-full bg-blue-500 rounded-full" style={{ height: `${stamina}%` }}></div>
                </div>
              ) : (
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full relative" style={{ width: `${stamina}%` }}>
                    <div className="absolute inset-0 bg-white/20"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Foco */}
            <div className={`space-y-3 ${isCollapsed ? 'w-full flex flex-col items-center group relative' : ''}`}>
              <div className={`flex justify-between items-center ${isCollapsed ? 'justify-center' : 'mb-2'}`}>
                <span className="flex items-center gap-2 text-sm font-bold uppercase text-indigo-500 tracking-wider">
                  <span className="material-symbols-outlined text-lg">psychology</span> 
                  {!isCollapsed && 'Foco'}
                </span>
                {!isCollapsed && <span className="text-sm font-black text-indigo-500">{focus}%</span>}
              </div>
              
              {isCollapsed ? (
                <div className="w-1.5 h-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                   <div className="absolute bottom-0 w-full bg-indigo-500 rounded-full" style={{ height: `${focus}%` }}></div>
                </div>
              ) : (
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full relative" style={{ width: `${focus}%` }}>
                    <div className="absolute inset-0 bg-white/20"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Precisão */}
            <div className={`space-y-3 ${isCollapsed ? 'w-full flex flex-col items-center group relative' : ''}`}>
              <div className={`flex justify-between items-center ${isCollapsed ? 'justify-center' : 'mb-2'}`}>
                <span className="flex items-center gap-2 text-sm font-bold uppercase text-emerald-500 tracking-wider">
                  <span className="material-symbols-outlined text-lg">ads_click</span> 
                  {!isCollapsed && 'Precisão'}
                </span>
                {!isCollapsed && <span className="text-sm font-black text-emerald-500">{accuracy}%</span>}
              </div>
              
              {isCollapsed ? (
                <div className="w-1.5 h-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                   <div className="absolute bottom-0 w-full bg-emerald-500 rounded-full" style={{ height: `${accuracy}%` }}></div>
                </div>
              ) : (
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full relative" style={{ width: `${accuracy}%` }}>
                    <div className="absolute inset-0 bg-white/20"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!isCollapsed ? (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-8xl">military_tech</span>
              </div>
              <h3 className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-4">Resumo da Carreira</h3>
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div>
                  <span className="block text-3xl font-black mb-1">{defeatedCount.toLocaleString()}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Inimigos Derrotados</span>
                </div>
                <div>
                  <span className="block text-3xl font-black text-emerald-400 mb-1">{accuracy}%</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Taxa de Vitória</span>
                </div>
                <div className="col-span-2 pt-4 border-t border-gray-700 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-300">Próximo Rank: {nextRank.name}</span>
                    <span className="text-xs font-bold text-blue-400">{nextRank.xp >= 1000 ? `${nextRank.xp / 1000}k` : nextRank.xp} XP</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${xpProgress}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white shadow-lg mt-auto hidden lg:flex" title="Resumo da Carreira">
              <span className="material-symbols-outlined text-xl">military_tech</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content - Combate */}
      <main className={`w-full ${isCollapsed ? 'lg:w-[calc(100%-6rem)]' : 'lg:w-2/3'} p-4 md:p-6 lg:p-8 overflow-y-auto bg-[#F9FAFB] dark:bg-[#0B1120]/50 flex flex-col transition-all duration-300`}>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              COMBATE {subjectId && subjects.find(s => s.id === subjectId) ? `- ${subjects.find(s => s.id === subjectId)?.name.toUpperCase()}` : ''}
            </h1>
            <p className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 md:mt-2">Área de Missões Ativas</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                // Navigate to battle history
                // We need to access navigateTo from AppContext or pass it as prop
                // For now, let's assume we can use a custom event or similar if not available
                window.dispatchEvent(new CustomEvent('navigate', { detail: 'battleHistory' }));
              }}
              className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-gray-600 dark:text-gray-300"
              title="Histórico de Batalhas"
            >
              <span className="material-symbols-outlined text-2xl">history</span>
            </button>
            <button 
              onClick={() => setShowArchived(true)}
              className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-gray-600 dark:text-gray-300"
              title="Inimigos Arquivados"
            >
              <span className="material-symbols-outlined text-2xl">inventory_2</span>
            </button>
          </div>
        </div>

        <div className="flex overflow-x-auto pb-4 gap-4 mb-6 snap-x no-scrollbar sm:grid sm:grid-cols-3 sm:pb-0">
          <div className="min-w-[260px] sm:min-w-0 snap-center bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 border-b-4 border-b-blue-500 shadow-sm flex items-center gap-4 cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-200 active:scale-95">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-blue-500 text-xl">radar</span>
            </div>
            <div>
              <span className="block text-xl font-bold text-gray-900 dark:text-white leading-none mb-1">{enemies.filter(e => e.room !== 'vencidos').length}</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider leading-tight">Inimigos Ativos</span>
            </div>
          </div>
          <div className="min-w-[260px] sm:min-w-0 snap-center bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 border-b-4 border-b-transparent shadow-sm flex items-center gap-4 cursor-pointer hover:border-b-blue-500/40 hover:-translate-y-1 hover:shadow-md transition-all duration-200 active:scale-95">
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-red-500 text-xl">warning</span>
            </div>
            <div>
              <span className="block text-xl font-bold text-gray-900 dark:text-white leading-none mb-1">{enemies.filter(e => e.room === 'critica').length}</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider leading-tight">Críticos</span>
            </div>
          </div>
          <div className="min-w-[260px] sm:min-w-0 snap-center bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 border-b-4 border-b-transparent shadow-sm flex items-center gap-4 cursor-pointer hover:border-b-blue-500/40 hover:-translate-y-1 hover:shadow-md transition-all duration-200 active:scale-95">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-emerald-500 text-xl">military_tech</span>
            </div>
            <div>
              <span className="block text-xl font-bold text-gray-900 dark:text-white leading-none mb-1">{defeatedCount}</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider leading-tight">Campos Dominados</span>
            </div>
          </div>
        </div>

        <div className="sticky top-0 z-10 bg-[#F9FAFB] dark:bg-[#0B1120] pt-2 flex gap-2 mb-8 border-b border-gray-200 dark:border-gray-800 overflow-x-auto w-full shrink-0">
          {unifyTabsPreference ? (
            <button 
              onClick={() => setActiveTab('todas')}
              className={`px-6 py-4 border-b-2 font-bold text-sm tracking-wide uppercase transition-colors whitespace-nowrap shrink-0 ${activeTab === 'todas' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-slate-800/50'}`}
            >
              Todas
            </button>
          ) : (
            <>
              <button 
                onClick={() => setActiveTab('reconhecimento')}
                className={`px-6 py-4 border-b-2 font-bold text-sm tracking-wide uppercase transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-2 ${activeTab === 'reconhecimento' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-slate-800/50'}`}
                title="Reconhecimento"
              >
                <span className="material-symbols-outlined text-2xl md:hidden">radar</span>
                <span className="hidden md:inline">Reconhecimento</span>
              </button>
              <button 
                onClick={() => setActiveTab('critica')}
                className={`px-6 py-4 border-b-2 font-bold text-sm tracking-wide uppercase transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-2 ${activeTab === 'critica' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-slate-800/50'}`}
                title="Crítica"
              >
                <span className="material-symbols-outlined text-2xl md:hidden">warning</span>
                <span className="hidden md:inline">Crítica</span>
              </button>
              <button 
                onClick={() => setActiveTab('alerta')}
                className={`px-6 py-4 border-b-2 font-bold text-sm tracking-wide uppercase transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-2 ${activeTab === 'alerta' ? 'border-amber-500 text-amber-500' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-slate-800/50'}`}
                title="Alerta"
              >
                <span className="material-symbols-outlined text-2xl md:hidden">priority_high</span>
                <span className="hidden md:inline">Alerta</span>
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-gray-400">search</span>
            </span>
            <input 
              className="w-full pl-12 pr-4 py-3 rounded-2xl border-none bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 shadow-sm outline-none" 
              placeholder="Localizar alvo específico..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsFiltersOpen(true)}
            className={`relative px-6 py-3 bg-gray-100 dark:bg-slate-800 rounded-2xl font-bold shadow-sm flex items-center gap-2 border transition-colors ${
              filters.subject || filters.status 
                ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-gray-600 dark:text-gray-300 hover:border-gray-200 dark:hover:border-gray-700'
            }`}
          >
            <span className="material-symbols-outlined text-xl">tune</span>
            Filtros
            {(filters.subject || filters.status) && (
              <span className="w-2 h-2 rounded-full bg-blue-500 absolute top-3 right-4"></span>
            )}
          </button>
        </div>

        <div className="space-y-4 flex-1">
          {(activeTab === 'reconhecimento' || activeTab === 'todas') && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
              {enemies.filter(e => e.room === 'reconhecimento').length > 0 ? (
                enemies
                  .filter(e => e.room === 'reconhecimento')
                  .filter(e => !searchQuery || e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.subject.toLowerCase().includes(searchQuery.toLowerCase()))
                  .filter(e => !filters.subject || e.subject === filters.subject)
                  .filter(e => !filters.status || e.status === filters.status)
                  .map(renderEnemyCard)
              ) : activeTab === 'reconhecimento' && (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-blue-500 text-3xl">radar</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sala de Reconhecimento Vazia</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mt-1">Não há novos alvos para mapear no momento. Continue progredindo nos seus estudos.</p>
                </div>
              )}
            </div>
          )}

          {(activeTab === 'critica' || activeTab === 'todas') && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
              {enemies.filter(e => e.room === 'critica').length > 0 ? (
                enemies
                  .filter(e => e.room === 'critica')
                  .filter(e => !searchQuery || e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.subject.toLowerCase().includes(searchQuery.toLowerCase()))
                  .filter(e => !filters.subject || e.subject === filters.subject)
                  .filter(e => !filters.status || e.status === filters.status)
                  .map(renderEnemyCard)
              ) : activeTab === 'critica' && (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                  <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-red-500 text-3xl">verified_user</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Perímetro Seguro</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mt-1">Nenhum inimigo crítico detectado. Suas defesas estão sólidas neste setor.</p>
                </div>
              )}
            </div>
          )}

          {(activeTab === 'alerta' || activeTab === 'todas') && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
              {enemies.filter(e => e.room === 'alerta').length > 0 ? (
                enemies
                  .filter(e => e.room === 'alerta')
                  .filter(e => !searchQuery || e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.subject.toLowerCase().includes(searchQuery.toLowerCase()))
                  .filter(e => !filters.subject || e.subject === filters.subject)
                  .filter(e => !filters.status || e.status === filters.status)
                  .map(renderEnemyCard)
              ) : activeTab === 'alerta' && (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                  <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-amber-500 text-3xl">notifications_off</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sem Alertas Ativos</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mt-1">Não há ameaças iminentes. Aproveite para revisar conteúdos dominados.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <FiltersModal 
        isOpen={isFiltersOpen} 
        onClose={() => setIsFiltersOpen(false)} 
        filters={filters} 
        setFilters={setFilters} 
        subjects={subjects} 
      />
    </div>
  );
};

export default CombatView;
