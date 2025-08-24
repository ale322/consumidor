import { db } from '@/lib/db';
import { suggestChannels, getChannelDetails } from './channelSuggestion';

interface DistributionRequest {
  complaintId: string;
  selectedChannels: string[];
  userPermission: boolean;
  userId: string;
}

interface DistributionResult {
  success: boolean;
  channel: string;
  protocol?: string;
  message: string;
  timestamp: string;
  estimatedResolution?: string;
}

interface ChannelConfig {
  name: string;
  apiEndpoint?: string;
  requiresAuth: boolean;
  maxRetries: number;
  timeout: number;
}

// Configuração dos canais externos
const channelConfigs: Record<string, ChannelConfig> = {
  'Consumidor.gov': {
    name: 'Consumidor.gov',
    apiEndpoint: process.env.CONSUMIDOR_GOV_API,
    requiresAuth: true,
    maxRetries: 3,
    timeout: 30000
  },
  'Procon': {
    name: 'Procon',
    apiEndpoint: process.env.PROCON_API,
    requiresAuth: true,
    maxRetries: 2,
    timeout: 45000
  },
  'Reclame Aqui': {
    name: 'Reclame Aqui',
    apiEndpoint: process.env.RECLAME_AQUI_API,
    requiresAuth: true,
    maxRetries: 3,
    timeout: 25000
  },
  'Anatel': {
    name: 'Anatel',
    apiEndpoint: process.env.ANATEL_API,
    requiresAuth: true,
    maxRetries: 2,
    timeout: 40000
  },
  'Banco Central do Brasil': {
    name: 'Banco Central do Brasil',
    apiEndpoint: process.env.BACEN_API,
    requiresAuth: true,
    maxRetries: 3,
    timeout: 35000
  },
  'ANEEL': {
    name: 'ANEEL',
    apiEndpoint: process.env.ANEEL_API,
    requiresAuth: true,
    maxRetries: 2,
    timeout: 40000
  },
  'ANAC': {
    name: 'ANAC',
    apiEndpoint: process.env.ANAC_API,
    requiresAuth: true,
    maxRetries: 2,
    timeout: 45000
  }
};

