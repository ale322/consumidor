import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

export interface MediationSuggestion {
  id: string;
  type: 'legal' | 'negotiation' | 'compromise' | 'escalation';
  title: string;
  description: string;
  steps: string[];
  estimatedSuccessRate: number;
  timeframe: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  similarCases: {
    title: string;
    outcome: string;
    satisfaction: number;
  }[];
  legalReferences?: {
    article: string;
    description: string;
  }[];
}

export interface CaseSimilarity {
  complaintId: string;
  similarityScore: number;
  title: string;
  description: string;
  resolution: string;
  outcome: 'resolved' | 'partially_resolved' | 'unresolved';
  satisfaction: number;
  category: string;
  company: string;
  resolutionTime: number;
}

export interface MediationAnalysis {
  complaintId: string;
  suggestions: MediationSuggestion[];
  similarCases: CaseSimilarity[];
  successProbability: number;
  recommendedActions: string[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
  timeline: {
    bestCase: string;
    average: string;
    worstCase: string;
  };
}

export class MediationService {
  
  async analyzeComplaint(complaintId: string): Promise<MediationAnalysis> {
    try {
      // Get complaint details
      const complaint = await db.complaint.findUnique({
        where: { id: complaintId },
        include: {
          company: true,
          user: true,
          updates: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });

      if (!complaint) {
        throw new Error('Complaint not found');
      }

      // Find similar cases
      const similarCases = await this.findSimilarCases(complaint);
      
      // Generate mediation suggestions
      const suggestions = await this.generateMediationSuggestions(complaint, similarCases);
      
      // Calculate success probability
      const successProbability = this.calculateSuccessProbability(complaint, similarCases);
      
      // Generate recommended actions
      const recommendedActions = await this.generateRecommendedActions(complaint, similarCases);
      
      // Assess risks
      const riskAssessment = this.assessRisks(complaint, similarCases);
      
      // Estimate timeline
      const timeline = this.estimateTimeline(complaint, similarCases);

      return {
        complaintId,
        suggestions,
        similarCases,
        successProbability,
        recommendedActions,
        riskAssessment,
        timeline
      };
    } catch (error) {
      console.error('Error analyzing complaint:', error);
      throw error;
    }
  }

  private async findSimilarCases(complaint: any): Promise<CaseSimilarity[]> {
    try {
      const zai = await ZAI.create();
      
      // Create search query based on complaint details
      const searchQuery = `reclamação consumidor ${complaint.company.name} ${complaint.category} ${complaint.title} ${complaint.description}`;
      
      // Search for similar cases online
      const searchResults = await zai.functions.invoke("web_search", {
        query: searchQuery,
        num: 15
      });

      // Also search in local database
      const localCases = await db.complaint.findMany({
        where: {
          OR: [
            { category: complaint.category },
            { companyId: complaint.companyId },
            {
              OR: [
                { title: { contains: complaint.title.split(' ')[0] } },
                { description: { contains: complaint.description.split(' ')[0] } }
              ]
            }
          ],
          NOT: { id: complaint.id },
          status: { in: ['RESOLVED', 'PARTIALLY_RESOLVED'] }
        },
        include: {
          company: true,
          updates: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        take: 20
      });

      // Process and combine results
      const cases: CaseSimilarity[] = [];

      // Process local cases
      for (const localCase of localCases) {
        const similarity = this.calculateSimilarity(complaint, localCase);
        if (similarity > 0.3) { // 30% similarity threshold
          cases.push({
            complaintId: localCase.id,
            similarityScore: similarity,
            title: localCase.title,
            description: localCase.description,
            resolution: this.extractResolutionFromUpdates(localCase.updates),
            outcome: localCase.status === 'RESOLVED' ? 'resolved' : 'partially_resolved',
            satisfaction: this.calculateSatisfaction(localCase),
            category: localCase.category,
            company: localCase.company.name,
            resolutionTime: this.calculateResolutionTime(localCase)
          });
        }
      }

      // Process web search results (mock implementation)
      if (searchResults && Array.isArray(searchResults)) {
        for (const result of searchResults.slice(0, 10)) {
          if (result.snippet && result.snippet.length > 50) {
            const similarity = this.calculateTextSimilarity(
              `${complaint.title} ${complaint.description}`,
              `${result.name} ${result.snippet}`
            );
            
            if (similarity > 0.25) {
              cases.push({
                complaintId: result.url,
                similarityScore: similarity,
                title: result.name,
                description: result.snippet,
                resolution: 'Resolução baseada em casos similares',
                outcome: Math.random() > 0.3 ? 'resolved' : 'partially_resolved',
                satisfaction: Math.floor(Math.random() * 40) + 60, // 60-100
                category: complaint.category,
                company: complaint.company.name,
                resolutionTime: Math.floor(Math.random() * 60) + 10 // 10-70 days
              });
            }
          }
        }
      }

      // Sort by similarity score and return top cases
      return cases
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 10);
    } catch (error) {
      console.error('Error finding similar cases:', error);
      return [];
    }
  }

  private async generateMediationSuggestions(complaint: any, similarCases: CaseSimilarity[]): Promise<MediationSuggestion[]> {
    try {
      const zai = await ZAI.create();
      
      const prompt = `
        Como especialista em mediação de conflitos de consumo, analise esta reclamação e sugira estratégias de resolução:

        Reclamação: ${complaint.title}
        Descrição: ${complaint.description}
        Categoria: ${complaint.category}
        Empresa: ${complaint.company.name}
        Prioridade: ${complaint.priority}

        Casos Similares Encontrados: ${similarCases.length}
        Taxa de Sucesso em Casos Similares: ${Math.round(similarCases.filter(c => c.outcome === 'resolved').length / similarCases.length * 100)}%

        Forneça 3-4 sugestões de mediação com:
        1. Tipo de abordagem (legal, negociação, compromisso, escalonamento)
        2. Passos detalhados
        3. Taxa de sucesso estimada
        4. Tempo estimado
        5. Nível de dificuldade
        6. Referências legais aplicáveis
      `;

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em mediação de conflitos de consumo com conhecimento profundo do Código de Defesa do Consumidor e técnicas de negociação.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      });

      const response = completion.choices[0]?.message?.content || '';
      
      // Parse the response to extract structured suggestions
      const suggestions = this.parseMediationSuggestions(response, complaint, similarCases);
      
      return suggestions;
    } catch (error) {
      console.error('Error generating mediation suggestions:', error);
      return this.getFallbackSuggestions(complaint);
    }
  }

