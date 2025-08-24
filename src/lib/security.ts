import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from 'express-rate-limit';
import { createHash } from 'crypto';

// Configuração de Rate Limiting
interface RateLimitConfig {
  windowMs: number; // Janela de tempo em milissegundos
  max: number; // Máximo de requisições por janela
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Store em memória para rate limiting (em produção, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: config.windowMs,
      max: config.max,
      message: config.message || 'Too many requests, please try again later.',
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      skipFailedRequests: config.skipFailedRequests || false,
    };
  }

  check(key: string): { success: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      // Criar novo registro
      const resetTime = now + this.config.windowMs;
      rateLimitStore.set(key, { count: 1, resetTime });
      return { success: true, remaining: this.config.max - 1, resetTime };
    }

    if (record.count >= this.config.max) {
      return { success: false, remaining: 0, resetTime: record.resetTime };
    }

    record.count++;
    rateLimitStore.set(key, record);
    return { success: true, remaining: this.config.max - record.count, resetTime: record.resetTime };
  }

  middleware(keyGenerator: (req: NextRequest) => string) {
    return async (req: NextRequest): Promise<NextResponse | null> => {
      const key = keyGenerator(req);
      const result = this.check(key);

      if (!result.success) {
        return NextResponse.json(
          { message: this.config.message },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': this.config.max.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': result.resetTime.toString(),
              'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            }
          }
        );
      }

      // Adicionar headers de rate limit à resposta
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', this.config.max.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString());

      return null; // Continuar com a requisição normal
    };
  }
}

// Instâncias de rate limiting para diferentes endpoints
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas de login por 15 minutos
  message: 'Muitas tentativas de login. Por favor, aguarde 15 minutos e tente novamente.',
});

export const registerRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 tentativas de registro por hora
  message: 'Muitas tentativas de registro. Por favor, aguarde 1 hora e tente novamente.',
});

export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por 15 minutos
  message: 'Limite de requisições excedido. Por favor, aguarde 15 minutos.',
});

// Funções de segurança
export const securityUtils = {
  // Gerar CSRF token
  generateCSRFToken: (): string => {
    return createHash('sha256')
      .update(Math.random().toString(36) + Date.now().toString())
      .digest('hex');
  },

  // Validar CSRF token
  validateCSRFToken: (token: string, sessionToken: string): boolean => {
    return token === sessionToken;
  },

  // Sanitizar entrada para prevenir XSS
  sanitizeInput: (input: string): string => {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  // Validar e sanitizar objeto
  sanitizeObject: (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => securityUtils.sanitizeObject(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = securityUtils.sanitizeInput(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = securityUtils.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  },

  // Gerar token seguro
  generateSecureToken: (length: number = 32): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Validar força da senha
  validatePasswordStrength: (password: string): {
    isStrong: boolean;
    score: number;
    feedback: string[];
  } => {
    const feedback: string[] = [];
    let score = 0;

    // Comprimento
    if (password.length < 8) {
      feedback.push('Senha deve ter pelo menos 8 caracteres');
    } else if (password.length >= 12) {
      score += 2;
    } else {
      score += 1;
    }

    // Letras maiúsculas
    if (!/[A-Z]/.test(password)) {
      feedback.push('Senha deve conter pelo menos uma letra maiúscula');
    } else {
      score += 1;
    }

    // Letras minúsculas
    if (!/[a-z]/.test(password)) {
      feedback.push('Senha deve conter pelo menos uma letra minúscula');
    } else {
      score += 1;
    }

    // Números
    if (!/[0-9]/.test(password)) {
      feedback.push('Senha deve conter pelo menos um número');
    } else {
      score += 1;
    }

    // Caracteres especiais
    if (!/[^A-Za-z0-9]/.test(password)) {
      feedback.push('Senha deve conter pelo menos um caractere especial');
    } else {
      score += 1;
    }

    return {
      isStrong: score >= 4 && feedback.length === 0,
      score,
      feedback,
    };
  },

  // Detectar conteúdo suspeito (SQL Injection, XSS, etc.)
  detectSuspiciousContent: (input: string): boolean => {
    const suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Scripts
      /javascript:/gi, // JavaScript
      /on\w+\s*=/gi, // Event handlers
      /SELECT\s+.*FROM\s+/gi, // SQL Injection
      /INSERT\s+INTO\s+/gi, // SQL Injection
      /UPDATE\s+.*SET\s+/gi, // SQL Injection
      /DELETE\s+FROM\s+/gi, // SQL Injection
      /DROP\s+TABLE\s+/gi, // SQL Injection
      /UNION\s+SELECT\s+/gi, // SQL Injection
      /exec\s*\(/gi, // Command injection
      /system\s*\(/gi, // Command injection
      /eval\s*\(/gi, // Code injection
    ];

    return suspiciousPatterns.some(pattern => pattern.test(input));
  },

  // Validar formato de email
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validar telefone
  validatePhone: (phone: string): boolean => {
    const cleanedPhone = phone.replace(/\D/g, '');
    return cleanedPhone.length >= 10 && cleanedPhone.length <= 15;
  },

  // Validar CPF
  validateCPF: (cpf: string): boolean => {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf[9])) return false;
    
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
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    
    let sum = 0;
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj[i]) * weights1[i];
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    if (digit1 !== parseInt(cnpj[12])) return false;
    
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

  // Gerar headers de segurança
  getSecurityHeaders: (): Record<string, string> => {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
    };
  },

  // Limpar store de rate limiting periodicamente
  cleanupRateLimitStore: (): void => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  },
};

// Middleware de segurança para APIs
export const securityMiddleware = async (
  req: NextRequest,
  options: {
    requireAuth?: boolean;
    requireCSRF?: boolean;
    rateLimiter?: RateLimiter;
    validateContentType?: boolean;
  } = {}
): Promise<NextResponse | null> => {
  const {
    requireAuth = false,
    requireCSRF = false,
    rateLimiter,
    validateContentType = true,
  } = options;

  // 1. Rate Limiting
  if (rateLimiter) {
    const keyGenerator = (req: NextRequest) => {
      return req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    };
    
    const rateLimitResponse = await rateLimiter.middleware(keyGenerator)(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }

  // 2. Validar Content-Type para POST/PUT/PATCH
  if (validateContentType && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { message: 'Content-Type must be application/json' },
        { status: 415 }
      );
    }
  }

  // 3. Validar CSRF token (se necessário)
  if (requireCSRF && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const csrfToken = req.headers.get('x-csrf-token');
    const sessionToken = req.headers.get('x-session-token');
    
    if (!csrfToken || !sessionToken || !securityUtils.validateCSRFToken(csrfToken, sessionToken)) {
      return NextResponse.json(
        { message: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
  }

  // 4. Validar autenticação (se necessário)
  if (requireAuth) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Aqui você validaria o token JWT
    // const token = authHeader.substring(7);
    // const isValidToken = await validateJWTToken(token);
    // if (!isValidToken) {
    //   return NextResponse.json(
    //     { message: 'Invalid or expired token' },
    //     { status: 401 }
    //   );
    // }
  }

  return null; // Continuar com a requisição normal
};

// Limpar store periodicamente (em produção, use um agendador)
if (typeof window === 'undefined') {
  setInterval(() => {
    securityUtils.cleanupRateLimitStore();
  }, 5 * 60 * 1000); // Limpar a cada 5 minutos
}