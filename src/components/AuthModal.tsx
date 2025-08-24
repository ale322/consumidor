'use client';

import { useContext } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LoginForm } from '@/components/LoginForm';
import { SignupForm } from '@/components/SignupForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, User, UserPlus } from 'lucide-react';
import { useAuthModal } from '@/contexts/AuthModalContext';

export const AuthModal: React.FC = () => {
  const { isOpen, activeTab, closeModal, switchTab } = useAuthModal();

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      closeModal();
    }
  };

  const handleTabChange = (value: string) => {
    switchTab(value as 'login' | 'signup');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-[#2A5C9A]">
            Central do Consumidor
          </DialogTitle>
        </DialogHeader>

        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger 
              value="login" 
              className="flex items-center gap-2 data-[state=active]:bg-[#2A5C9A] data-[state=active]:text-white clickable"
            >
              <User className="h-4 w-4" />
              Entrar
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              className="flex items-center gap-2 data-[state=active]:bg-[#FF6B35] data-[state=active]:text-white clickable"
            >
              <UserPlus className="h-4 w-4" />
              Cadastrar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-0">
            <div className="space-y-4">
              <LoginForm onSuccess={closeModal} />
            </div>
          </TabsContent>

          <TabsContent value="signup" className="mt-0">
            <div className="space-y-4">
              <SignupForm onSuccess={closeModal} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Botão de fechar personalizado */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground clickable"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </button>
      </DialogContent>
    </Dialog>
  );
};