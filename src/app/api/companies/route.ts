import { NextRequest, NextResponse } from 'next/server';
import { companyReputationService } from '@/lib/companyReputation';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const updateReputationSchema = z.object({
  companyId: z.string().min(1),
});

const getTopCompaniesSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  category: z.string().optional(),
});

const getHistorySchema = z.object({
  companyId: z.string().min(1),
  days: z.coerce.number().min(7).max(365).default(90),
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
      case 'update_reputation':
        return await handleUpdateReputation(body);
      default:
        return NextResponse.json(
          { error: 'Ação inválida' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Company reputation API error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function handleUpdateReputation(body: any) {
  try {
    const validatedData = updateReputationSchema.parse(body);
    
    await companyReputationService.updateCompanyReputation(validatedData.companyId);
    
    return NextResponse.json({
      message: 'Reputação da empresa atualizada com sucesso',
      companyId: validatedData.companyId
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'get_reputation':
        return await handleGetReputation(searchParams);
      case 'get_top_companies':
        return await handleGetTopCompanies(searchParams);
      case 'get_history':
        return await handleGetHistory(searchParams);
      case 'get_company_details':
        return await handleGetCompanyDetails(searchParams);
      default:
        return NextResponse.json(
          { error: 'Ação inválida' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Company reputation GET error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function handleGetReputation(searchParams: URLSearchParams) {
  try {
    const companyId = searchParams.get('companyId');
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'ID da empresa é obrigatório' },
        { status: 400 }
      );
    }

    const reputation = await companyReputationService.calculateCompanyReputation(companyId);
    
    return NextResponse.json({
      message: 'Reputação obtida com sucesso',
      reputation
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao calcular reputação' },
      { status: 500 }
    );
  }
}

async function handleGetTopCompanies(searchParams: URLSearchParams) {
  try {
    const validatedData = getTopCompaniesSchema.parse({
      limit: searchParams.get('limit'),
      category: searchParams.get('category')
    });

    const topCompanies = await companyReputationService.getTopCompanies(
      validatedData.limit,
      validatedData.category
    );
    
    return NextResponse.json({
      message: 'Top empresas obtidas com sucesso',
      companies: topCompanies,
      total: topCompanies.length
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Erro ao obter top empresas' },
      { status: 500 }
    );
  }
}

async function handleGetHistory(searchParams: URLSearchParams) {
  try {
    const validatedData = getHistorySchema.parse({
      companyId: searchParams.get('companyId'),
      days: searchParams.get('days')
    });

    const history = await companyReputationService.getCompanyReputationHistory(
      validatedData.companyId,
      validatedData.days
    );
    
    return NextResponse.json({
      message: 'Histórico de reputação obtido com sucesso',
      history,
      companyId: validatedData.companyId,
      days: validatedData.days
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Erro ao obter histórico de reputação' },
      { status: 500 }
    );
  }
}

async function handleGetCompanyDetails(searchParams: URLSearchParams) {
  try {
    const companyId = searchParams.get('companyId');
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'ID da empresa é obrigatório' },
        { status: 400 }
      );
    }

    const company = await db.company.findUnique({
      where: { id: companyId },
      include: {
        complaints: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            updates: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Get reputation
    const reputation = await companyReputationService.calculateCompanyReputation(companyId);

    // Calculate statistics
    const totalComplaints = company.complaints.length;
    const resolvedComplaints = company.complaints.filter(c => c.status === 'RESOLVED').length;
    const pendingComplaints = totalComplaints - resolvedComplaints;

    const statusDistribution = {
      ANALYSIS: company.complaints.filter(c => c.status === 'ANALYSIS').length,
      WAITING: company.complaints.filter(c => c.status === 'WAITING').length,
      IN_PROGRESS: company.complaints.filter(c => c.status === 'IN_PROGRESS').length,
      RESOLVED: company.complaints.filter(c => c.status === 'RESOLVED').length,
      REJECTED: company.complaints.filter(c => c.status === 'REJECTED').length,
    };

    const categoryDistribution = company.complaints.reduce((acc, complaint) => {
      acc[complaint.category] = (acc[complaint.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      message: 'Detalhes da empresa obtidos com sucesso',
      company: {
        ...company,
        reputation,
        statistics: {
          totalComplaints,
          resolvedComplaints,
          pendingComplaints,
          resolutionRate: totalComplaints > 0 ? resolvedComplaints / totalComplaints : 0,
        },
        statusDistribution,
        categoryDistribution,
        recentComplaints: company.complaints.slice(0, 5)
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao obter detalhes da empresa' },
      { status: 500 }
    );
  }
}