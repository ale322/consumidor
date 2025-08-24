interface ChannelSuggestion {
  name: string;
  description: string;
  effectiveness: number;
  estimatedTime: string;
  category: string;
  requirements?: string[];
}

interface ComplaintData {
  category: string;
  subcategory: string;
  priority: string;
  companyName: string;
}

// Base de dados de canais e suas eficácias por categoria
const channelDatabase: Record<string, ChannelSuggestion[]> = {
  telecom: [
    {
      name: "Anatel",
      description: "Agência Nacional de Telecomunicações - Reguladora do setor",
      effectiveness: 85,
      estimatedTime: "15-30 dias",
      category: "regulator",
      requirements: ["Número do protocolo da operadora", "Dados da conta"]
    },
    {
      name: "Consumidor.gov",
      description: "Plataforma oficial do governo federal para reclamações",
      effectiveness: 75,
      estimatedTime: "10-20 dias",
      category: "government"
    },
    {
      name: "Procon",
      description: "Programa de Proteção e Defesa do Consumidor",
      effectiveness: 70,
      estimatedTime: "20-40 dias",
      category: "consumer_protection"
    },
    {
      name: "Reclame Aqui",
      description: "Plataforma pública de reclamações com pressão midiática",
      effectiveness: 65,
      estimatedTime: "7-15 dias",
      category: "social_media"
    }
  ],
  banking: [
    {
      name: "Banco Central do Brasil",
      description: "Órgão regulador do sistema financeiro nacional",
      effectiveness: 90,
      estimatedTime: "20-40 dias",
      category: "regulator",
      requirements: ["Número do contrato", "Comprovantes de transação"]
    },
    {
      name: "Consumidor.gov",
      description: "Plataforma oficial do governo federal para reclamações",
      effectiveness: 80,
      estimatedTime: "15-25 dias",
      category: "government"
    },
    {
      name: "Procon",
      description: "Programa de Proteção e Defesa do Consumidor",
      effectiveness: 75,
      estimatedTime: "25-45 dias",
      category: "consumer_protection"
    },
    {
      name: "Ouvidoria do Banco",
      description: "Canal interno de resolução do próprio banco",
      effectiveness: 60,
      estimatedTime: "5-10 dias",
      category: "internal"
    }
  ],
  retail: [
    {
      name: "Procon",
      description: "Programa de Proteção e Defesa do Consumidor",
      effectiveness: 80,
      estimatedTime: "15-30 dias",
      category: "consumer_protection"
    },
    {
      name: "Consumidor.gov",
      description: "Plataforma oficial do governo federal para reclamações",
      effectiveness: 75,
      estimatedTime: "10-20 dias",
      category: "government"
    },
    {
      name: "Reclame Aqui",
      description: "Plataforma pública de reclamações com pressão midiática",
      effectiveness: 70,
      estimatedTime: "5-15 dias",
      category: "social_media"
    },
    {
      name: "SAC da Empresa",
      description: "Serviço de Atendimento ao Consumidor da empresa",
      effectiveness: 50,
      estimatedTime: "3-7 dias",
      category: "internal"
    }
  ],
  services: [
    {
      name: "Procon",
      description: "Programa de Proteção e Defesa do Consumidor",
      effectiveness: 75,
      estimatedTime: "20-35 dias",
      category: "consumer_protection"
    },
    {
      name: "Consumidor.gov",
      description: "Plataforma oficial do governo federal para reclamações",
      effectiveness: 70,
      estimatedTime: "15-25 dias",
      category: "government"
    },
    {
      name: "Conselho de Classe",
      description: "Órgão regulador da categoria profissional",
      effectiveness: 65,
      estimatedTime: "30-60 dias",
      category: "regulator"
    },
    {
      name: "Reclame Aqui",
      description: "Plataforma pública de reclamações com pressão midiática",
      effectiveness: 60,
      estimatedTime: "7-14 dias",
      category: "social_media"
    }
  ],
  utilities: [
    {
      name: "ANEEL",
      description: "Agência Nacional de Energia Elétrica",
      effectiveness: 85,
      estimatedTime: "15-30 dias",
      category: "regulator",
      requirements: ["Número da instalação", "Conta de energia"]
    },
    {
      name: "ARSEP",
      description: "Agência Reguladora de Saneamento e Energia do Estado",
      effectiveness: 80,
      estimatedTime: "20-35 dias",
      category: "regulator"
    },
    {
      name: "Consumidor.gov",
      description: "Plataforma oficial do governo federal para reclamações",
      effectiveness: 75,
      estimatedTime: "10-20 dias",
      category: "government"
    },
    {
      name: "Procon",
      description: "Programa de Proteção e Defesa do Consumidor",
      effectiveness: 70,
      estimatedTime: "25-40 dias",
      category: "consumer_protection"
    }
  ],
  transport: [
    {
      name: "ANAC",
      description: "Agência Nacional de Aviação Civil",
      effectiveness: 85,
      estimatedTime: "20-40 dias",
      category: "regulator",
      requirements: ["Localizador da reserva", "Número do voo"]
    },
    {
      name: "ANTT",
      description: "Agência Nacional de Transportes Terrestres",
      effectiveness: 80,
      estimatedTime: "25-45 dias",
      category: "regulator"
    },
    {
      name: "Consumidor.gov",
      description: "Plataforma oficial do governo federal para reclamações",
      effectiveness: 75,
      estimatedTime: "15-25 dias",
      category: "government"
    },
    {
      name: "Procon",
      description: "Programa de Proteção e Defesa do Consumidor",
      effectiveness: 70,
      estimatedTime: "20-35 dias",
      category: "consumer_protection"
    }
  ]
};

