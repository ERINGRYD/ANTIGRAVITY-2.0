import React, { useState, useEffect } from 'react';
import { HierarchyTree } from './types';
import { HierarchicalNode } from './HierarchicalNode';
import { hasCycles } from './utils';

interface HierarchicalMenuProps {
  data: HierarchyTree;
  title?: string;
  className?: string;
}

export const HierarchicalMenu: React.FC<HierarchicalMenuProps> = ({ 
  data, 
  title = "Navegação", 
  className = "" 
}) => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Validar ciclos antes de renderizar
    if (hasCycles(data)) {
      console.error("ERRO: Ciclo de referência detectado na estrutura hierárquica.");
      setError("A estrutura de navegação contém referências circulares e não pôde ser carregada.");
    } else {
      setError(null);
    }
  }, [data]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200" role="alert">
        <strong>Erro de Estrutura:</strong> {error}
      </div>
    );
  }

  const toggleMobileMenu = () => setIsOpenMobile(!isOpenMobile);

  return (
    <>
      {/* Botão Hambúrguer para Mobile */}
      <div className="md:hidden p-4 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <h2 className="font-bold text-slate-800 dark:text-white" id="mobile-menu-title">{title}</h2>
        <button 
          onClick={toggleMobileMenu}
          aria-expanded={isOpenMobile}
          aria-controls="hierarchical-menu-container"
          aria-label="Alternar menu de navegação"
          className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <span className="material-icons-round">
            {isOpenMobile ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Container Principal do Menu */}
      <nav 
        id="hierarchical-menu-container"
        aria-labelledby="mobile-menu-title"
        className={`
          ${className}
          ${isOpenMobile ? 'block' : 'hidden'} 
          md:block
          w-full md:w-80 lg:w-96 shrink-0
          bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
          h-full overflow-y-auto custom-scrollbar
          transition-all duration-300 ease-in-out
        `}
      >
        <div className="hidden md:block p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-lg text-slate-800 dark:text-white" id="desktop-menu-title">{title}</h2>
        </div>
        
        <div className="p-2">
          <ul role="tree" aria-label="Menu Hierárquico" className="flex flex-col w-full text-left">
            {data.map(node => (
              <HierarchicalNode key={node.id} item={node} level={1} />
            ))}
          </ul>
        </div>
      </nav>

      {/* Overlay para mobile quando o menu está aberto */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpenMobile(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};
