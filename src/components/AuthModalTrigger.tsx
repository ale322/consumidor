'use client';

import { ReactNode } from 'react';
import { useAuthModal } from '@/contexts/AuthModalContext';

interface AuthModalTriggerProps {
  children: ReactNode;
  tab?: 'login' | 'signup';
}

export const AuthModalTrigger: React.FC<AuthModalTriggerProps> = ({ 
  children, 
  tab = 'login' 
}) => {
  const { openModal } = useAuthModal();

  return (
    <button 
      onClick={() => openModal(tab)}
      className="clickable"
    >
      {children}
    </button>
  );
};