  private parseMediationSuggestions(response: string, complaint: any, similarCases: CaseSimilarity[]): MediationSuggestion[] {
    // This is a simplified parser - in production, you'd want more sophisticated parsing
    const suggestions: MediationSuggestion[] = [];
    
    // Default suggestions based on complaint analysis
    const successRate = similarCases.length > 0 
      ? similarCases.filter(c => c.outcome === 'resolved').length / similarCases.length 
      : 0.5;

    suggestions.push({
      id: '1',
      type: 'negotiation',
      title: 'Negociação Direta com a Empresa',
      description: 'Iniciar contato direto com a empresa buscando uma solução amigável',
      steps: [
        'Documentar todos os problemas e comunicações anteriores',
        'Entrar em contato com o serviço de atendimento ao cliente',
        'Apresentar o problema de forma clara e objetiva',
        'Propor uma solução razoável',
        'Estabelecer prazos para resposta'
      ],
      estimatedSuccessRate: Math.round(successRate * 100),
      timeframe: '7-15 dias',
      difficulty: 'easy',
      category: complaint.category,
      similarCases: similarCases.slice(0, 2).map(c => ({
        title: c.title,
        outcome: c.outcome,
        satisfaction: c.satisfaction
      }))
    });

    if (complaint.priority === 'HIGH' || complaint.priority === 'URGENT') {
      suggestions.push({
        id: '2',
        type: 'escalation',
        title: 'Escalonamento para Órgãos de Defesa',
        description: 'Buscar apoio de órgãos de proteção ao consumidor',
        steps: [
          'Registrar reclamação no Procon',
          'Contactar órgãos reguladores específicos do setor',
          'Buscar orientação da Defensoria Pública',
          'Considerar ação no Ministério Público'
        ],
        estimatedSuccessRate: Math.round(successRate * 100 * 1.2),
        timeframe: '30-60 dias',
        difficulty: 'medium',
        category: complaint.category,
        similarCases: similarCases.slice(0, 2).map(c => ({
          title: c.title,
          outcome: c.outcome,
          satisfaction: c.satisfaction
        })),
        legalReferences: [
          {
            article: 'Art. 5º, XXXII - CF/88',
            description: 'O Estado promoverá, na forma da lei, a defesa do consumidor'
          },
          {
            article: 'Art. 6º - CDC',
            description: 'Direitos básicos do consumidor'
          }
        ]
      });
    }

    suggestions.push({
      id: '3',
      type: 'compromise',
      title: 'Acordo de Composição',
      description: 'Buscar uma solução de meio-termo que atenda ambas as partes',
      steps: [
        'Identificar os pontos essenciais do conflito',
        'Propor alternativas de solução',
        'Documentar o acordo proposto',
        'Estabelecer condições claras',
        'Formalizar o acordo por escrito'
      ],
      estimatedSuccessRate: Math.round(successRate * 100 * 0.9),
      timeframe: '15-30 dias',
      difficulty: 'medium',
      category: complaint.category,
      similarCases: similarCases.slice(0, 2).map(c => ({
        title: c.title,
        outcome: c.outcome,
        satisfaction: c.satisfaction
      }))
    });

    return suggestions;
  }

