import React, { createContext, useContext, useState } from 'react';

interface UIContextType {
  activeFilter: string;
  selectedTag: string | null;
  activeThreadId: string | null;
  setActiveFilter: (filter: string) => void;
  setSelectedTag: (tag: string | null) => void;
  setActiveThreadId: (threadId: string | null) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

interface UIProviderProps {
  children: React.ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [activeFilter, setActiveFilter] = useState<string>('unarchived');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  return (
    <UIContext.Provider
      value={{
        activeFilter,
        selectedTag,
        activeThreadId,
        setActiveFilter,
        setSelectedTag,
        setActiveThreadId,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};
