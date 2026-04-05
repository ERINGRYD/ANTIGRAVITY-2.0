import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useUI, Toast } from '../contexts/UIContext';

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { removeToast } = useUI();

  const getIcon = () => {
    if (toast.icon) return toast.icon;
    switch (toast.type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'achievement': return 'emoji_events';
      default: return 'info';
    }
  };

  const getColors = () => {
    switch (toast.type) {
      case 'success': return 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400';
      case 'error': return 'bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400';
      case 'warning': return 'bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400';
      case 'achievement': return 'bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400';
      default: return 'bg-slate-50 border-slate-100 text-slate-800 dark:bg-slate-900/20 dark:border-slate-800 dark:text-slate-400';
    }
  };

  const getIconColor = () => {
    switch (toast.type) {
      case 'success': return 'text-emerald-500';
      case 'error': return 'text-rose-500';
      case 'warning': return 'text-amber-500';
      case 'achievement': return 'text-blue-500';
      default: return 'text-slate-500';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`flex items-start gap-3 p-4 rounded-2xl border shadow-lg max-w-sm w-full ${getColors()}`}
    >
      <div className={`shrink-0 mt-0.5 ${getIconColor()}`}>
        <span className="material-icons-round text-xl">{getIcon()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-black leading-tight truncate">{toast.title}</h4>
        {toast.description && (
          <p className="text-xs font-medium mt-1 opacity-90 leading-relaxed">{toast.description}</p>
        )}
      </div>
      <button 
        onClick={() => removeToast(toast.id)}
        className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
      >
        <span className="material-icons-round text-lg">close</span>
      </button>
    </motion.div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useUI();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex flex-col items-center gap-3 w-full px-6 pointer-events-none">
      <div className="flex flex-col items-center gap-3 w-full max-w-sm pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
