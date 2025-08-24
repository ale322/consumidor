import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Validation schema
const complaintSchema = z.object({
  category: z.string().min(1, 'Categoria é obrigatória'),
  companyId: z.string().min(1, 'Empresa é obrigatória'),
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  documents: z.array(z.string()).optional(),
  channels: z.array(z.string()).optional()
})

// Channel recommendations based on category and priority
const getChannelRecommendations = (category: string, priority: string) => {
  const baseChannels = ['Procon']
  
  switch (category) {
    case 'telecom':
      baseChannels.push('Anatel', 'Reclame Aqui', 'Ouvidoria da Empresa')
      break
    case 'banking':
      baseChannels.push('Banco Central', 'Reclame Aqui', 'Ouvidoria do Banco')
      break
    case 'retail':
      baseChannels.push('Procon', 'Reclame Aqui', 'Ouvidoria da Empresa')
      break
    case 'health':
      baseChannels.push('ANS', 'Reclame Aqui', 'Ouvidoria da Empresa')
      break
    case 'education':
      baseChannels.push('MEC', 'Reclame Aqui', 'Ouvidoria da Instituição')
      break
    default:
      baseChannels.push('Reclame Aqui', 'Ouvidoria da Empresa')
  }
  
  // Add high-priority channels
  if (priority === 'HIGH' || priority === 'URGENT') {
    baseChannels.push('Ministério Público', 'Defensoria Pública')
  }
  
  return [...new Set(baseChannels)] // Remove duplicates
}

// Generate protocol number
const generateProtocol = () => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  return `CC${new Date().getFullYear()}${timestamp.toString().slice(-6)}${random.toString().padStart(4, '0')}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = complaintSchema.parse(body)
    
    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }
    
    // Get company info
    const company = await db.company.findUnique({
      where: { id: validatedData.companyId }
    })
    
    if (!company) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      )
    }
    
    // Get channel recommendations
    const recommendedChannels = getChannelRecommendations(validatedData.category, validatedData.priority)
    
    // Generate protocol
    const protocol = generateProtocol()
    
    // Create complaint
    const complaint = await db.complaint.create({
      data: {
        userId: session.user.id,
        companyId: validatedData.companyId,
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        priority: validatedData.priority,
        protocol,
        status: 'ANALYSIS',
        channels: JSON.stringify(recommendedChannels),
        documents: validatedData.documents ? JSON.stringify(validatedData.documents) : null,
        estimatedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      include: {
        company: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    // Create initial update
    await db.complaintUpdate.create({
      data: {
        complaintId: complaint.id,
        message: 'Reclamação registrada com sucesso. Aguardando análise inicial.',
        source: 'system',
        metadata: JSON.stringify({
          action: 'created',
          channels: recommendedChannels,
          priority: validatedData.priority
        })
      }
    })
    
    // Create notification
    await db.notification.create({
      data: {
        userId: complaint.userId,
        complaintId: complaint.id,
        title: 'Nova reclamação registrada',
        message: `Sua reclamação "${complaint.title}" foi registrada com protocolo ${protocol}`,
        type: 'COMPLAINT_CREATED',
        metadata: JSON.stringify({
          protocol,
          priority: validatedData.priority
        })
      }
    })
    
    // Send WebSocket notification (if socket.io is available)
    try {
      // This would typically be handled by the socket.io server
      // For now, we'll just log it
      console.log('WebSocket notification would be sent for new complaint:', {
        userId: complaint.userId,
        complaintId: complaint.id,
        type: 'NEW_COMPLAINT'
      })
    } catch (socketError) {
      console.error('WebSocket notification error:', socketError)
      // Don't fail the request if WebSocket fails
    }
    
    return NextResponse.json({
      message: 'Reclamação registrada com sucesso',
      complaint: {
        ...complaint,
        channels: recommendedChannels,
        documents: validatedData.documents || []
      },
      recommendations: {
        channels: recommendedChannels,
        explanation: `Baseado na categoria "${validatedData.category}" e prioridade "${validatedData.priority}", recomendamos os seguintes canais para máxima eficácia:`,
        estimatedResolutionTime: '30 dias'
      }
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Complaint creation error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    
    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }
    
    // Users can only see their own complaints
    if (userId && userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      )
    }
    
    const whereClause: any = { userId: session.user.id }
    
    if (status && status !== 'all') {
      whereClause.status = status
    }
    
    if (category && category !== 'all') {
      whereClause.category = category
    }
    
    const complaints = await db.complaint.findMany({
      where: whereClause,
      include: {
        company: true,
        updates: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Parse JSON fields
    const processedComplaints = complaints.map(complaint => ({
      ...complaint,
      channels: complaint.channels ? JSON.parse(complaint.channels) : [],
      documents: complaint.documents ? JSON.parse(complaint.documents) : []
    }))
    
    return NextResponse.json({
      complaints: processedComplaints,
      total: processedComplaints.length
    })
    
  } catch (error) {
    console.error('Complaint fetch error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}