import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';

interface UploadImageViewProps {
  onBack: () => void;
  onConfirm: (images: string[]) => void;
}

const UploadImageView: React.FC<UploadImageViewProps> = ({ onBack, onConfirm }) => {
  const { isDarkMode } = useApp();
  const [images, setImages] = useState<string[]>([]);

  const handleDelete = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[#F8FAFC] dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom duration-300 font-display overflow-y-auto">
      <style>{`
        :root {
            --surface-page: #F8FAFC;
            --surface-card: #FFFFFF;
            --surface-subtle: #F1F5F9;
            --action-primary: #1978e5;
            --text-on-brand: #FFFFFF;
            --status-error: #EF4444;
            --text-main: #1E293B;
            --text-secondary: #64748B;
            --shadow-card: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
            --shadow-glow: 0 0 15px rgba(25, 120, 229, 0.3);
            --radius-md: 0.375rem;
            --radius-lg: 0.75rem;
            --radius-xl: 1rem;
            --radius-2xl: 1.5rem;
        }
        .shadow-glow {
            box-shadow: var(--shadow-glow);
        }
      `}</style>
      
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Adicionar Imagem</h1>
          <div className="w-10"></div> 
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6 w-full pb-32">
        <section>
          <label className="block w-full cursor-pointer group">
            <input accept="image/png, image/jpeg" className="hidden" multiple type="file" />
            <div className="bg-white dark:bg-slate-900 rounded-[1rem] border-2 border-dashed border-[#1978e5] p-8 flex flex-col items-center justify-center text-center transition-all group-active:scale-[0.99] group-hover:bg-blue-50/30 dark:group-hover:bg-blue-900/10 min-h-[240px]">
              <div className="flex gap-4 mb-4 text-[#1978e5]">
                <span className="material-symbols-outlined text-4xl">photo_camera</span>
                <span className="material-symbols-outlined text-4xl">upload_file</span>
              </div>
              <p className="text-sm font-semibold text-[#1978e5] max-w-[200px]">
                Toque para tirar uma foto ou selecionar da galeria
              </p>
            </div>
          </label>
          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500 text-center px-4">
            Tamanho máximo: 5MB por imagem. Formatos: JPG, PNG.
          </p>
        </section>

        {images.length > 0 && (
          <section className="animate-in fade-in duration-400 ease-out">
            <h2 className="text-sm font-bold uppercase text-slate-400 dark:text-slate-500 mb-4 tracking-wider ml-1">Imagens Selecionadas</h2>
            <div className="grid grid-cols-2 gap-3">
              {images.map((src, index) => (
                <div key={index} className="relative group aspect-square">
                  <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 rounded-[1rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
                    <img alt={`Preview ${index + 1}`} className="w-full h-full object-cover" src={src} />
                  </div>
                  <button 
                    onClick={() => handleDelete(index)}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-[#EF4444] text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors active:scale-90 z-10"
                  >
                    <span className="material-symbols-outlined text-[16px] font-bold">close</span>
                  </button>
                  <div className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg py-1 px-2">
                    <p className="text-[10px] text-white font-medium truncate">
                      {index === 0 ? 'grafico_funcao.jpg' : 'formula_base.png'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-[#F8FAFC] dark:from-slate-950 via-[#F8FAFC] dark:via-slate-950 to-transparent z-30 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button 
            onClick={() => onConfirm(images)}
            className="w-full bg-[#1978e5] text-white font-bold py-4 rounded-[1rem] shadow-glow active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-600"
          >
            <span className="material-symbols-outlined">check_circle</span>
            CONFIRMAR E ANEXAR
          </button>
        </div>
      </div>
      
      {/* Bottom Nav Placeholder to match screenshot layout */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-2 py-2 pb-8 flex justify-between items-end z-50">
        <div className="flex-1 flex justify-center">
          <button className="flex flex-col items-center gap-1 py-1 text-slate-400 dark:text-slate-500 active:text-slate-600 dark:active:text-slate-300 group">
            <span className="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform">home</span>
            <span className="text-[10px] font-medium">Início</span>
          </button>
        </div>
        <div className="flex-1 flex justify-center relative">
          <div className="absolute -top-2 w-12 h-1 bg-[#1978e5] rounded-full shadow-[0_2px_8px_rgba(25,120,229,0.5)]"></div>
          <div className="flex flex-col items-center gap-1 -mt-4">
            <div className="bg-[#1978e5] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/40 border-4 border-white dark:border-slate-900 transform transition-transform active:scale-95">
              <span className="material-symbols-outlined text-2xl">donut_large</span>
            </div>
            <span className="text-[10px] font-bold text-[#1978e5]">Ciclo</span>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <button className="flex flex-col items-center gap-1 py-1 text-slate-400 dark:text-slate-500 active:text-slate-600 dark:active:text-slate-300 group">
            <span className="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform">swords</span>
            <span className="text-[10px] font-medium">Batalha</span>
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          <button className="flex flex-col items-center gap-1 py-1 text-slate-400 dark:text-slate-500 active:text-slate-600 dark:active:text-slate-300 group">
            <span className="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform">stadium</span>
            <span className="text-[10px] font-medium">Coliseu</span>
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          <button className="flex flex-col items-center gap-1 py-1 text-slate-400 dark:text-slate-500 active:text-slate-600 dark:active:text-slate-300 group">
            <span className="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform">more_horiz</span>
            <span className="text-[10px] font-medium">Mais</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default UploadImageView;
