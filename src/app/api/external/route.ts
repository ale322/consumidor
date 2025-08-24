import { NextRequest, NextResponse } from 'next/server';
import { externalAPIService } from '@/lib/externalAPI';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const submitToExternalSchema = z.object({
  complaintId: z.string().min(1),
  channels: z.array(z.enum(['reclameaqui', 'procon'])).min(1),
  complaintData: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    company: z.string().min(1),
    category: z.string().min(1),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    userEmail: z.string().email(),
    userName: z.string().min(1),
    userPhone: z.string().optional(),
    userDocument: z.string().optional()
  })
});

const generateRecommendationsSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  company: z.string().min(1),
  category: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'submit_to_external':
        return await handleSubmitToExternal(body);
      case 'generate_recommendations':
        return await handleGenerateRecommendations(body);
      case 'check_status':
        return await handleCheckStatus(body);
      default:
        return NextResponse.json(
          { error: 'Ação inválida' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('External API error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function handleSubmitToExternal(body: any) {
  try {
    const validatedData = submitToExternalSchema.parse(body);
    
    const results = await externalAPIService.submitToMultipleChannels({
      title: validatedData.complaintData.title,
      description: validatedData.complaintData.description,
      company: validatedData.complaintData.company,
      category: validatedData.complaintData.category,
      priority: validatedData.complaintData.priority,
      userEmail: validatedData.complaintData.userEmail,
      userName: validatedData.complaintData.userName,
      userPhone: validatedData.complaintData.userPhone,
      userDocument: validatedData.complaintData.userDocument
    });

    return NextResponse.json({
      message: 'Envio para canais externos concluído',
      results: results.results,
      successfulSubmissions: results.successfulSubmissions,
      trackingUrls: results.trackingUrls
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}

async function handleGenerateRecommendations(body: any) {
  try {
    const validatedData = generateRecommendationsSchema.parse(body);
    
    const recommendations = await externalAPIService.generateSmartRecommendations({
      title: validatedData.title,
      description: validatedData.description,
      company: validatedData.company,
      category: validatedData.category,
      priority: validatedData.priority
    });

    return NextResponse.json({
      message: 'Recomendações geradas com sucesso',
      recommendations
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}

async function handleCheckStatus(body: any) {
  try {
    const { apiName, externalId } = body;
    
    if (!apiName || !externalId) {
      return NextResponse.json(
        { error: 'API name and external ID are required' },
        { status: 400 }
      );
    }

    const result = await externalAPIService.getComplaintStatus(apiName, externalId);
    
    return NextResponse.json({
      message: 'Status verificado com sucesso',
      result
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao verificar status' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'get_apis') {
      return NextResponse.json({
        message: 'APIs disponíveis',
        apis: [
          {
            name: 'Reclame Aqui',
            description: 'Plataforma de reclamações mais popular do Brasil',
            categories: ['Todos'],
            priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
          },
          {
            name: 'Procon',
            description: 'Órgão de proteção ao consumidor',
            categories: ['Todos'],
            priority: ['HIGH', 'URGENT']
          }
        ]
      });
    }

    return NextResponse.json(
      { error: 'Ação inválida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('External API GET error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}