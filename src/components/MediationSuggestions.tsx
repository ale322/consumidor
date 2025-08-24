'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lightbulb, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  FileText,
  Scale,
  Users,
  Timer
} from 'lucide-react';
import { MediationAnalysis, MediationSuggestion } from '@/lib/mediation';

interface MediationSuggestionsProps {
  complaintId: string;
  onSuggestionSelect?: (suggestion: MediationSuggestion) => void;
}

const getSuggestionIcon = (type: string) => {
  switch (type) {
    case 'legal':
      return <Scale className="h-5 w-5 text-purple-500" />;
    case 'negotiation':
      return <Users className="h-5 w-5 text-blue-500" />;
    case 'compromise':
      return <Target className="h-5 w-5 text-green-500" />;
    case 'escalation':
      return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    default:
      return <Lightbulb className="h-5 w-5 text-yellow-500" />;
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'text-green-600 bg-green-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'hard':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getRiskColor = (level: string) => {
  switch (level) {
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const MediationSuggestions: React.FC<MediationSuggestionsProps> = ({ 
  complaintId, 
  onSuggestionSelect 
}) => {
  const [analysis, setAnalysis] = useState<MediationAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  useEffect(() => {
    loadMediationAnalysis();
  }, [complaintId]);

  const loadMediationAnalysis = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockAnalysis: MediationAnalysis = {
        complaintId,
        suggestions: [
          {
            id: '1',
            type: 'negotiation',
            title: 'Negociação Direta com a Empresa',
            description: 'Iniciar contato direto com a empresa buscando uma solução amigável através do canal de atendimento ao cliente.',
            steps: [
              'Documentar todos os problemas e comunicações anteriores',
              'Entrar em contato com o serviço de atendimento ao cliente',
              'Apresentar o problema de forma clara e objetiva',
              'Propor uma solução razoável com prazos definidos',
              'Confirmar o acordo por escrito'
            ],
            estimatedSuccessRate: 78,
            timeframe: '7-15 dias',
            difficulty: 'easy',
            category: 'telecom',
            similarCases: [
              { title: 'Cobrança indevida de serviços', outcome: 'resolved', satisfaction: 85 },
              { title: 'Problema com qualidade do sinal', outcome: 'resolved', satisfaction: 92 }
            ]
          },
          {
            id: '2',
            type: 'escalation',
            title: 'Escalonamento para Órgãos Reguladores',
            description: 'Buscar apoio de órgãos de proteção ao consumidor e reguladores do setor de telecomunicações.',
            steps: [
              'Registrar reclamação formal no Procon',
              'Contactar a Anatel (Agência Nacional de Telecomunicações)',
              'Buscar orientação da Defensoria Pública',
              'Considerar mediação junto à empresa',
              'Preparar documentação para possível ação judicial'
            ],
            estimatedSuccessRate: 85,
            timeframe: '30-60 dias',
            difficulty: 'medium',
            category: 'telecom',
            similarCases: [
              { title: 'Recusa de cancelamento de contrato', outcome: 'resolved', satisfaction: 88 },
              { title: 'Serviço não prestado conforme contrato', outcome: 'resolved', satisfaction: 90 }
            ],
            legalReferences: [
              { article: 'Art. 5º, XXXII - CF/88', description: 'O Estado promoverá, na forma da lei, a defesa do consumidor' },
              { article: 'Art. 6º - CDC', description: 'Direitos básicos do consumidor, incluindo a proteção contra práticas abusivas' }
            ]
          },
          {
            id: '3',
            type: 'compromise',
            title: 'Acordo de Composição',
            description: 'Buscar uma solução de meio-termo que atenda tanto o consumidor quanto a empresa.',
            steps: [
              'Identificar os pontos essenciais do conflito',
              'Listar as necessidades e limites de cada parte',
              'Propor alternativas de solução criativas',
              'Documentar o acordo proposto com cláusulas claras',
              'Estabelecer mecanismos de acompanhamento'
            ],
            estimatedSuccessRate: 72,
            timeframe: '15-30 dias',
            difficulty: 'medium',
            category: 'telecom',
            similarCases: [
              { title: 'Ajuste de contrato após mudança de planos', outcome: 'partially_resolved', satisfaction: 75 },
              { title: 'Compensação por intermitência no serviço', outcome: 'resolved', satisfaction: 82 }
            ]
          }
        ],
        similarCases: [
          {
            complaintId: 'case-1',
            similarityScore: 0.85,
            title: 'Cobrança indevida de serviços não contratados',
            description: 'Cliente sendo cobrado por serviços que não solicitou',
            resolution: 'Empresa reconheceu o erro e estornou os valores',
            outcome: 'resolved',
            satisfaction: 92,
            category: 'telecom',
            company: 'Telecom Brasil',
            resolutionTime: 12
          },
          {
            complaintId: 'case-2',
            similarityScore: 0.78,
            title: 'Qualidade do serviço abaixo do contratado',
            description: 'Internet com velocidade muito inferior à contratada',
            resolution: 'Empresa ajustou a velocidade e concedeu desconto',
            outcome: 'resolved',
            satisfaction: 88,
            category: 'telecom',
            company: 'Telecom Brasil',
            resolutionTime: 18
          }
        ],
        successProbability: 82,
        recommendedActions: [
          'Reúna todas as faturas e comprovantes de pagamento',
          'Documente todas as comunicações com a empresa',
          'Registre a reclamação no Procon e Anatel',
          'Solicite formalmente o cancelamento ou ajuste do serviço',
          'Mantenha um registro detalhado de todos os contatos'
        ],
        riskAssessment: {
          level: 'medium',
          factors: [
            'Empresa com histórico de demora em resoluções',
            'Setor de telecomunicações com regulação específica',
            'Caso documentado com boas evidências'
          ]
        },
        timeline: {
          bestCase: '7 dias',
          average: '25 dias',
          worstCase: '60 dias'
        }
      };

      setTimeout(() => {
        setAnalysis(mockAnalysis);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error loading mediation analysis:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Análise de Mediação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Não foi possível carregar a análise
          </h3>
          <p className="text-gray-600">
            Tente novamente mais tarde
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Análise Inteligente de Mediação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {analysis.successProbability}%
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Probabilidade de Sucesso
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {analysis.suggestions.length}
              </div>
              <div className="text-sm text-gray-600">
                Sugestões de Mediação
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {analysis.similarCases.length}
              </div>
              <div className="text-sm text-gray-600">
                Casos Similares
              </div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                analysis.riskAssessment.level === 'low' ? 'text-green-600' :
                analysis.riskAssessment.level === 'medium' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {analysis.riskAssessment.level === 'low' ? 'Baixo' :
                 analysis.riskAssessment.level === 'medium' ? 'Médio' : 'Alto'}
              </div>
              <div className="text-sm text-gray-600">
                Nível de Risco
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Prazos Estimados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {analysis.timeline.bestCase}
              </div>
              <div className="text-sm text-gray-600">Melhor Cenário</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {analysis.timeline.average}
              </div>
              <div className="text-sm text-gray-600">Média</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600">
                {analysis.timeline.worstCase}
              </div>
              <div className="text-sm text-gray-600">Pior Cenário</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card className={getRiskColor(analysis.riskAssessment.level)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Avaliação de Risco
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                analysis.riskAssessment.level === 'low' ? 'bg-green-500' :
                analysis.riskAssessment.level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="font-medium">
                Risco {analysis.riskAssessment.level === 'low' ? 'Baixo' :
                       analysis.riskAssessment.level === 'medium' ? 'Médio' : 'Alto'}
              </span>
            </div>
            <ul className="space-y-1">
              {analysis.riskAssessment.factors.map((factor, index) => (
                <li key={index} className="text-sm flex items-center gap-2">
                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="suggestions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
          <TabsTrigger value="cases">Casos Similares</TabsTrigger>
          <TabsTrigger value="actions">Ações Recomendadas</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-4">
          {analysis.suggestions.map((suggestion) => (
            <Card key={suggestion.id} className={`transition-all ${
              selectedSuggestion === suggestion.id ? 'ring-2 ring-blue-500' : ''
            }`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getSuggestionIcon(suggestion.type)}
                    <div>
                      <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                      <p className="text-gray-600 text-sm mt-1">{suggestion.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(suggestion.difficulty)}>
                      {suggestion.difficulty === 'easy' ? 'Fácil' :
                       suggestion.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                    </Badge>
                    <Badge variant="outline">
                      {suggestion.estimatedSuccessRate}% sucesso
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Prazo estimado: {suggestion.timeframe}</span>
                    </div>
                    <Progress value={suggestion.estimatedSuccessRate} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">
                      Taxa de sucesso: {suggestion.estimatedSuccessRate}%
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Passos recomendados:
                    </h4>
                    <ol className="space-y-2">
                      {suggestion.steps.map((step, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {suggestion.legalReferences && suggestion.legalReferences.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Scale className="h-4 w-4" />
                        Referências legais:
                      </h4>
                      <div className="space-y-1">
                        {suggestion.legalReferences.map((ref, index) => (
                          <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                            <div className="font-medium">{ref.article}</div>
                            <div className="text-gray-600">{ref.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {suggestion.similarCases && suggestion.similarCases.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Casos similares resolvidos:</h4>
                      <div className="space-y-2">
                        {suggestion.similarCases.map((case_, index) => (
                          <div key={index} className="text-sm flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span>{case_.title}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant={case_.outcome === 'resolved' ? 'default' : 'secondary'}>
                                {case_.outcome === 'resolved' ? 'Resolvido' : 'Parcial'}
                              </Badge>
                              <span className="text-xs text-gray-500">{case_.satisfaction}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => {
                        setSelectedSuggestion(suggestion.id);
                        onSuggestionSelect?.(suggestion);
                      }}
                      className="flex-1"
                    >
                      Selecionar esta abordagem
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="cases" className="space-y-4">
          {analysis.similarCases.map((case_, index) => (
            <Card key={case_.complaintId}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{case_.title}</CardTitle>
                    <p className="text-gray-600 text-sm mt-1">{case_.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={case_.outcome === 'resolved' ? 'default' : 'secondary'}>
                      {case_.outcome === 'resolved' ? 'Resolvido' : 
                       case_.outcome === 'partially_resolved' ? 'Parcial' : 'Não resolvido'}
                    </Badge>
                    <div className="text-sm font-medium">
                      {Math.round(case_.similarityScore * 100)}% similar
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-700">Empresa</div>
                    <div>{case_.company}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Resolução</div>
                    <div>{case_.resolution}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Satisfação</div>
                    <div className="flex items-center gap-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${case_.satisfaction}%` }}
                        />
                      </div>
                      <span className="text-xs">{case_.satisfaction}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Tempo</div>
                    <div>{case_.resolutionTime} dias</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Ações Recomendadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.recommendedActions.map((action, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="text-sm">{action}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};