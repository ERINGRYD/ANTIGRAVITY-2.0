import React, { useState } from 'react';
import { Tab } from '../types';
import { useApp } from '../contexts/AppContext';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  title: string;
  subtitle?: string;
  icon?: string;
  onMenuClick?: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  title,
  subtitle,
  icon,
  onMenuClick,
  isDarkMode,
  setIsDarkMode
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { userStats } = useApp();

  const navItems = [
    { id: Tab.INICIO, label: 'Início', icon: 'home' },
    { id: Tab.CICLO, label: 'Plano de Estudos', icon: 'menu_book' },
    { id: Tab.BATALHA, label: 'Batalha', icon: 'swords' },
    { id: Tab.COLISEU, label: 'Coliseu', icon: 'stadium' },
    { id: Tab.RANKING, label: 'Ranking', icon: 'emoji_events' },
    { id: Tab.JORNADA, label: 'Jornada', icon: 'map' },
    { id: Tab.LOJA, label: 'Loja', icon: 'shopping_bag' },
    { id: Tab.MAIS, label: 'Mais', icon: 'more_horiz' },
    { id: Tab.CONFIGURACOES, label: 'Configurações', icon: 'settings' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className={`hidden md:flex flex-col transition-all duration-300 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-xl">bolt</span>
            </div>
            {!isSidebarCollapsed && (
              <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">FocusFlow</span>
            )}
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" referrerPolicy="no-referrer" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Eringryd</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Plano Premium</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={onMenuClick}
              className="md:hidden text-slate-500 dark:text-slate-400"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              {icon && <span className="material-symbols-outlined text-lg">{icon}</span>}
              <span>{title}</span>
              {subtitle && (
                <>
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                  <span className="text-slate-900 dark:text-white">{subtitle}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
