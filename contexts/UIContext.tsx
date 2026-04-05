import React, { createContext, useContext, useState, ReactNode } from 'react';

type OverlayType = 'settings' | 'sounds' | 'subjectSelector' | null;

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'error' | 'achievement';
  icon?: string;
}

interface UIContextType {
  // Overlays
  activeOverlay: OverlayType;
  setActiveOverlay: (overlay: OverlayType) => void;
  
  // Modais
  showStrictActivation: boolean;
  setShowStrictActivation: (show: boolean) => void;
  
  // Seleção Manual
  waitingForManualSelection: boolean;
  setWaitingForManualSelection: (waiting: boolean) => void;
  
  // Search/Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  
  // Helpers
  openOverlay: (overlay: OverlayType) => void;
  closeOverlay: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeOverlay, setActiveOverlay] = useState<OverlayType>(null);
  const [showStrictActivation, setShowStrictActivation] = useState(false);
  const [waitingForManualSelection, setWaitingForManualSelection] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const openOverlay = (overlay: OverlayType) => setActiveOverlay(overlay);
  const closeOverlay = () => setActiveOverlay(null);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const value: UIContextType = {
    activeOverlay,
    setActiveOverlay,
    showStrictActivation,
    setShowStrictActivation,
    waitingForManualSelection,
    setWaitingForManualSelection,
    searchQuery,
    setSearchQuery,
    toasts,
    addToast,
    removeToast,
    openOverlay,
    closeOverlay,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
};