  private getFallbackSuggestions(complaint: any): MediationSuggestion[] {
    return [
      {
        id: '1',
        type: 'negotiation',
        title: 'Negociação Direta',
        description: 'Iniciar contato direto com a empresa',
        steps: ['Documentar o problema', 'Contatar a empresa', 'Propor solução'],
        estimatedSuccessRate: 60,
        timeframe: '7-15 dias',
        difficulty: 'easy',
        category: complaint.category,
        similarCases: []
      }
    ];
  }

  private calculateSimilarity(complaint1: any, complaint2: any): number {
    let score = 0;
    
    // Category similarity
    if (complaint1.category === complaint2.category) score += 0.3;
    
    // Company similarity
    if (complaint1.companyId === complaint2.companyId) score += 0.4;
    
    // Text similarity
    const textSimilarity = this.calculateTextSimilarity(
      `${complaint1.title} ${complaint1.description}`,
      `${complaint2.title} ${complaint2.description}`
    );
    score += textSimilarity * 0.3;
    
    return Math.min(1, score);
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(' ');
    const words2 = text2.toLowerCase().split(' ');
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  private extractResolutionFromUpdates(updates: any[]): string {
    const resolutionUpdate = updates.find(u => 
      u.message.toLowerCase().includes('resolvido') || 
      u.message.toLowerCase().includes('solução') ||
      u.message.toLowerCase().includes('acordo')
    );
    
    return resolutionUpdate ? resolutionUpdate.message : 'Resolução não detalhada';
  }

  private calculateSatisfaction(complaint: any): number {
    // Mock calculation based on resolution time and updates
    const resolutionTime = this.calculateResolutionTime(complaint);
    const updateCount = complaint.updates.length;
    
    let satisfaction = 70; // Base satisfaction
    
    // Bonus for quick resolution
    if (resolutionTime < 15) satisfaction += 20;
    else if (resolutionTime < 30) satisfaction += 10;
    
    // Bonus for good communication
    if (updateCount > 3) satisfaction += 10;
    
    return Math.min(100, Math.max(0, satisfaction));
  }

  private calculateResolutionTime(complaint: any): number {
    if (!complaint.resolvedAt) return 0;
    
    const created = new Date(complaint.createdAt).getTime();
    const resolved = new Date(complaint.resolvedAt).getTime();
    
    return Math.round((resolved - created) / (1000 * 60 * 60 * 24)); // days
  }

  private calculateSuccessProbability(complaint: any, similarCases: CaseSimilarity[]): number {
    if (similarCases.length === 0) return 50;
    
    const resolvedCases = similarCases.filter(c => c.outcome === 'resolved');
    const weightedScore = resolvedCases.reduce((sum, c) => sum + (c.satisfaction * c.similarityScore), 0);
    const totalWeight = similarCases.reduce((sum, c) => sum + c.similarityScore, 0);
    
    return Math.round((weightedScore / totalWeight) * 100);
  }

  private async generateRecommendedActions(complaint: any, similarCases: CaseSimilarity[]): Promise<string[]> {
    try {
      const zai = await ZAI.create();
      
      const prompt = `
        Baseado nesta reclamação e casos similares, quais são as ações recomendadas?

        Reclamação: ${complaint.title}
        Categoria: ${complaint.category}
        Empresa: ${complaint.company.name}
        
        Forneça uma lista de 5-7 ações específicas e práticas que o consumidor deve tomar.
      `;

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Você é um consultor de defesa do consumidor especializado em ações práticas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.5
      });

      const response = completion.choices[0]?.message?.content || '';
      
      // Extract actions from response
      const actions = response
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[-*•]\s*/, '').trim())
        .slice(0, 7);

      return actions.length > 0 ? actions : [
        'Documente todas as comunicações com a empresa',
        'Reúna todas as provas e documentos relevantes',
        'Pesquise seus direitos como consumidor',
        'Entre em contato com o serviço de atendimento ao cliente',
        'Considere buscar ajuda de órgãos de defesa do consumidor'
      ];
    } catch (error) {
      console.error('Error generating recommended actions:', error);
      return [
        'Documente todas as comunicações com a empresa',
        'Reúna todas as provas e documentos relevantes',
        'Pesquise seus direitos como consumidor'
      ];
    }
  }

  private assessRisks(complaint: any, similarCases: CaseSimilarity[]): { level: 'low' | 'medium' | 'high'; factors: string[] } {
    let riskScore = 0;
    const factors: string[] = [];

    // High priority increases risk
    if (complaint.priority === 'URGENT') {
      riskScore += 30;
      factors.push('Alta prioridade da reclamação');
    }

    // Low success rate in similar cases increases risk
    const successRate = similarCases.length > 0 
      ? similarCases.filter(c => c.outcome === 'resolved').length / similarCases.length 
      : 0.5;
    
    if (successRate < 0.4) {
      riskScore += 25;
      factors.push('Baixa taxa de sucesso em casos similares');
    }

    // Long resolution times increase risk
    const avgResolutionTime = similarCases.length > 0 
      ? similarCases.reduce((sum, c) => sum + c.resolutionTime, 0) / similarCases.length 
      : 30;
    
    if (avgResolutionTime > 60) {
      riskScore += 20;
      factors.push('Tempo médio de resolução elevado');
    }

    // Company category risk
    const highRiskCategories = ['banking', 'health', 'telecom'];
    if (highRiskCategories.includes(complaint.category)) {
      riskScore += 15;
      factors.push('Setor considerado de alto risco');
    }

    let level: 'low' | 'medium' | 'high' = 'low';
    if (riskScore >= 60) level = 'high';
    else if (riskScore >= 30) level = 'medium';

    return { level, factors };
  }

  private estimateTimeline(complaint: any, similarCases: CaseSimilarity[]) {
    if (similarCases.length === 0) {
      return {
        bestCase: '7 dias',
        average: '30 dias',
        worstCase: '90 dias'
      };
    }

    const resolutionTimes = similarCases.map(c => c.resolutionTime).sort((a, b) => a - b);
    
    return {
      bestCase: `${Math.max(1, Math.round(resolutionTimes[0] * 0.5))} dias`,
      average: `${Math.round(resolutionTimes[Math.floor(resolutionTimes.length / 2)])} dias`,
      worstCase: `${Math.round(resolutionTimes[resolutionTimes.length - 1] * 1.5)} dias`
    };
  }
}

export const mediationService = new MediationService();