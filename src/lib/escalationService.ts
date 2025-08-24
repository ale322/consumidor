import { db } from '@/lib/db';

interface EscalationRequest {
  complaintId: string;
  userId: string;
  reason: string;
  additionalInfo?: string;
  documents?: File[];
}

interface EscalationDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

interface EscalationService {
  id: string;
  complaintId: string;
  userId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  reason: string;
  additionalInfo?: string;
  documents: EscalationDocument[];
  estimatedCost: number;
  estimatedTime: string;
  createdAt: string;
  completedAt?: string;
  lawyerAssigned?: string;
  nextSteps?: string[];
}

interface LegalTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  requiredDocuments: string[];
  estimatedCost: number;
  estimatedTime: string;
  content: string;
}

// Templates de documentos jurídicos por categoria
const legalTemplates: LegalTemplate[] = [
  {
    id: 'consumer_complaint',
    name: 'Petição Inicial - Direito do Consumidor',
    description: 'Modelo de petição inicial para ações consumeristas no Juizado Especial Cível',
    category: 'consumer',
    requiredDocuments: ['Contrato', 'Comprovantes de pagamento', 'Comprovantes de reclamação'],
    estimatedCost: 150.00,
    estimatedTime: '5-7 dias úteis',
    content: `
EXCELENTÍSSIMO(A) SENHOR(A) JUIZ(A) DE DIREITO DO JUIZADO ESPECIAL CÍVEL DA COMARCA DE [CIDADE]

[ Nome Completo do Reclamante ], [ nacionalidade ], [ estado civil ], [ profissão ], portador(a) da cédula de identidade RG nº [ nº RG ] e inscrito(a) no CPF sob nº [ nº CPF ], residente e domiciliado(a) na [ Endereço Completo ], vem, por meio de seu advogado que esta subscreve (procuração anexa), com fundamento nos artigos 273 e seguintes do Código de Defesa do Consumidor, propor a presente

AÇÃO DE INDENIZAÇÃO POR DANOS MORAIS E MATERIAIS

em face de [ Nome Completo da Empresa ], pessoa jurídica de direito privado, inscrita no CNPJ sob nº [ CNPJ ], com sede na [ Endereço Completo da Empresa ], pelos fatos e fundamentos a seguir expostos:

I - DOS FATOS

[Descrever detalhadamente os fatos que deram origem à reclamação]

II - DO DIREITO

O caso em tela envolve clara violação dos direitos básicos do consumidor, previstos no artigo 6º do Código de Defesa do Consumidor, bem como dos dispositivos específicos que tratam da [mencionar os artigos específicos aplicáveis ao caso].

III - DOS DANOS

O autor sofreu danos materiais no valor de R$ [valor], além de danos morais, tendo em vista [descrever o sofrimento e constrangimento causados].

IV - DOS PEDIDOS

Ante o exposto, requer a Vossa Excelência:

a) A citação do réu para, querendo, contestar a presente ação, sob pena de revelia e confissão;
b) A procedência do pedido, condenando o réu a pagar ao autor:
   b.1) R$ [valor] a título de danos materiais;
   b.2) R$ [valor] a título de danos morais;
   c) A condenação do réu ao pagamento das custas processuais e honorários advocatícios;

Dá-se à causa o valor de R$ [valor total].

Termos em que,
Pede deferimento.

[Local], [Data].

[Advogado]
OAB/[UF] nº [nº]
    `
  },
  {
    id: 'banking_dispute',
    name: 'Petição Inicial - Disputa Bancária',
    description: 'Modelo específico para disputas com instituições financeiras',
    category: 'banking',
    requiredDocuments: ['Extratos bancários', 'Contrato', 'Comprovantes de negociação'],
    estimatedCost: 200.00,
    estimatedTime: '7-10 dias úteis',
    content: `
EXCELENTÍSSIMO(A) SENHOR(A) JUIZ(A) DE DIREITO DO JUIZADO ESPECIAL CÍVEL DA COMARCA DE [CIDADE]

[Conteúdo específico para disputas bancárias...]
    `
  },
  {
    id: 'telecom_dispute',
    name: 'Petição Inicial - Serviços de Telecomunicações',
    description: 'Modelo para reclamações contra operadoras de telecomunicações',
    category: 'telecom',
    requiredDocuments: ['Faturas', 'Contrato de serviço', 'Laudo técnico'],
    estimatedCost: 180.00,
    estimatedTime: '6-8 dias úteis',
    content: `
EXCELENTÍSSIMO(A) SENHOR(A) JUIZ(A) DE DIREITO DO JUIZADO ESPECIAL CÍVEL DA COMARCA DE [CIDADE]

[Conteúdo específico para telecomunicações...]
    `
  }
];

