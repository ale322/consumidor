import ZAI from 'z-ai-web-dev-sdk';

export interface ExternalAPIConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
  headers?: Record<string, string>;
}

export interface ExternalComplaint {
  id: string;
  title: string;
  description: string;
  category: string;
  company: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  response?: string;
  resolutionDate?: string;
}

export interface ExternalAPIResponse {
  success: boolean;
  data?: any;
  error?: string;
  complaintId?: string;
  trackingUrl?: string;
}

class ExternalAPIService {
  private configs: ExternalAPIConfig[] = [
    {
      name: 'Reclame Aqui',
      baseUrl: 'https://api.reclameaqui.com.br/v1',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CentralDoConsumidor/1.0'
      }
    },
    {
      name: 'Procon',
      baseUrl: 'https://api.procon.sp.gov.br/v1',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CentralDoConsumidor/1.0'
      }
    }
  ];

  private async makeRequest(
    config: ExternalAPIConfig,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' = 'POST',
    data?: any
  ): Promise<ExternalAPIResponse> {
    try {
      const url = `${config.baseUrl}${endpoint}`;
      const headers = {
        ...config.headers,
        ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` })
      };

      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error(`Error calling ${config.name} API:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async submitToReclameAqui(complaintData: {
    title: string;
    description: string;
    company: string;
    category: string;
    userEmail: string;
    userName: string;
  }): Promise<ExternalAPIResponse> {
    const config = this.configs.find(c => c.name === 'Reclame Aqui');
    if (!config) {
      return { success: false, error: 'Reclame Aqui config not found' };
    }

    const data = {
      titulo: complaintData.title,
      descricao: complaintData.description,
      empresa: complaintData.company,
      categoria: complaintData.category,
      consumidor: {
        nome: complaintData.userName,
        email: complaintData.userEmail
      },
      localizacao: 'São Paulo', // Could be dynamic
      data: new Date().toISOString()
    };

    return this.makeRequest(config, '/reclamacoes', 'POST', data);
  }

  async submitToProcon(complaintData: {
    title: string;
    description: string;
    company: string;
    category: string;
    userEmail: string;
    userName: string;
    userPhone?: string;
    userDocument?: string;
  }): Promise<ExternalAPIResponse> {
    const config = this.configs.find(c => c.name === 'Procon');
    if (!config) {
      return { success: false, error: 'Procon config not found' };
    }

    const data = {
      assunto: complaintData.title,
      descricao: complaintData.description,
      empresa_fornecedora: complaintData.company,
      categoria: complaintData.category,
      consumidor: {
        nome: complaintData.userName,
        email: complaintData.userEmail,
        telefone: complaintData.userPhone,
        documento: complaintData.userDocument
      },
      data_reclamacao: new Date().toISOString().split('T')[0],
      uf: 'SP' // Could be dynamic
    };

    return this.makeRequest(config, '/reclamacoes', 'POST', data);
  }

  async getComplaintStatus(apiName: string, externalId: string): Promise<ExternalAPIResponse> {
    const config = this.configs.find(c => c.name === apiName);
    if (!config) {
      return { success: false, error: `${apiName} config not found` };
    }

    return this.makeRequest(config, `/reclamacoes/${externalId}`, 'GET');
  }

  async searchSimilarComplaints(
    company: string,
    category: string,
    keywords: string[]
  ): Promise<ExternalComplaint[]> {
    try {
      const zai = await ZAI.create();
      
      const searchQuery = `reclamações consumidor ${company} ${category} ${keywords.join(' ')}`;
      
      const searchResult = await zai.functions.invoke("web_search", {
        query: searchQuery,
        num: 10
      });

      // Process search results to extract complaint information
      const complaints: ExternalComplaint[] = [];
      
      if (searchResult && Array.isArray(searchResult)) {
        for (const result of searchResult) {
          if (result.snippet && result.snippet.length > 50) {
            complaints.push({
              id: result.url.split('/').pop() || Math.random().toString(),
              title: result.name,
              description: result.snippet,
              category: category,
              company: company,
              status: 'UNKNOWN',
              createdAt: result.date || new Date().toISOString(),
              updatedAt: result.date || new Date().toISOString()
            });
          }
        }
      }

      return complaints;
    } catch (error) {
      console.error('Error searching similar complaints:', error);
      return [];
    }
  }

  async generateSmartRecommendations(
    complaintData: {
      title: string;
      description: string;
      company: string;
      category: string;
      priority: string;
    }
  ): Promise<{
    recommendedChannels: string[];
    estimatedResolutionTime: string;
    successProbability: number;
    similarCases: ExternalComplaint[];
    suggestions: string[];
  }> {
    try {
      const zai = await ZAI.create();
      
      const prompt = `
        Como especialista em direitos do consumidor, analise esta reclamação e forneça recomendações:

        Título: ${complaintData.title}
        Descrição: ${complaintData.description}
        Empresa: ${complaintData.company}
        Categoria: ${complaintData.category}
        Prioridade: ${complaintData.priority}

        Forneça:
        1. Lista de canais recomendados (Procon, Reclame Aqui, etc.)
        2. Tempo estimado de resolução
        3. Probabilidade de sucesso (0-100%)
        4. Sugestões para aumentar as chances de sucesso
      `;

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em direitos do consumidor com conhecimento profundo sobre o Código de Defesa do Consumidor brasileiro e experiência em resolução de reclamações.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const response = completion.choices[0]?.message?.content || '';
      
      // Parse the response to extract structured data
      const lines = response.split('\n');
      const recommendedChannels: string[] = [];
      const suggestions: string[] = [];
      let estimatedResolutionTime = '30 dias';
      let successProbability = 70;

      for (const line of lines) {
        if (line.includes('canais') || line.includes('Canais')) {
          const channels = line.match(/(Procon|Reclame Aqui|Anatel|Banco Central|ANS|MEC)/gi);
          if (channels) {
            recommendedChannels.push(...channels.map(c => c.trim()));
          }
        }
        if (line.includes('tempo') || line.includes('dias')) {
          const timeMatch = line.match(/(\d+)\s*dias/);
          if (timeMatch) {
            estimatedResolutionTime = `${timeMatch[1]} dias`;
          }
        }
        if (line.includes('%') || line.includes('probabilidade')) {
          const probMatch = line.match(/(\d+)%/);
          if (probMatch) {
            successProbability = parseInt(probMatch[1]);
          }
        }
        if (line.includes('sugestão') || line.includes('dica') || line.includes('recomendação')) {
          suggestions.push(line.replace(/^[-*•]\s*/, '').trim());
        }
      }

      // Search for similar cases
      const keywords = [...complaintData.title.split(' '), ...complaintData.description.split(' ')];
      const similarCases = await this.searchSimilarComplaints(
        complaintData.company,
        complaintData.category,
        keywords.slice(0, 5) // Limit keywords
      );

      return {
        recommendedChannels: recommendedChannels.length > 0 ? recommendedChannels : ['Procon', 'Reclame Aqui'],
        estimatedResolutionTime,
        successProbability,
        similarCases,
        suggestions
      };

    } catch (error) {
      console.error('Error generating smart recommendations:', error);
      return {
        recommendedChannels: ['Procon', 'Reclame Aqui'],
        estimatedResolutionTime: '30 dias',
        successProbability: 70,
        similarCases: [],
        suggestions: ['Forneça todos os detalhes possíveis', 'Mantenha documentos organizados']
      };
    }
  }

  async submitToMultipleChannels(complaintData: {
    title: string;
    description: string;
    company: string;
    category: string;
    priority: string;
    userEmail: string;
    userName: string;
    userPhone?: string;
    userDocument?: string;
  }): Promise<{
    results: ExternalAPIResponse[];
    successfulSubmissions: number;
    trackingUrls: string[];
  }> {
    const results: ExternalAPIResponse[] = [];
    const trackingUrls: string[] = [];

    // Submit to Reclame Aqui
    try {
      const reclameAquiResult = await this.submitToReclameAqui({
        title: complaintData.title,
        description: complaintData.description,
        company: complaintData.company,
        category: complaintData.category,
        userEmail: complaintData.userEmail,
        userName: complaintData.userName
      });
      results.push(reclameAquiResult);
      
      if (reclameAquiResult.success && reclameAquiResult.data?.id) {
        trackingUrls.push(`https://www.reclameaqui.com.br/empresa/${complaintData.company}/reclamacao/${reclameAquiResult.data.id}`);
      }
    } catch (error) {
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit to Reclame Aqui'
      });
    }

    // Submit to Procon (only for medium/high priority)
    if (complaintData.priority === 'HIGH' || complaintData.priority === 'URGENT') {
      try {
        const proconResult = await this.submitToProcon({
          title: complaintData.title,
          description: complaintData.description,
          company: complaintData.company,
          category: complaintData.category,
          userEmail: complaintData.userEmail,
          userName: complaintData.userName,
          userPhone: complaintData.userPhone,
          userDocument: complaintData.userDocument
        });
        results.push(proconResult);
        
        if (proconResult.success && proconResult.data?.protocolo) {
          trackingUrls.push(`https://www.procon.sp.gov.br/reclamacao/${proconResult.data.protocolo}`);
        }
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to submit to Procon'
        });
      }
    }

    return {
      results,
      successfulSubmissions: results.filter(r => r.success).length,
      trackingUrls
    };
  }
}

export const externalAPIService = new ExternalAPIService();