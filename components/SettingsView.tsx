import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { requestNotificationPermission, subscribeUserToPush } from '../utils/pushNotifications';

interface SettingsViewProps {
  onBack: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const { unifyTabsPreference, setUnifyTabsPreference, setQuestions } = useApp();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const handleResetQuestions = () => {
    // Removing window.confirm and alert due to iframe restrictions
    setQuestions([]);
  };

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      // Cannot easily revoke permission via JS, just update state visually
      console.log('Notificações já estão ativas. Para desativar, acesse as configurações do navegador.');
      return;
    }

    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    
    if (granted) {
      // In a real app, you would use your actual VAPID public key here
      // const subscription = await subscribeUserToPush('YOUR_PUBLIC_VAPID_KEY_HERE');
      console.log('Permissão concedida para notificações push.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB] dark:bg-[#0B1120] flex flex-col animate-in fade-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 md:p-6 lg:p-8 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 bg-white dark:bg-slate-900/50 sticky top-0 z-20 backdrop-blur-sm">
        <button 
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-500 dark:text-gray-400"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-400">settings</span>
            Configurações
          </h1>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">
            Preferências do Sistema
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 lg:p-8 overflow-y-auto flex-1 max-w-3xl mx-auto w-full">
        
        {/* Section: Preferências de Exibição */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500">visibility</span>
              Preferências de Exibição
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Unificar abas de Reconhecimento, Crítica e Alerta</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Exibe todas as notificações em uma única aba chamada 'Todas'</p>
              </div>
              
              {/* Toggle Switch */}
              <button 
                onClick={() => setUnifyTabsPreference(!unifyTabsPreference)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                  unifyTabsPreference ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'
                }`}
                role="switch"
                aria-checked={unifyTabsPreference}
                aria-label="Unificar abas de Reconhecimento, Crítica e Alerta"
              >
                <span className="sr-only">Unificar abas</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    unifyTabsPreference ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Notificações Push</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receba alertas sobre metas e ciclos de estudo.</p>
              </div>
              
              {/* Toggle Switch */}
              <button 
                onClick={handleToggleNotifications}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                  notificationsEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'
                }`}
                role="switch"
                aria-checked={notificationsEnabled}
                aria-label="Ativar Notificações Push"
              >
                <span className="sr-only">Ativar Notificações</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('navigate', { detail: 'editalOnboarding' }));
                }}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group mb-4"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 text-indigo-500 shadow-sm group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">assignment</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Perfil do Edital</h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Configurar pesos das matérias</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-gray-300 group-hover:text-indigo-500 transition-colors">chevron_right</span>
              </button>

              <button 
                onClick={() => {
                  // Custom event to navigate to sounds
                  window.dispatchEvent(new CustomEvent('navigate', { detail: 'sounds' }));
                }}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 text-blue-500 shadow-sm group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">volume_up</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Sons e Alertas</h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Personalizar áudio</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-gray-300 group-hover:text-blue-500 transition-colors">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section: Dados e Sistema */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden mt-8">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500">database</span>
              Dados e Sistema
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Limpar Banco de Questões</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Remove todas as questões cadastradas e restaura o estado inicial.</p>
              </div>
              
              <button 
                onClick={handleResetQuestions}
                className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsView;