class EscalationServiceManager {
  async createEscalation(request: EscalationRequest): Promise<EscalationService> {
    const { complaintId, userId, reason, additionalInfo } = request;

    // Verificar se a reclamação existe e pertence ao usuário
    const complaint = await db.complaint.findFirst({
      where: {
        id: complaintId,
        userId: userId
      }
    });

    if (!complaint) {
      throw new Error('Reclamação não encontrada ou não pertence ao usuário');
    }

    // Verificar se já existe um escalonamento para esta reclamação
    const existingEscalation = await db.escalationService.findFirst({
      where: {
        complaintId,
        status: {
          in: ['PENDING', 'IN_PROGRESS']
        }
      }
    });

    if (existingEscalation) {
      throw new Error('Já existe um serviço de escalonamento em andamento para esta reclamação');
    }

    // Selecionar template adequado baseado na categoria
    const template = this.selectTemplate(complaint.category);
    
    // Criar serviço de escalonamento
    const escalation = await db.escalationService.create({
      data: {
        complaintId,
        userId,
        status: 'PENDING',
        reason,
        additionalInfo,
        estimatedCost: template.estimatedCost,
        estimatedTime: template.estimatedTime,
        documents: JSON.stringify([]),
        createdAt: new Date(),
        nextSteps: JSON.stringify(this.generateNextSteps(template))
      }
    });

    return {
      ...escalation,
      documents: [],
      nextSteps: JSON.parse(escalation.nextSteps as string)
    };
  }

  private selectTemplate(category: string): LegalTemplate {
    const templateMap: Record<string, string> = {
      'telecom': 'telecom_dispute',
      'banking': 'banking_dispute',
      'retail': 'consumer_complaint',
      'services': 'consumer_complaint',
      'utilities': 'consumer_complaint',
      'transport': 'consumer_complaint'
    };

    const templateId = templateMap[category] || 'consumer_complaint';
    return legalTemplates.find(t => t.id === templateId) || legalTemplates[0];
  }

  private generateNextSteps(template: LegalTemplate): string[] {
    return [
      'Análise inicial da documentação',
      'Preparação da petição inicial',
      'Revisão jurídica',
      'Formalização do processo',
      'Acompanhamento do andamento'
    ];
  }

  async uploadDocument(escalationId: string, document: File): Promise<EscalationDocument> {
    // Simular upload de documento
    const documentData: EscalationDocument = {
      id: `doc_${Date.now()}`,
      name: document.name,
      type: document.type,
      url: `/uploads/${document.name}`,
      uploadedAt: new Date().toISOString()
    };

    // Atualizar escalonamento com o novo documento
    const escalation = await db.escalationService.findUnique({
      where: { id: escalationId }
    });

    if (!escalation) {
      throw new Error('Serviço de escalonamento não encontrado');
    }

    const documents = escalation.documents ? JSON.parse(escalation.documents) : [];
    documents.push(documentData);

    await db.escalationService.update({
      where: { id: escalationId },
      data: {
        documents: JSON.stringify(documents)
      }
    });

    return documentData;
  }

  async generateLegalDocument(escalationId: string): Promise<string> {
    const escalation = await db.escalationService.findUnique({
      where: { id: escalationId },
      include: {
        complaint: {
          include: {
            user: true,
            company: true
          }
        }
      }
    });

    if (!escalation) {
      throw new Error('Serviço de escalonamento não encontrado');
    }

    // Selecionar template
    const template = this.selectTemplate(escalation.complaint.category);

    // Verificar se todos os documentos necessários foram enviados
    const documents = escalation.documents ? JSON.parse(escalation.documents) : [];
    const missingDocs = template.requiredDocuments.filter(reqDoc => 
      !documents.some((doc: any) => doc.name.toLowerCase().includes(reqDoc.toLowerCase()))
    );

    if (missingDocs.length > 0) {
      throw new Error(`Documentos necessários faltando: ${missingDocs.join(', ')}`);
    }

    // Gerar documento personalizado
    const legalDocument = this.populateTemplate(template, escalation);

    // Atualizar status do escalonamento
    await db.escalationService.update({
      where: { id: escalationId },
      data: {
        status: 'IN_PROGRESS',
        lawyerAssigned: 'Sistema Automático',
        updatedAt: new Date()
      }
    });

    return legalDocument;
  }

