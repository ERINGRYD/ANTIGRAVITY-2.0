
import React from 'react';

interface MoreViewProps {
  onNavigateToTab: (tab: any) => void;
}

const MoreView: React.FC<MoreViewProps> = ({ onNavigateToTab }) => {
  return (
    <main className="px-5 py-6 flex flex-col gap-6 animate-in fade-in duration-500 pb-32">
      <section className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-5">
        <div className="relative">
          <img 
            src="/default-avatar.svg" 
            alt="User" 
            className="w-20 h-20 rounded-full border-4 border-blue-50 dark:border-slate-800 shadow-sm" 
          />
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
            <span className="material-icons-round text-[14px] text-white">edit</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-black text-slate-900 dark:text-white truncate">Estudante de Elite</h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">estudante@elite.com.br</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 text-[10px] font-black uppercase rounded-lg border border-blue-100 dark:border-blue-800">PRO PLAN</span>
          </div>
        </div>
      </section>

      <div className="space-y-6">
        <section>
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-3">Conta & Perfil</h3>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <SettingItem icon="person" label="Dados Pessoais" />
            <div className="h-px bg-slate-50 dark:bg-slate-800 w-full"></div>
            <SettingItem icon="security" label="Segurança e Senha" />
            <div className="h-px bg-slate-50 dark:bg-slate-800 w-full"></div>
            <SettingItem icon="payments" label="Assinatura e Faturamento" />
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-3">Dados & Backup</h3>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <SettingItem icon="cloud_upload" label="Exportar Dados (PDF/JSON)" />
            <div className="h-px bg-slate-50 dark:bg-slate-800 w-full"></div>
            <SettingItem icon="restore" label="Importar Backup" />
            <div className="h-px bg-slate-50 dark:bg-slate-800 w-full"></div>
            <SettingItem icon="delete_sweep" label="Limpar Todo o Histórico" variant="danger" />
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-3">App</h3>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <SettingItem icon="info" label="Sobre o Tempos Labs v1.0" />
            <div className="h-px bg-slate-50 dark:bg-slate-800 w-full"></div>
            <SettingItem icon="help_outline" label="Suporte e FAQ" />
          </div>
        </section>
      </div>

      <button className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold py-4 rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2">
        <span className="material-icons-round">logout</span>
        Sair da Conta
      </button>
    </main>
  );
};

const SettingItem: React.FC<{ icon: string; label: string; variant?: 'normal' | 'danger' }> = ({ icon, label, variant = 'normal' }) => (
  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${variant === 'danger' ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-500 dark:group-hover:text-blue-400'} transition-all`}>
        <span className="material-icons-round text-lg">{icon}</span>
      </div>
      <span className={`text-sm font-bold ${variant === 'danger' ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>{label}</span>
    </div>
    <span className="material-icons-round text-slate-300 dark:text-slate-600">chevron_right</span>
  </div>
);

export default MoreView;
