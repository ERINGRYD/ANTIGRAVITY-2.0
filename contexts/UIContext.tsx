import React, { createContext, useContext, useState, ReactNode } from 'react';

type OverlayType = 'settings' | 'sounds' | 'subjectSelector' | null;

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

  const openOverlay = (overlay: OverlayType) => setActiveOverlay(overlay);
  const closeOverlay = () => setActiveOverlay(null);

  const value: UIContextType = {
    activeOverlay,
    setActiveOverlay,
    showStrictActivation,
    setShowStrictActivation,
    waitingForManualSelection,
    setWaitingForManualSelection,
    searchQuery,
    setSearchQuery,
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