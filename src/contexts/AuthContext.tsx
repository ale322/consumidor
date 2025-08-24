'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  document?: string;
  avatar?: string;
  verified: boolean;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: ProfileData) => Promise<void>;
  isAuthenticated: boolean;
  error: string | null;
  clearError: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  document: string;
  password: string;
}

interface ProfileData {
  name?: string;
  phone?: string;
  avatar?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar usuário com a sessão
  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id as string,
        name: session.user.name || '',
        email: session.user.email || '',
        phone: session.user.phone as string,
        document: session.user.document as string,
        avatar: session.user.image as string,
        verified: session.user.verified as boolean,
        emailVerified: session.user.emailVerified as boolean,
      });
    } else {
      setUser(null);
    }
    
    if (status !== 'loading') {
      setLoading(false);
    }
  }, [session, status]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer login');
      }

      // O NextAuth irá redirecionar automaticamente
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao criar conta');
      }

      // Sucesso - o usuário será redirecionado para login
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      await signOut({ callbackUrl: '/' });
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: ProfileData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao atualizar perfil');
      }

      // Atualizar usuário local
      if (user) {
        setUser({
          ...user,
          ...data,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar perfil');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading: loading || status === 'loading',
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};