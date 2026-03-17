import React from 'react';

export interface HeaderAction {
  icon?: string;
  onClick: () => void;
  title?: string;
  primary?: boolean;
  color?: string;
  text?: string;
}

interface HeaderProps {
  onAddSubject?: () => void;
  onNotificationsClick?: () => void;
  onHistoryClick?: () => void;
  onStatsClick?: () => void;
  onAchievementsClick?: () => void;
  onSettingsClick?: () => void;
  onMenuClick?: () => void;
  isAutoCycle: boolean;
  setIsAutoCycle: (val: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  achievementsCount?: number;
  actions?: HeaderAction[];
  userAvatar?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  onAddSubject, 
  onNotificationsClick, 
  onHistoryClick, 
  onStatsClick,
  onAchievementsClick,
  onSettingsClick,
  onMenuClick,
  isAutoCycle,
  setIsAutoCycle,
  isDarkMode,
  setIsDarkMode,
  achievementsCount = 0,
  actions,
  userAvatar
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 transition-colors duration-300 h-20 flex items-center">
      <div className="w-full flex items-center justify-between">
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-4 shrink-0">
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-icons-round text-2xl">menu</span>
          </button>
          
          <div className="bg-blue-500 w-10 h-10 rounded-[12px] text-white shadow-lg shadow-blue-500/20 hidden md:flex items-center justify-center">
            <span className="material-icons-round text-xl">menu_book</span>
          </div>
          
          <div className="hidden min-[400px]:block">
            <h1 className="text-base font-extrabold leading-tight text-slate-900 dark:text-white">Ciclo de Estudos</h1>
            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-0.5">V1.0 DESIGN SYSTEM</p>
          </div>
        </div>

        {/* Center: Auto Cycle Toggle */}
        <div className="flex-1 flex justify-center px-2 md:px-4">
          <button 
            onClick={() => setIsAutoCycle(!isAutoCycle)}
            className={`relative w-[60px] md:w-[200px] h-10 rounded-full transition-all duration-300 p-1 ${
              isAutoCycle ? 'bg-blue-500 shadow-blue-500/20 shadow-lg' : 'bg-slate-200 dark:bg-slate-800'
            }`}
          >
            <span className={`absolute inset-0 hidden md:flex items-center justify-center text-[10px] font-black uppercase tracking-[0.15em] transition-colors duration-300 ${
              isAutoCycle ? 'text-white' : 'text-slate-500 dark:text-slate-400'
            }`}>
              Ciclo Automático
            </span>
            <div 
              className={`w-8 h-8 bg-white rounded-full shadow-md transition-transform duration-300 ease-out flex items-center justify-center ${
                isAutoCycle ? 'translate-x-[20px] md:translate-x-[160px]' : 'translate-x-0'
              }`}
            >
              {isAutoCycle && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
            </div>
          </button>
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-4 shrink-0">
          {actions ? (
            <>
              {actions.map((action, index) => (
                <HeaderButton 
                  key={index}
                  icon={action.icon}
                  onClick={action.onClick}
                  title={action.title}
                  primary={action.primary}
                  color={action.color}
                  text={action.text}
                />
              ))}
            </>
          ) : (
            <>
              <HeaderButton 
                icon={isDarkMode ? 'light_mode' : 'dark_mode'} 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'} 
                iconSize="text-[20px]"
              />
              {onNotificationsClick && (
                <HeaderButton icon="notifications_off" onClick={onNotificationsClick} title="Alertas" iconSize="text-[20px]" />
              )}
              {onHistoryClick && (
                <HeaderButton icon="history" onClick={onHistoryClick} title="Histórico" iconSize="text-[22px]" />
              )}
              {onStatsClick && (
                <HeaderButton icon="bar_chart" onClick={onStatsClick} title="Estatísticas" iconSize="text-[22px]" />
              )}
              {onAchievementsClick && (
                <HeaderButton icon="emoji_events" onClick={onAchievementsClick} title="Conquistas" iconSize="text-[20px]" />
              )}
              {onSettingsClick && (
                <HeaderButton icon="settings" onClick={onSettingsClick} title="Configurações" iconSize="text-[20px]" />
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

const HeaderButton: React.FC<{ icon?: string; onClick?: () => void; title?: string; primary?: boolean; color?: string; iconSize?: string; text?: string }> = ({ icon, onClick, title, primary, color, iconSize = "text-[20px]", text }) => {
  if (text) {
    return (
      <button 
        onClick={onClick}
        title={title}
        className={`flex items-center justify-center px-4 h-8 rounded-md transition-all shrink-0 text-xs font-bold border ${
          primary 
            ? 'bg-blue-500 text-white border-blue-500 shadow-sm hover:bg-blue-600' 
            : 'bg-white dark:bg-slate-900 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800'
        }`}
      >
        {text}
      </button>
    );
  }

  return (
    <button 
      onClick={onClick}
      title={title}
      className={`flex items-center justify-center w-8 h-8 rounded-full transition-all shrink-0 group relative ${
        primary 
          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:brightness-110' 
          : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
      }`}
    >
      {icon && <span className={`material-icons-round ${iconSize} ${color || ''}`}>{icon}</span>}
    </button>
  );
};

export default Header;
