import React from 'react';

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    subject: string;
    status: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    subject: string;
    status: string;
  }>>;
  subjects: { id: string; name: string }[];
}

const FiltersModal: React.FC<FiltersModalProps> = ({ isOpen, onClose, filters, setFilters, subjects }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">tune</span>
            Filtros
          </h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Subject Filter */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Matéria
            </label>
            <select
              value={filters.subject}
              onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 text-gray-900 dark:text-white outline-none transition-all appearance-none"
            >
              <option value="">Todas as matérias</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.name}>{subject.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 text-gray-900 dark:text-white outline-none transition-all appearance-none"
            >
              <option value="">Todos os status</option>
              <option value="Pronto">Pronto</option>
              <option value="Observando">Observando</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-4 bg-gray-50 dark:bg-slate-800/50">
          <button
            onClick={() => setFilters({ subject: '', status: '' })}
            className="flex-1 py-4 rounded-2xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            Limpar
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiltersModal;
