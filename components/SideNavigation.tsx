import React from 'react';
import { Tab } from '../types';
import { useApp } from '../contexts/AppContext';

interface SideNavigationProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  activeColor?: string;
}

const SideNavigation: React.FC<SideNavigationProps> = ({ 
  activeTab, 
  setActiveTab, 
  isMobile, 
  isOpen, 
  setIsOpen, 
  isCollapsed, 
  setIsCollapsed, 
  activeColor = 'text-blue-600' 
}) => {
  const { isDarkMode, userStats } = useApp();
  
  const navItems = [
    { id: Tab.INICIO, icon: 'home', label: 'Início', isSymbol: false },
    { id: Tab.CICLO, icon: 'donut_large', label: 'Ciclo', isSymbol: true },
    { id: Tab.BATALHA, icon: 'swords', label: 'Batalha', isSymbol: true },
    { id: Tab.COLISEU, icon: 'account_balance', label: 'Coliseu', isSymbol: true },
    { id: Tab.RANKING, icon: 'emoji_events', label: 'Ranking', isSymbol: true },
    { id: Tab.JORNADA, icon: 'map', label: 'Jornada', isSymbol: true },
    { id: Tab.LOJA, icon: 'shopping_bag', label: 'Loja', isSymbol: true },
    { id: Tab.ESTATISTICAS, icon: 'bar_chart', label: 'Estatísticas', isSymbol: true },
    { id: Tab.CONFIGURACOES, icon: 'settings', label: 'Configurações', isSymbol: true },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full py-8 overflow-y-auto no-scrollbar">
      {/* Logo Header */}
      <div className={`mb-10 flex items-center gap-3 transition-all duration-300 ${isCollapsed ? 'justify-center px-2' : 'px-6'}`}>
        <div className="bg-gradient-to-br from-red-500 to-orange-500 p-2.5 rounded-xl text-white shadow-lg shadow-red-500/20 shrink-0">
          <span className="material-symbols-outlined text-2xl block">swords</span>
        </div>
        <span className={`text-xl font-extrabold tracking-tight text-gray-900 dark:text-white whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
          StudyQuest
        </span>
      </div>
      
      {/* Navigation Items */}
      <nav className="flex flex-col gap-1 px-3 flex-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as Tab);
                if (isMobile) setIsOpen(false);
              }}
              className={`flex items-center py-3 rounded-xl transition-all group relative ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-400'
              } ${isCollapsed ? 'justify-center px-0 gap-0' : 'px-4 gap-3'}`}
            >
              {item.isSymbol ? (
                <span className={`material-symbols-outlined shrink-0 ${isActive ? 'filled' : ''} ${item.icon === 'swords' ? 'text-3xl' : 'text-2xl'}`}>{item.icon}</span>
              ) : (
                <span className={`material-icons-round text-2xl shrink-0`}>{item.icon}</span>
              )}
              <span className={`font-semibold text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                {item.label}
              </span>

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      {!isMobile && (
        <div className={`px-3 mb-2 flex ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={isCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            <span className="material-symbols-outlined">
              {isCollapsed ? 'last_page' : 'first_page'}
            </span>
          </button>
        </div>
      )}

      {/* User Profile Footer */}
      <div className={`mt-auto pt-8 border-t border-gray-100 dark:border-gray-800 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-6'}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
            <img alt="Avatar" src="/default-avatar.svg"/>
          </div>
          <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-none whitespace-nowrap">Guerreiro Pro</p>
            <p className="text-[10px] text-gray-500 uppercase mt-1 whitespace-nowrap">Nível {userStats.level}</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-[140] animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />
        )}
        <div className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 shadow-2xl z-[150] transition-transform duration-300 border-r border-slate-100 dark:border-slate-800 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
          <div className="p-6 pb-0 shrink-0">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Menu</h2>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <NavContent />
          </div>
        </div>
      </>
    );
  }

  return (
    <aside className={`hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 shrink-0 h-screen sticky top-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <NavContent />
    </aside>
  );
};

export default SideNavigation;
