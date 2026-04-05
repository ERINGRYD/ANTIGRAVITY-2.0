
import React from 'react';
import { Tab } from '../types';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  activeColor?: string;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, activeColor = 'text-blue-500' }) => {
  const navItems = [
    { id: Tab.INICIO, label: 'Início', icon: 'home', type: 'material' },
    { id: Tab.CICLO, label: 'Ciclo', icon: 'donut_large', type: 'material' },
    { id: Tab.BATALHA, label: 'Batalha', icon: 'swords', type: 'symbols' },
    { id: Tab.COLISEU, label: 'Coliseu', icon: 'stadium', type: 'symbols' },
    { id: Tab.MAIS, label: 'Mais', icon: 'more_horiz', type: 'material' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 z-[100] h-[84px] shadow-[0_-8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.2)] pb-safe transition-colors duration-300 md:hidden">
      <div className="max-w-xl mx-auto px-4 flex justify-between items-center h-full">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          if (isActive) {
            return (
              <div key={item.id} className="relative -top-6 flex-1 flex justify-center items-center flex-col">
                <button
                  onClick={() => setActiveTab(item.id)}
                  className="flex flex-col items-center justify-center w-16 h-16 rounded-full 
                             bg-blue-600 text-white 
                             shadow-[0_4px_10px_rgba(37,99,235,0.4)] 
                             hover:shadow-[0_6px_14px_rgba(37,99,235,0.5)] 
                             transition-all transform hover:-translate-y-1"
                >
                  {item.type === 'material' ? (
                    <span className="material-icons-round text-3xl">{item.icon}</span>
                  ) : (
                    <span className="material-symbols-outlined text-3xl filled">{item.icon}</span>
                  )}
                </button>
                <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 
                             text-blue-600 font-bold text-[10px] whitespace-nowrap">
                  {item.label}
                </span>
              </div>
            );
          }

          return (
            <div key={item.id} className="relative flex-1 flex justify-center items-center flex-col">
              <button
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center justify-center w-10 h-10
                           text-slate-400 hover:text-blue-600
                           transition-all"
              >
                {item.type === 'material' ? (
                  <span className="material-icons-round text-2xl">{item.icon}</span>
                ) : (
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                )}
              </button>
              <span className="text-slate-400 font-medium text-[10px] whitespace-nowrap mt-1">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
