import { z } from 'zod';

// Esquemas de validação para diferentes entidades do sistema

// Validação de usuário
export const userValidationSchemas = {
  register: z.object({
    name: z.string()
      .min(3, 'Nome deve ter pelo menos 3 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres')
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
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
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  }),

  login: z.object({
    email: z.string()
      .email('Email inválido')
      .min(5, 'Email deve ter pelo menos 5 caracteres')
      .max(100, 'Email deve ter no máximo 100 caracteres'),
    password: z.string()
      .min(1, 'Senha é obrigatória')
      .max(50, 'Senha deve ter no máximo 50 caracteres'),
    rememberMe: z.boolean().optional(),
  }),

  updateProfile: z.object({
    name: z.string()
      .min(3, 'Nome deve ter pelo menos 3 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres')
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços')
      .optional(),
    phone: z.string()
      .min(10, 'Telefone deve ter pelo menos 10 dígitos')
      .max(15, 'Telefone deve ter no máximo 15 dígitos')
      .regex(/^\d+$/, 'Telefone deve conter apenas números')
      .optional(),
    avatar: z.string()
      .url('URL da avatar inválida')
      .optional(),
  }),
};

// Validação de reclamação
export const complaintValidationSchemas = {
  create: z.object({
    title: z.string()
      .min(5, 'Título deve ter pelo menos 5 caracteres')
      .max(200, 'Título deve ter no máximo 200 caracteres'),
    description: z.string()
      .min(20, 'Descrição deve ter pelo menos 20 caracteres')
      .max(2000, 'Descrição deve ter no máximo 2000 caracteres'),
    category: z.string()
      .min(1, 'Categoria é obrigatória'),
    subcategory: z.string()
      .min(1, 'Subcategoria é obrigatória'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], {
      errorMap: () => ({ message: 'Prioridade inválida' }),
    }),
    companyId: z.string()
      .min(1, 'Empresa é obrigatória'),
    documents: z.array(z.string().url('URL de documento inválida')).optional(),
  }),

  update: z.object({
    title: z.string()
      .min(5, 'Título deve ter pelo menos 5 caracteres')
      .max(200, 'Título deve ter no máximo 200 caracteres')
      .optional(),
    description: z.string()
      .min(20, 'Descrição deve ter pelo menos 20 caracteres')
      .max(2000, 'Descrição deve ter no máximo 2000 caracteres')
      .optional(),
    status: z.enum(['ANALYSIS', 'WAITING', 'RESPONDED', 'RESOLVED', 'NOT_RESOLVED', 'CANCELLED'], {
      errorMap: () => ({ message: 'Status inválido' }),
    }).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], {
      errorMap: () => ({ message: 'Prioridade inválida' }),
    }).optional(),
  }),
};

// Validação de empresa
export const companyValidationSchemas = {
  create: z.object({
    name: z.string()
      .min(2, 'Nome da empresa deve ter pelo menos 2 caracteres')
      .max(100, 'Nome da empresa deve ter no máximo 100 caracteres'),
    cnpj: z.string()
      .min(14, 'CNPJ deve ter 14 dígitos')
      .max(14, 'CNPJ deve ter 14 dígitos')
      .regex(/^\d+$/, 'CNPJ deve conter apenas números')
      .optional(),
    category: z.string()
      .min(1, 'Categoria é obrigatória'),
    description: z.string()
      .max(500, 'Descrição deve ter no máximo 500 caracteres')
      .optional(),
    website: z.string()
      .url('Website inválido')
      .optional(),
    logo: z.string()
      .url('URL do logo inválida')
      .optional(),
  }),

  update: z.object({
    name: z.string()
      .min(2, 'Nome da empresa deve ter pelo menos 2 caracteres')
      .max(100, 'Nome da empresa deve ter no máximo 100 caracteres')
      .optional(),
    category: z.string()
      .min(1, 'Categoria é obrigatória')
      .optional(),
    description: z.string()
      .max(500, 'Descrição deve ter no máximo 500 caracteres')
      .optional(),
    website: z.string()
      .url('Website inválido')
      .optional(),
    logo: z.string()
      .url('URL do logo inválida')
      .optional(),
  }),
};

// Validação de serviço de escalonamento
export const escalationValidationSchemas = {
  create: z.object({
    complaintId: z.string()
      .min(1, 'ID da reclamação é obrigatório'),
    reason: z.string()
      .min(10, 'Motivo deve ter pelo menos 10 caracteres')
      .max(500, 'Motivo deve ter no máximo 500 caracteres'),
    additionalInfo: z.string()
      .max(1000, 'Informações adicionais devem ter no máximo 1000 caracteres')
      .optional(),
  }),

  update: z.object({
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], {
      errorMap: () => ({ message: 'Status inválido' }),
    }),
    documents: z.array(z.string().url('URL de documento inválida')).optional(),
  }),
};

// Funções utilitárias de validação
export const validationUtils = {
  // Validar CPF
  validateCPF: (cpf: string): boolean => {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Calcular primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf[9])) return false;
    
    // Calcular segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf[10])) return false;
    
    return true;
  },

  // Validar CNPJ
  validateCNPJ: (cnpj: string): boolean => {
    cnpj = cnpj.replace(/\D/g, '');
    
    if (cnpj.length !== 14) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    
    // Calcular primeiro dígito verificador
    let sum = 0;
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj[i]) * weights1[i];
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    if (digit1 !== parseInt(cnpj[12])) return false;
    
    // Calcular segundo dígito verificador
    sum = 0;
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj[i]) * weights2[i];
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    if (digit2 !== parseInt(cnpj[13])) return false;
    
    return true;
  },

  // Validar telefone
  validatePhone: (phone: string): boolean => {
    const cleanedPhone = phone.replace(/\D/g, '');
    return cleanedPhone.length >= 10 && cleanedPhone.length <= 15 && /^\d+$/.test(cleanedPhone);
  },

  // Validar força da senha
  validatePasswordStrength: (password: string): { score: number; feedback: string[] } => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length < 8) {
      feedback.push('Senha deve ter pelo menos 8 caracteres');
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('Senha deve conter pelo menos uma letra minúscula');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Senha deve conter pelo menos uma letra maiúscula');
    } else {
      score += 1;
    }

    if (!/[0-9]/.test(password)) {
      feedback.push('Senha deve conter pelo menos um número');
    } else {
      score += 1;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      feedback.push('Senha deve conter pelo menos um caractere especial');
    } else {
      score += 1;
    }

    return { score, feedback };
  },

  // Sanitizar entrada de texto
  sanitizeInput: (input: string): string => {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remover scripts
      .replace(/javascript:/gi, '') // Remover javascript:
      .replace(/on\w+\s*=/gi, ''); // Remover event handlers
  },

  // Validar URL
  validateURL: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Validar formato de email
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
};

// Tipos de erro personalizados
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

// Função para formatar erros de validação do Zod
export const formatZodError = (error: z.ZodError): Record<string, string[]> => {
  const formattedErrors: Record<string, string[]> = {};
  
  error.errors.forEach((err) => {
    const field = err.path.join('.');
    if (!formattedErrors[field]) {
      formattedErrors[field] = [];
    }
    formattedErrors[field].push(err.message);
  });
  
  return formattedErrors;
};

// Função para validar e sanitizar dados
export const validateAndSanitize = <T>(
  data: any,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: Record<string, string[]> } => {
  try {
    const sanitizedData = schema.parse(data);
    return { success: true, data: sanitizedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: formatZodError(error) };
    }
    return { 
      success: false, 
      errors: { general: ['Erro de validação desconhecido'] } 
    };
  }
};