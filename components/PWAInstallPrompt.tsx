import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, promptInstall } = usePWAInstall();

  if (!isInstallable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shrink-0">
          <span className="material-icons-round">get_app</span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Instalar App</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">Adicione à tela inicial para acesso rápido e offline.</p>
        </div>
      </div>
      <button
        onClick={promptInstall}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors shrink-0"
      >
        Instalar
      </button>
    </div>
  );
};

export default PWAInstallPrompt;
