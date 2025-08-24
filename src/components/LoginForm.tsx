'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  AlertCircle, 
  Chrome,
  Loader2
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthModal } from '@/contexts/AuthModalContext';

// Schema de validação com Zod
const loginSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .min(5, 'Email deve ter pelo menos 5 caracteres')
    .max(100, 'Email deve ter no máximo 100 caracteres'),
  password: z.string()
    .min(1, 'Senha é obrigatória')
    .max(50, 'Senha deve ter no máximo 50 caracteres'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const LoginForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { switchTab } = useAuthModal();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Verificar se há mensagem de callback
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const registered = searchParams.get('registered');
  const verified = searchParams.get('verified');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        // Tratamento específico para diferentes tipos de erro
        if (result.error.includes('não encontrado')) {
          setError('Usuário não encontrado. Verifique seu email ou cadastre-se.');
        } else if (result.error.includes('Senha incorreta')) {
          setError('Senha incorreta. Tente novamente.');
        } else if (result.error.includes('não verificado')) {
          setError('Email não verificado. Por favor, verifique seu email.');
        } else if (result.error.includes('provedor social')) {
          setError('Esta conta foi criada com login social. Use o botão do Google para fazer login.');
        } else {
          setError(result.error || 'Erro ao fazer login. Tente novamente.');
        }
      } else {
        // Login bem sucedido
        setSuccess('Login realizado com sucesso!');
        
        // Forçar atualização da sessão
        await getSession();
        
        // Chamar callback de sucesso se existir
        if (onSuccess) {
          onSuccess();
        }
        
        // Redirecionar após breve delay
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 1000);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError('Erro ao fazer login. Verifique sua conexão e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    
    try {
      await signIn('google', { callbackUrl });
    } catch (error: any) {
      console.error('Google login error:', error);
      setError('Erro ao fazer login com Google. Tente novamente.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Por enquanto, vamos apenas mostrar um alerta ou redirecionar para uma página de recuperação
    // Futuramente, isso pode abrir um modal de recuperação de senha
    alert('Função de recuperação de senha será implementada em breve.');
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#2A5C9A]">
            Bem-vindo de volta
          </CardTitle>
          <CardDescription>
            Faça login na sua conta Central do Consumidor
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Success Messages */}
          {registered && (
            <Alert className="border-green-200 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Conta criada com sucesso! Por favor, faça login.
              </AlertDescription>
            </Alert>
          )}

          {verified && (
            <Alert className="border-green-200 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Email verificado com sucesso! Faça login para continuar.
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Google Login Button */}
          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full btn-hover clickable"
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin icon-hover" />
            ) : (
              <Chrome className="mr-2 h-4 w-4 icon-hover" />
            )}
            Continuar com Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou continue com email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="seu@email.com"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-[#2A5C9A] hover:underline link-hover clickable"
                >
                  Esqueceu sua senha?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Sua senha"
                  className="pl-10 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 clickable"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 icon-hover" /> : <Eye className="h-4 w-4 icon-hover" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                {...register('rememberMe')}
                className="clickable"
              />
              <Label htmlFor="rememberMe" className="text-sm clickable">
                Lembrar-me por 30 dias
              </Label>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !isValid}
              className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 btn-hover clickable"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin icon-hover" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Signup Link */}
          <div className="text-center text-sm text-gray-600">
            Não tem uma conta?{' '}
            <button 
              onClick={() => switchTab('signup')}
              className="text-[#2A5C9A] hover:underline font-medium link-hover clickable"
            >
              Cadastre-se gratuitamente
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Security Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">🔒 Segurança garantida</p>
              <p className="text-blue-700">
                Seus dados estão protegidos com criptografia de ponta a ponta. 
                Nunca compartilhamos suas informações com terceiros.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};