// Mapeamento de subcategorias para canais específicos
const subcategoryMapping: Record<string, string[]> = {
  'Internet': ['Anatel', 'Consumidor.gov', 'Procon'],
  'Telefone Fixo': ['Anatel', 'Consumidor.gov', 'Procon'],
  'Telefone Móvel': ['Anatel', 'Consumidor.gov', 'Procon'],
  'TV por Assinatura': ['Anatel', 'Consumidor.gov', 'Procon'],
  'Conta Corrente': ['Banco Central do Brasil', 'Consumidor.gov', 'Procon'],
  'Cartão de Crédito': ['Banco Central do Brasil', 'Consumidor.gov', 'Procon'],
  'Empréstimo': ['Banco Central do Brasil', 'Consumidor.gov', 'Procon'],
  'Investimentos': ['Banco Central do Brasil', 'CVM', 'Consumidor.gov'],
  'Energia Elétrica': ['ANEEL', 'Consumidor.gov', 'Procon'],
  'Água e Esgoto': ['ARSEP', 'Consumidor.gov', 'Procon'],
  'Gás': ['ARSEP', 'Consumidor.gov', 'Procon'],
  'Aéreo': ['ANAC', 'Consumidor.gov', 'Procon'],
  'Terrestre': ['ANTT', 'Consumidor.gov', 'Procon'],
  'Aplicativos': ['Consumidor.gov', 'Procon', 'Reclame Aqui']
};

// Ajuste de eficácia baseado na prioridade
const priorityEffectivenessAdjustment: Record<string, number> = {
  'low': -10,
  'medium': 0,
  'high': 15,
  'urgent': 25
};

export const suggestChannels = (complaintData: ComplaintData): ChannelSuggestion[] => {
  const { category, subcategory, priority, companyName } = complaintData;
  
  // Obter canais base para a categoria
  let baseChannels = channelDatabase[category] || channelDatabase.retail;
  
  // Filtrar por subcategoria se houver mapeamento específico
  if (subcategory && subcategoryMapping[subcategory]) {
    const preferredChannelNames = subcategoryMapping[subcategory];
    baseChannels = baseChannels
      .filter(channel => preferredChannelNames.includes(channel.name))
      .concat(baseChannels.filter(channel => !preferredChannelNames.includes(channel.name)));
  }
  
  // Ajustar eficácia baseado na prioridade
  const priorityAdjustment = priorityEffectivenessAdjustment[priority] || 0;
  
  // Clonar e ajustar canais
  const adjustedChannels = baseChannels.map(channel => ({
    ...channel,
    effectiveness: Math.min(100, Math.max(0, channel.effectiveness + priorityAdjustment))
  }));
  
  // Ordenar por eficácia
  adjustedChannels.sort((a, b) => b.effectiveness - a.effectiveness);
  
  // Adicionar lógica de negócio adicional
  // Para reclamações urgentes, priorizar canais mais rápidos
  if (priority === 'urgent') {
    adjustedChannels.sort((a, b) => {
      const timeA = parseInt(a.estimatedTime.split('-')[0]);
      const timeB = parseInt(b.estimatedTime.split('-')[0]);
      return timeA - timeB;
    });
  }
  
  // Limitar aos 4 melhores canais
  return adjustedChannels.slice(0, 4);
};

// Função para obter descrição detalhada do canal
export const getChannelDetails = (channelName: string): ChannelSuggestion | null => {
  for (const category in channelDatabase) {
    const channel = channelDatabase[category].find(c => c.name === channelName);
    if (channel) return channel;
  }
  return null;
};

// Função para verificar requisitos específicos do canal
export const getChannelRequirements = (channelName: string): string[] => {
  const channel = getChannelDetails(channelName);
  return channel?.requirements || [];
};

// Função para estimar tempo de resolução baseado no histórico
export const estimateResolutionTime = (channelName: string, category: string): string => {
  const channel = getChannelDetails(channelName);
  if (!channel) return "Indeterminado";
  
  // Ajustar tempo baseado na categoria e histórico
  const baseTime = channel.estimatedTime;
  
  // Lógica de ajuste pode ser expandida com dados reais
  return baseTime;
};