// Simulador de envio para canais externos
class ExternalChannelService {
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async sendToConsumidorGov(complaintData: any): Promise<DistributionResult> {
    try {
      // Simular chamada API
      await this.delay(2000);
      
      // Gerar protocolo simulado
      const protocol = `CG${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      return {
        success: true,
        channel: 'Consumidor.gov',
        protocol,
        message: 'Reclamação registrada com sucesso no Consumidor.gov',
        timestamp: new Date().toISOString(),
        estimatedResolution: '15-25 dias'
      };
    } catch (error) {
      return {
        success: false,
        channel: 'Consumidor.gov',
        message: `Erro ao enviar para Consumidor.gov: ${error}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async sendToProcon(complaintData: any): Promise<DistributionResult> {
    try {
      // Simular chamada API
      await this.delay(3000);
      
      const protocol = `PC${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      return {
        success: true,
        channel: 'Procon',
        protocol,
        message: 'Reclamação registrada com sucesso no Procon',
        timestamp: new Date().toISOString(),
        estimatedResolution: '20-40 dias'
      };
    } catch (error) {
      return {
        success: false,
        channel: 'Procon',
        message: `Erro ao enviar para Procon: ${error}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async sendToReclameAqui(complaintData: any): Promise<DistributionResult> {
    try {
      // Simular chamada API
      await this.delay(1500);
      
      const protocol = `RA${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      return {
        success: true,
        channel: 'Reclame Aqui',
        protocol,
        message: 'Reclamação publicada com sucesso no Reclame Aqui',
        timestamp: new Date().toISOString(),
        estimatedResolution: '7-15 dias'
      };
    } catch (error) {
      return {
        success: false,
        channel: 'Reclame Aqui',
        message: `Erro ao enviar para Reclame Aqui: ${error}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async sendToRegulator(complaintData: any, regulator: string): Promise<DistributionResult> {
    try {
      // Simular chamada API para órgãos reguladores
      await this.delay(2500);
      
      const protocol = `${regulator.substring(0, 2).toUpperCase()}${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      return {
        success: true,
        channel: regulator,
        protocol,
        message: `Reclamação registrada com sucesso na ${regulator}`,
        timestamp: new Date().toISOString(),
        estimatedResolution: '20-45 dias'
      };
    } catch (error) {
      return {
        success: false,
        channel: regulator,
        message: `Erro ao enviar para ${regulator}: ${error}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async sendToChannel(channelName: string, complaintData: any): Promise<DistributionResult> {
    switch (channelName) {
      case 'Consumidor.gov':
        return await this.sendToConsumidorGov(complaintData);
      case 'Procon':
        return await this.sendToProcon(complaintData);
      case 'Reclame Aqui':
        return await this.sendToReclameAqui(complaintData);
      default:
        // Para órgãos reguladores
        if (['Anatel', 'Banco Central do Brasil', 'ANEEL', 'ANAC', 'ANTT'].includes(channelName)) {
          return await this.sendToRegulator(complaintData, channelName);
        }
        
        return {
          success: false,
          channel: channelName,
          message: `Canal não suportado: ${channelName}`,
          timestamp: new Date().toISOString()
        };
    }
  }

  async distributeComplaint(request: DistributionRequest): Promise<DistributionResult[]> {
    const { complaintId, selectedChannels, userPermission, userId } = request;
    
    if (!userPermission) {
      throw new Error('Permissão do usuário não concedida para distribuição automática');
    }

    // Buscar dados da reclamação
    const complaint = await db.complaint.findUnique({
      where: { id: complaintId },
      include: {
        user: true,
        company: true
      }
    });

    if (!complaint) {
      throw new Error('Reclamação não encontrada');
    }

    const results: DistributionResult[] = [];
    
    // Preparar dados para envio
    const complaintData = {
      id: complaint.id,
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      subcategory: complaint.subcategory,
      priority: complaint.priority,
      protocol: complaint.protocol,
      user: {
        name: complaint.user.name,
        email: complaint.user.email,
        phone: complaint.user.phone,
        document: complaint.user.document
      },
      company: {
        name: complaint.company.name,
        cnpj: complaint.company.cnpj,
        category: complaint.company.category
      },
      createdAt: complaint.createdAt
    };

    // Enviar para cada canal selecionado
    for (const channelName of selectedChannels) {
      try {
        const result = await this.sendToChannel(channelName, complaintData);
        results.push(result);

        // Se sucesso, atualizar status da reclamação
        if (result.success) {
          await this.updateComplaintChannel(complaintId, channelName, result.protocol);
        }
      } catch (error) {
        results.push({
          success: false,
          channel: channelName,
          message: `Erro inesperado: ${error}`,
          timestamp: new Date().toISOString()
        });
      }
    }

    return results;
  }

  private async updateComplaintChannel(complaintId: string, channelName: string, protocol?: string) {
    // Atualizar canais da reclamação
    const complaint = await db.complaint.findUnique({
      where: { id: complaintId }
    });

    if (complaint) {
      const channels = complaint.channels ? JSON.parse(complaint.channels) : [];
      channels.push({
        name: channelName,
        protocol: protocol || null,
        status: 'SENT',
        sentAt: new Date().toISOString()
      });

      await db.complaint.update({
        where: { id: complaintId },
        data: {
          channels: JSON.stringify(channels),
          updatedAt: new Date()
        }
      });
    }
  }

  async checkChannelStatus(complaintId: string, channelName: string): Promise<any> {
    const complaint = await db.complaint.findUnique({
      where: { id: complaintId }
    });

    if (!complaint || !complaint.channels) {
      return null;
    }

    const channels = JSON.parse(complaint.channels);
    const channel = channels.find((c: any) => c.name === channelName);

    if (!channel) {
      return null;
    }

    // Simular verificação de status
    // Em produção, isso faria chamadas reais às APIs dos canais
    const mockStatuses = ['RECEIVED', 'IN_ANALYSIS', 'WAITING_RESPONSE', 'RESPONDED', 'RESOLVED'];
    const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];

    return {
      ...channel,
      currentStatus: randomStatus,
      lastChecked: new Date().toISOString(),
      nextCheck: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
    };
  }

  async syncAllChannelsStatus(): Promise<void> {
    // Buscar todas as reclamações com canais
    const complaints = await db.complaint.findMany({
      where: {
        channels: {
          not: null
        }
      }
    });

    for (const complaint of complaints) {
      if (complaint.channels) {
        const channels = JSON.parse(complaint.channels);
        
        for (const channel of channels) {
          try {
            const status = await this.checkChannelStatus(complaint.id, channel.name);
            
            if (status && status.currentStatus !== channel.status) {
              // Atualizar status
              const updatedChannels = channels.map((c: any) => 
                c.name === channel.name ? { ...c, status: status.currentStatus } : c
              );

              await db.complaint.update({
                where: { id: complaint.id },
                data: {
                  channels: JSON.stringify(updatedChannels),
                  updatedAt: new Date()
                }
              });

              // Enviar notificação via WebSocket
              // Aqui seria integrado com o sistema de notificações
            }
          } catch (error) {
            console.error(`Erro ao sincronizar status do canal ${channel.name}:`, error);
          }
        }
      }
    }
  }
}

export const externalDistributionService = new ExternalChannelService();

// Função utilitária para validar permissão de distribuição
export const validateDistributionPermission = (userId: string, complaintId: string): Promise<boolean> => {
  // Em produção, verificaria se o usuário tem permissão para distribuir esta reclamação
  return Promise.resolve(true);
};

// Função para obter canais disponíveis para uma categoria
export const getAvailableChannels = (category: string): string[] => {
  const channels = suggestChannels({
    category,
    subcategory: '',
    priority: 'medium',
    companyName: ''
  });
  
  return channels.map(channel => channel.name);
};