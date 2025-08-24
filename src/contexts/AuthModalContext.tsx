'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthModalContextType {
  isOpen: boolean;
  activeTab: 'login' | 'signup';
  openModal: (tab?: 'login' | 'signup') => void;
  closeModal: () => void;
  switchTab: (tab: 'login' | 'signup') => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};

interface AuthModalProviderProps {
  children: ReactNode;
}

export const AuthModalProvider: React.FC<AuthModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  const openModal = (tab?: 'login' | 'signup') => {
    setActiveTab(tab || 'login');
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const switchTab = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
  };

  return (
    <AuthModalContext.Provider value={{
      isOpen,
      activeTab,
      openModal,
      closeModal,
      switchTab,
    }}>
      {children}
    </AuthModalContext.Provider>
  );
};