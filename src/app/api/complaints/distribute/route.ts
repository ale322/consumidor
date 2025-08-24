import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { externalAPIService } from '@/lib/externalAPI'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Validation schema
const distributeSchema = z.object({
  complaintId: z.string().min(1, 'ID da reclamação é obrigatório'),
  selectedChannels: z.array(z.string()).min(1, 'Selecione pelo menos um canal'),
  customMessage: z.string().optional(),
  authorizeDistribution: z.boolean().refine(val => val === true, 'Autorização é obrigatória')
})

// Channel effectiveness data (mock - in real app, this would come from historical data)
const channelEffectiveness = {
  'Procon': { successRate: 0.75, avgTime: 45, cost: 0 },
  'Reclame Aqui': { successRate: 0.65, avgTime: 30, cost: 0 },
  'Anatel': { successRate: 0.80, avgTime: 60, cost: 0 },
  'Banco Central': { successRate: 0.85, avgTime: 90, cost: 0 },
  'ANS': { successRate: 0.78, avgTime: 75, cost: 0 },
  'MEC': { successRate: 0.70, avgTime: 120, cost: 0 },
  'Ouvidoria da Empresa': { successRate: 0.55, avgTime: 15, cost: 0 },
  'Ministério Público': { successRate: 0.90, avgTime: 180, cost: 0 },
  'Defensoria Pública': { successRate: 0.88, avgTime: 150, cost: 0 }
}

// Calculate effectiveness score for channels
const calculateChannelScore = (channel: string, category: string, priority: string) => {
  const effectiveness = channelEffectiveness[channel as keyof typeof channelEffectiveness]
  if (!effectiveness) return 0
  
  let score = effectiveness.successRate * 100
  
  // Adjust based on priority
  if (priority === 'URGENT') {
    score += (effectiveness.avgTime < 60 ? 20 : -10)
  } else if (priority === 'HIGH') {
    score += (effectiveness.avgTime < 90 ? 15 : -5)
  }
  
  // Adjust based on category
  const categoryMultipliers: Record<string, Record<string, number>> = {
    'telecom': { 'Anatel': 1.3, 'Procon': 1.1 },
    'banking': { 'Banco Central': 1.4, 'Procon': 1.2 },
    'health': { 'ANS': 1.3, 'Procon': 1.1 },
    'education': { 'MEC': 1.3, 'Procon': 1.1 }
  }
  
  const multiplier = categoryMultipliers[category]?.[channel] || 1.0
  score *= multiplier
  
  return Math.round(score)
}