  private populateTemplate(template: LegalTemplate, escalation: any): string {
    // Lógica para popular o template com os dados da reclamação
    let content = template.content;

    // Substituir placeholders
    content = content.replace(/\[CIDADE\]/g, 'São Paulo');
    content = content.replace(/\[Nome Completo do Reclamante\]/g, escalation.complaint.user.name || '');
    content = content.replace(/\[nº RG\]/g, 'RG');
    content = content.replace(/\[nº CPF\]/g, escalation.complaint.user.document || '');
    content = content.replace(/\[Endereço Completo\]/g, 'Endereço do usuário');
    content = content.replace(/\[Nome Completo da Empresa\]/g, escalation.complaint.company.name);
    content = content.replace(/\[CNPJ\]/g, escalation.complaint.company.cnpj || '');
    content = content.replace(/\[Endereço Completo da Empresa\]/g, 'Endereço da empresa');

    // Adicionar descrição detalhada do caso
    const caseDescription = `
O autor contratou os serviços da ré, however, a empresa falhou em cumprir com suas obrigações contratuais, especificamente:

${escalation.complaint.description}

Após diversas tentativas de resolução amigável, incluindo reclamações nos canais de atendimento da empresa e órgãos de proteção ao consumidor, a questão permanece sem solução.

    `;

    content = content.replace(/\[Descrever detalhadamente os fatos que deram origem à reclamação\]/g, caseDescription);

    return content;
  }

  async getEscalationByUser(userId: string): Promise<EscalationService[]> {
    const escalations = await db.escalationService.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return escalations.map(escalation => ({
      ...escalation,
      documents: escalation.documents ? JSON.parse(escalation.documents) : [],
      nextSteps: escalation.nextSteps ? JSON.parse(escalation.nextSteps) : []
    }));
  }

  async updateEscalationStatus(escalationId: string, status: string): Promise<EscalationService> {
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const escalation = await db.escalationService.update({
      where: { id: escalationId },
      data: updateData
    });

    return {
      ...escalation,
      documents: escalation.documents ? JSON.parse(escalation.documents) : [],
      nextSteps: escalation.nextSteps ? JSON.parse(escalation.nextSteps) : []
    };
  }

  async getEscalationCostEstimate(complaintId: string): Promise<{ cost: number; time: string; requirements: string[] }> {
    const complaint = await db.complaint.findUnique({
      where: { id: complaintId }
    });

    if (!complaint) {
      throw new Error('Reclamação não encontrada');
    }

    const template = this.selectTemplate(complaint.category);

    return {
      cost: template.estimatedCost,
      time: template.estimatedTime,
      requirements: template.requiredDocuments
    };
  }

  async cancelEscalation(escalationId: string, userId: string): Promise<void> {
    const escalation = await db.escalationService.findFirst({
      where: {
        id: escalationId,
        userId
      }
    });

    if (!escalation) {
      throw new Error('Serviço de escalonamento não encontrado ou não pertence ao usuário');
    }

    if (escalation.status === 'COMPLETED') {
      throw new Error('Não é possível cancelar um serviço já concluído');
    }

    await db.escalationService.update({
      where: { id: escalationId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    });
  }
}

export const escalationServiceManager = new EscalationServiceManager();

// Funções utilitárias
export const getEscalationRequirements = (category: string): string[] => {
  const template = legalTemplates.find(t => t.category === category) || legalTemplates[0];
  return template.requiredDocuments;
};

export const calculateEscalationCost = (category: string, complexity: 'simple' | 'medium' | 'complex' = 'medium'): number => {
  const template = legalTemplates.find(t => t.category === category) || legalTemplates[0];
  let baseCost = template.estimatedCost;

  // Ajustar custo baseado na complexidade
  const complexityMultiplier = {
    simple: 0.8,
    medium: 1.0,
    complex: 1.5
  };

  return baseCost * complexityMultiplier[complexity];
};