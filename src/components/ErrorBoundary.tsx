'use client';

import { Component, ErrorInfo, ReactNode, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Aqui você poderia enviar o erro para um serviço de monitoramento
    // como Sentry, LogRocket, etc.
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] to-white flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl text-red-600">
                Oops! Algo deu errado
              </CardTitle>
              <CardDescription>
                Encontramos um problema inesperado. Nossa equipe foi notificada e está trabalhando para resolver.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <div className="font-medium mb-1">Erro (Development Mode):</div>
                    <div className="font-mono text-xs bg-gray-100 p-2 rounded">
                      {this.state.error.message}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar Novamente
                </Button>
                <Button 
                  onClick={this.handleGoHome}
                  className="flex-1 bg-[#FF6B35] hover:bg-[#FF6B35]/90"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Página Inicial
                </Button>
              </div>

              <div className="text-center text-sm text-gray-500">
                Se o problema persistir, entre em contato com nosso suporte.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Componente para tratamento de erros em API calls
interface ApiErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error) => void;
}

export const ApiErrorBoundary: React.FC<ApiErrorBoundaryProps> = ({ 
  children, 
  onError 
}) => {
  const [error, setError] = useState<Error | null>(null);

  const handleError = (err: Error) => {
    console.error('API Error:', err);
    setError(err);
    if (onError) {
      onError(err);
    }
  };

  const handleReset = () => {
    setError(null);
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div className="flex-1">
              <h4 className="font-medium text-red-800">Erro de Conexão</h4>
              <p className="text-sm text-red-700 mt-1">
                Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handleReset}>
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Tentar Novamente
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

// Hook para tratamento de erros em operações assíncronas
export const useAsyncOperation = <T,>(
  asyncFunction: () => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    onFinally?: () => void;
  } = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction();
      setData(result);
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      if (options.onError) {
        options.onError(error);
      }
      throw error;
    } finally {
      setLoading(false);
      if (options.onFinally) {
        options.onFinally();
      }
    }
  };

  return {
    data,
    error,
    loading,
    execute,
    reset: () => {
      setData(null);
      setError(null);
      setLoading(false);
    },
  };
};

// Componente para mostrar mensagens de erro de forma amigável
interface ErrorMessageProps {
  error: Error | string;
  className?: string;
  showDetails?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  error, 
  className = '',
  showDetails = false 
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  const getFriendlyMessage = (message: string): string => {
    // Mapear mensagens de erro comuns para versões amigáveis
    const errorMap: Record<string, string> = {
      'Network Error': 'Erro de conexão. Verifique sua internet e tente novamente.',
      'Failed to fetch': 'Não foi possível conectar ao servidor.',
      'Authentication required': 'Você precisa estar autenticado para acessar esta página.',
      'Permission denied': 'Você não tem permissão para realizar esta ação.',
      'Not found': 'O recurso solicitado não foi encontrado.',
      'Invalid input': 'Dados inválidos. Verifique as informações e tente novamente.',
      'Email already in use': 'Este email já está em uso. Por favor, use outro email.',
      'User not found': 'Usuário não encontrado. Verifique suas credenciais.',
      'Invalid password': 'Senha incorreta. Tente novamente.',
    };

    return errorMap[message] || message;
  };

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        {getFriendlyMessage(errorMessage)}
        {showDetails && typeof error === 'object' && error.stack && (
          <details className="mt-2">
            <summary className="cursor-pointer text-xs font-medium">
              Ver detalhes técnicos
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </AlertDescription>
    </Alert>
  );
};