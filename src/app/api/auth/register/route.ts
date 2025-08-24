import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { z } from 'zod';

// Schema de validação para o registro
const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos').max(15),
  document: z.string().min(11, 'Documento deve ter pelo menos 11 dígitos').max(14),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar os dados de entrada
    const validatedData = registerSchema.parse(body);
    
    const { name, email, phone, document, password } = validatedData;

    // Verificar se o email já está em uso
    const existingUserByEmail = await db.user.findUnique({
      where: { email }
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { message: 'Este email já está em uso. Por favor, use outro email ou faça login.' },
        { status: 400 }
      );
    }

    // Verificar se o documento já está em uso
    const existingUserByDocument = await db.user.findUnique({
      where: { document }
    });

    if (existingUserByDocument) {
      return NextResponse.json(
        { message: 'Este documento já está cadastrado. Por favor, faça login.' },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Gerar token de verificação de email
    const emailVerificationToken = Math.random().toString(36).substring(2, 15) + 
                                   Math.random().toString(36).substring(2, 15);
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Criar o usuário
    const user = await db.user.create({
      data: {
        name,
        email,
        phone,
        document,
        password: hashedPassword,
        emailVerificationToken,
        emailVerificationExpires,
        verified: false,
        emailVerified: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        document: true,
        verified: false,
        emailVerified: false,
        createdAt: true,
      }
    });

    // Criar preferências do usuário
    await db.userPreference.create({
      data: {
        userId: user.id,
        emailNotifications: true,
        pushNotifications: true,
        language: 'pt-BR',
        theme: 'light',
      }
    });

    // Enviar email de verificação (simulado)
    // Em produção, você integraria com um serviço de email como SendGrid, AWS SES, etc.
    await sendVerificationEmail(user.email, emailVerificationToken);

    // Retornar resposta de sucesso
    return NextResponse.json({
      message: 'Conta criada com sucesso! Por favor, verifique seu email para ativar sua conta.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    });

  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Erro ao criar conta. Por favor, tente novamente.' },
      { status: 500 }
    );
  }
}

// Função para enviar email de verificação (simulada)
async function sendVerificationEmail(email: string, token: string) {
  // Em produção, você usaria um serviço de email real
  console.log(`Enviando email de verificação para ${email}`);
  console.log(`Token: ${token}`);
  console.log(`Link de verificação: ${process.env.NEXTAUTH_URL}/verify-email?token=${token}`);
  
  // Simulação de envio de email
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return true;
}