// Generate explanation for channel recommendation
const generateExplanation = (channel: string, score: number, category: string, priority: string) => {
  const effectiveness = channelEffectiveness[channel as keyof typeof channelEffectiveness]
  if (!effectiveness) return ''
  
  let explanation = `${channel}: Taxa de sucesso de ${Math.round(effectiveness.successRate * 100)}%`
  
  if (effectiveness.avgTime <= 30) {
    explanation += ', tempo médio de resolução rápido (até 30 dias)'
  } else if (effectiveness.avgTime <= 90) {
    explanation += ', tempo médio de resolução moderado (30-90 dias)'
  } else {
    explanation += ', tempo médio de resolução mais longo (90+ dias)'
  }
  
  // Add category-specific reasoning
  if (category === 'telecom' && channel === 'Anatel') {
    explanation += '. Especializado em regulamentação de telecomunicações'
  } else if (category === 'banking' && channel === 'Banco Central') {
    explanation += '. Autoridade máxima em questões bancárias'
  } else if (category === 'health' && channel === 'ANS') {
    explanation += '. Agência reguladora de saúde suplementar'
  } else if (category === 'education' && channel === 'MEC') {
    explanation += '. Ministério responsável pela educação'
  }
  
  // Add priority-specific reasoning
  if (priority === 'URGENT' && effectiveness.avgTime > 90) {
    explanation += '. Não recomendado para casos urgentes devido ao tempo de resposta'
  } else if (priority === 'URGENT' && effectiveness.avgTime <= 30) {
    explanation += '. Excelente para casos urgentes'
  }
  
  return explanation
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = distributeSchema.parse(body)
    
    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }
    
    // Get complaint details
    const complaint = await db.complaint.findUnique({
      where: { id: validatedData.complaintId },
      include: {
        company: true,
        user: true
      }
    })
    
    if (!complaint) {
      return NextResponse.json(
        { error: 'Reclamação não encontrada' },
        { status: 404 }
      )
    }
    
    // Check if user owns the complaint
    if (complaint.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      )
    }
    
    // Calculate channel scores and generate explanations
    const channelAnalysis = validatedData.selectedChannels.map(channel => {
      const score = calculateChannelScore(channel, complaint.category, complaint.priority)
      const explanation = generateExplanation(channel, score, complaint.category, complaint.priority)
      const effectiveness = channelEffectiveness[channel as keyof typeof channelEffectiveness]
      
      return {
        channel,
        score,
        explanation,
        effectiveness: effectiveness || { successRate: 0, avgTime: 0, cost: 0 },
        recommended: score >= 70
      }
    })
    
    // Sort by score
    channelAnalysis.sort((a, b) => b.score - a.score)
    
    // Submit to external APIs
    let externalSubmissionResults: any[] = []
    let trackingUrls: string[] = []
    
    try {
      const externalResults = await externalAPIService.submitToMultipleChannels({
        title: complaint.title,
        description: complaint.description,
        company: complaint.company.name,
        category: complaint.category,
        priority: complaint.priority,
        userEmail: complaint.user.email,
        userName: complaint.user.name,
        userPhone: complaint.user.phone,
        userDocument: complaint.user.document
      })
      
      externalSubmissionResults = externalResults.results
      trackingUrls = externalResults.trackingUrls
    } catch (error) {
      console.error('Error submitting to external APIs:', error)
      // Continue with internal processing even if external APIs fail
    }
    
    // Update complaint with selected channels and external tracking info
    await db.complaint.update({
      where: { id: validatedData.complaintId },
      data: {
        channels: JSON.stringify(validatedData.selectedChannels),
        status: 'WAITING', // Update status to waiting response
        externalTracking: JSON.stringify({
          submissions: externalSubmissionResults,
          trackingUrls,
          submittedAt: new Date().toISOString()
        })
      }
    })
    
    // Create distribution update
    await db.complaintUpdate.create({
      data: {
        complaintId: validatedData.complaintId,
        message: `Reclamação distribuída para os canais: ${validatedData.selectedChannels.join(', ')}. ${trackingUrls.length > 0 ? `Links de acompanhamento: ${trackingUrls.join(', ')}` : ''}`,
        source: 'system',
        metadata: JSON.stringify({
          action: 'distributed',
          channels: validatedData.selectedChannels,
          channelAnalysis,
          customMessage: validatedData.customMessage,
          externalSubmissions: externalSubmissionResults,
          trackingUrls
        })
      }
    })
    
    // Create notification
    await db.notification.create({
      data: {
        userId: complaint.userId,
        complaintId: validatedData.complaintId,
        title: 'Reclamação distribuída',
        message: `Sua reclamação foi enviada para ${validatedData.selectedChannels.length} canal(is)${trackingUrls.length > 0 ? ' com links de acompanhamento' : ''}`,
        type: 'COMPLAINT_UPDATED',
        metadata: JSON.stringify({
          action: 'distributed',
          channels: validatedData.selectedChannels,
          estimatedResolution: Math.min(...channelAnalysis.map(c => c.effectiveness.avgTime)),
          trackingUrls
        })
      }
    })
    
    return NextResponse.json({
      message: 'Reclamação distribuída com sucesso',
      distribution: {
        complaintId: validatedData.complaintId,
        selectedChannels: validatedData.selectedChannels,
        channelAnalysis,
        totalChannels: validatedData.selectedChannels.length,
        recommendedChannels: channelAnalysis.filter(c => c.recommended).length,
        estimatedResolutionTime: Math.min(...channelAnalysis.map(c => c.effectiveness.avgTime)),
        externalSubmissions: externalSubmissionResults,
        trackingUrls,
        successfulExternalSubmissions: externalSubmissionResults.filter((r: any) => r.success).length,
        nextSteps: [
          'Acompanhe o status da sua reclamação no dashboard',
          'Você receberá notificações quando houver atualizações',
          'Responda prontamente a quaisquer solicitações adicionais',
          ...trackingUrls.map((url, index) => `Acompanhe no canal ${index + 1}: ${url}`)
        ]
      }
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Distribution error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const complaintId = searchParams.get('complaintId')
    
    if (!complaintId) {
      return NextResponse.json(
        { error: 'ID da reclamação é obrigatório' },
        { status: 400 }
      )
    }
    
    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }
    
    // Get complaint details
    const complaint = await db.complaint.findUnique({
      where: { id: complaintId },
      include: {
        company: true,
        user: true
      }
    })
    
    if (!complaint) {
      return NextResponse.json(
        { error: 'Reclamação não encontrada' },
        { status: 404 }
      )
    }
    
    // Check if user owns the complaint
    if (complaint.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      )
    }
    
    // Get smart recommendations using AI
    let smartRecommendations: any = null
    try {
      smartRecommendations = await externalAPIService.generateSmartRecommendations({
        title: complaint.title,
        description: complaint.description,
        company: complaint.company.name,
        category: complaint.category,
        priority: complaint.priority
      })
    } catch (error) {
      console.error('Error generating smart recommendations:', error)
      // Fallback to traditional recommendations
    }
    
    // Get traditional channel recommendations
    const traditionalChannels = getChannelRecommendations(complaint.category, complaint.priority)
    
    // Calculate channel scores and generate explanations
    const channelAnalysis = traditionalChannels.map(channel => {
      const score = calculateChannelScore(channel, complaint.category, complaint.priority)
      const explanation = generateExplanation(channel, score, complaint.category, complaint.priority)
      const effectiveness = channelEffectiveness[channel as keyof typeof channelEffectiveness]
      
      return {
        channel,
        score,
        explanation,
        effectiveness: effectiveness || { successRate: 0, avgTime: 0, cost: 0 },
        recommended: score >= 70
      }
    })
    
    // Sort by score
    channelAnalysis.sort((a, b) => b.score - a.score)
    
    // Merge smart recommendations with traditional analysis
    const finalRecommendations = {
      ...smartRecommendations,
      traditionalAnalysis: {
        recommendedChannels: traditionalChannels,
        channelAnalysis,
        primaryChannels: channelAnalysis.slice(0, 3).map(c => c.channel),
        secondaryChannels: channelAnalysis.slice(3).map(c => c.channel)
      }
    }
    
    return NextResponse.json({
      complaintId,
      category: complaint.category,
      priority: complaint.priority,
      company: complaint.company.name,
      recommendations: finalRecommendations,
      distributionStrategy: {
        reasoning: smartRecommendations 
          ? `Análise combinando IA com dados históricos. Baseado na categoria "${complaint.category}" e prioridade "${complaint.priority}", com ${smartRecommendations.similarCases?.length || 0} casos similares encontrados.`
          : `Baseado na categoria "${complaint.category}" e prioridade "${complaint.priority}", selecionamos canais com maior probabilidade de sucesso e tempo de resolução adequado.`,
        estimatedSuccessRate: smartRecommendations?.successProbability || 75,
        estimatedResolutionTime: smartRecommendations?.estimatedResolutionTime || '30 dias'
      }
    })
    
  } catch (error) {
    console.error('Distribution recommendations error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Helper function to get channel recommendations
function getChannelRecommendations(category: string, priority: string): string[] {
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