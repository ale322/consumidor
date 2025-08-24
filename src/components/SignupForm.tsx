'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  AlertCircle, 
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthModal } from '@/contexts/AuthModalContext';

// Schema de validação com Zod
const signupSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  email: z.string()
    .email('Email inválido')
    .min(5, 'Email deve ter pelo menos 5 caracteres')
    .max(100, 'Email deve ter no máximo 100 caracteres'),
  phone: z.string()
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .max(15, 'Telefone deve ter no máximo 15 dígitos')
    .regex(/^\d+$/, 'Telefone deve conter apenas números'),
  document: z.string()
    .min(11, 'Documento deve ter pelo menos 11 dígitos')
    .max(14, 'Documento deve ter no máximo 14 dígitos')
    .regex(/^\d+$/, 'Documento deve conter apenas números'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(50, 'Senha deve ter no máximo 50 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, 'Você deve aceitar os termos de uso'),
  acceptPrivacy: z.boolean().refine(val => val === true, 'Você deve aceitar a política de privacidade'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

interface FormErrors {
  [key: string]: string;
}

export const SignupForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const router = useRouter();
  const { switchTab } = useAuthModal();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors: formErrors, isValid },
    trigger,
    getValues
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      acceptTerms: false,
      acceptPrivacy: false,
    },
  });

  const watchedValues = watch();

  const validateStep = async (step: number) => {
    let fieldsToValidate: (keyof SignupFormData)[] = [];

    switch (step) {
      case 1:
        fieldsToValidate = ['name', 'email', 'phone', 'document'];
        break;
      case 2:
        fieldsToValidate = ['password', 'confirmPassword'];
        break;
      case 3:
        fieldsToValidate = ['acceptTerms', 'acceptPrivacy'];
        break;
    }

    const isValid = await trigger(fieldsToValidate);
    return isValid;
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setServerError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          document: data.document,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao criar conta');
      }

      setSuccess('Conta criada com sucesso! Verifique seu email para ativar sua conta.');
      
      // Chamar callback de sucesso se existir
      if (onSuccess) {
        onSuccess();
      }
      
      // Mudar para a aba de login após 3 segundos
      setTimeout(() => {
        switchTab('login');
      }, 3000);

    } catch (error: any) {
      setServerError(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return strength;
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 2) return 'Fraca';
    if (strength <= 4) return 'Média';
    return 'Forte';
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#2A5C9A]">
            Criar Conta
          </CardTitle>
          <CardDescription>
            Junte-se à Central do Consumidor e defenda seus direitos
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Steps */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step ? 'bg-[#FF6B35] text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      currentStep > step ? 'bg-[#FF6B35]' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-gray-600">
              {currentStep === 1 && 'Informações Pessoais'}
              {currentStep === 2 && 'Segurança'}
              {currentStep === 3 && 'Termos e Condições'}
            </div>
          </div>

          {/* Server Error */}
          {serverError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="João Silva"
                      className="pl-10"
                    />
                  </div>
                  {formErrors.name && (
                    <p className="text-sm text-red-600">{formErrors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="joao.silva@email.com"
                      className="pl-10"
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-sm text-red-600">{formErrors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="11999999999"
                      className="pl-10"
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="text-sm text-red-600">{formErrors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document">CPF/CNPJ *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="document"
                      {...register('document')}
                      placeholder="00000000000"
                      className="pl-10"
                    />
                  </div>
                  {formErrors.document && (
                    <p className="text-sm text-red-600">{formErrors.document.message}</p>
                  )}
                </div>

                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 btn-hover clickable"
                >
                  Próximo
                  <ArrowRight className="ml-2 h-4 w-4 icon-hover" />
                </Button>
              </div>
            )}

            {/* Step 2: Password */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      placeholder="Crie uma senha forte"
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 clickable"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 icon-hover" /> : <Eye className="h-4 w-4 icon-hover" />}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-sm text-red-600">{formErrors.password.message}</p>
                  )}
                  
                  {/* Password Strength Indicator */}
                  {watchedValues.password && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Força da senha:</span>
                        <span className="text-sm font-medium">
                          {getPasswordStrengthText(getPasswordStrength(watchedValues.password))}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(getPasswordStrength(watchedValues.password))}`}
                          style={{ width: `${(getPasswordStrength(watchedValues.password) / 6) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      placeholder="Confirme sua senha"
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 clickable"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4 icon-hover" /> : <Eye className="h-4 w-4 icon-hover" />}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="text-sm text-red-600">{formErrors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 btn-hover clickable">
                    <ArrowLeft className="mr-2 h-4 w-4 icon-hover" />
                    Anterior
                  </Button>
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    className="flex-1 bg-[#FF6B35] hover:bg-[#FF6B35]/90 btn-hover clickable"
                  >
                    Próximo
                    <ArrowRight className="ml-2 h-4 w-4 icon-hover" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Terms */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Controller
                      name="acceptTerms"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="acceptTerms"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="clickable"
                        />
                      )}
                    />
                    <label htmlFor="acceptTerms" className="text-sm text-gray-600 leading-relaxed clickable">
                      Eu li e concordo com os{' '}
                      <a href="/termos" className="text-[#2A5C9A] hover:underline link-hover clickable">
                        Termos de Uso
                      </a>{' '}
                      da plataforma Central do Consumidor.
                    </label>
                  </div>
                  {formErrors.acceptTerms && (
                    <p className="text-sm text-red-600">{formErrors.acceptTerms.message}</p>
                  )}

                  <div className="flex items-start space-x-2">
                    <Controller
                      name="acceptPrivacy"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="acceptPrivacy"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="clickable"
                        />
                      )}
                    />
                    <label htmlFor="acceptPrivacy" className="text-sm text-gray-600 leading-relaxed clickable">
                      Eu li e concordo com a{' '}
                      <a href="/privacidade" className="text-[#2A5C9A] hover:underline link-hover clickable">
                        Política de Privacidade
                      </a>{' '}
                      e autorizo o tratamento dos meus dados.
                    </label>
                  </div>
                  {formErrors.acceptPrivacy && (
                    <p className="text-sm text-red-600">{formErrors.acceptPrivacy.message}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1 btn-hover clickable">
                    <ArrowLeft className="mr-2 h-4 w-4 icon-hover" />
                    Anterior
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="flex-1 bg-[#FF6B35] hover:bg-[#FF6B35]/90 btn-hover clickable"
                  >
                    {isLoading ? 'Criando conta...' : 'Criar Conta'}
                  </Button>
                </div>
              </div>
            )}
          </form>

          {/* Login Link */}
          <div className="text-center text-sm text-gray-600">
            Já tem uma conta?{' '}
            <button 
              onClick={() => switchTab('login')}
              className="text-[#2A5C9A] hover:underline font-medium link-hover clickable"
            >
              Faça login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};