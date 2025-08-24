import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Validation schema
const signupSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  document: z.string().optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  acceptTerms: z.boolean().refine(val => val === true, 'Você deve aceitar os termos de uso')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este e-mail já está em uso' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Generate protocol number for welcome
    const protocol = `CC${new Date().getFullYear()}${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`

    // Create user
    const user = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        document: validatedData.document,
        password: hashedPassword,
        verified: false,
        emailVerified: false,
        preferences: {
          create: {
            emailNotifications: true,
            pushNotifications: true,
            language: 'pt-BR',
            theme: 'light'
          }
        }
      },
      include: {
        preferences: true
      }
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    // In a real app, you would:
    // 1. Send verification email
    // 2. Create and return JWT token
    // 3. Send welcome notification

    return NextResponse.json({
      message: 'Conta criada com sucesso! Verifique seu e-mail para ativar sua conta.',
      user: userWithoutPassword,
      protocol
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}