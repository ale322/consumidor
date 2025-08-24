'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ExternalLink, 
  RefreshCw, 
  AlertTriangle,
  FileText,
  Scale,
  TrendingUp,
  Eye,
  MessageSquare
} from 'lucide-react';
import { useWebSocketNotifications } from '@/hooks/useWebSocketNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  protocol: string;
  createdAt: string;
  updatedAt: string;
  company: {
    name: string;
    category: string;
  };
  channels?: Array<{
    name: string;
    protocol?: string;
    status: string;
    sentAt: string;
    response?: string;
    respondedAt?: string;
  }>;
}

interface DashboardStats {
  totalComplaints: number;
  resolvedComplaints: number;
  inProgress: number;
  pendingResponse: number;
  averageResolutionTime: string;
  successRate: number;
}

interface EscalationService {
  id: string;
  complaintId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  documents: string[];
  estimatedCost: number;
  createdAt: string;
  completedAt?: string;
}

export const UnifiedDashboard: React.FC<{ userId: string }> = ({ userId }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalComplaints: 0,
    resolvedComplaints: 0,
    inProgress: 0,
    pendingResponse: 0,
    averageResolutionTime: '0 dias',
    successRate: 0
  });
  const [escalations, setEscalations] = useState<EscalationService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  const { isConnected, notifications, unreadCount } = useWebSocketNotifications({
    userId,
    onNotification: (notification) => {
      // Atualizar dashboard quando receber notificação
      loadDashboardData();
    }
  });

  // Simular carregamento de dados
  const loadDashboardData = async () => {
    setIsLoading(true);
    
    try {
      // Simular chamada API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados mockados para demonstração
      const mockComplaints: Complaint[] = [
        {
          id: '1',
          title: 'Internet lenta e instável',
          description: 'Minha conexão com internet está muito lenta nos últimos 15 dias',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          category: 'telecom',
          protocol: 'CC2024-001234',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-20T14:20:00Z',
          company: {
            name: 'Operadora X',
            category: 'Telecomunicações'
          },
          channels: [
            {
              name: 'Anatel',
              protocol: 'AN123456',
              status: 'IN_ANALYSIS',
              sentAt: '2024-01-15T11:00:00Z'
            },
            {
              name: 'Consumidor.gov',
              protocol: 'CG789012',
              status: 'WAITING_RESPONSE',
              sentAt: '2024-01-15T11:30:00Z',
              response: 'Sua reclamação foi encaminhada para a empresa',
              respondedAt: '2024-01-18T09:15:00Z'
            }
          ]
        },
        {
          id: '2',
          title: 'Cobrança indevida no cartão',
          description: 'Fui cobrado por um serviço que não contratei',
          status: 'RESOLVED',
          priority: 'MEDIUM',
          category: 'banking',
          protocol: 'CC2024-001235',
          createdAt: '2024-01-10T15:20:00Z',
          updatedAt: '2024-01-18T16:30:00Z',
          company: {
            name: 'Banco Y',
            category: 'Serviços Bancários'
          },
          channels: [
            {
              name: 'Banco Central do Brasil',
              protocol: 'BC345678',
              status: 'RESOLVED',
              sentAt: '2024-01-10T16:00:00Z',
              response: 'Cobrança cancelada e valor estornado',
              respondedAt: '2024-01-18T15:00:00Z'
            }
          ]
        },
        {
          id: '3',
          title: 'Produto com defeito',
          description: 'Comprei um celular que apresenta problemas na bateria',
          status: 'WAITING',
          priority: 'LOW',
          category: 'retail',
          protocol: 'CC2024-001236',
          createdAt: '2024-01-22T09:15:00Z',
          updatedAt: '2024-01-22T09:15:00Z',
          company: {
            name: 'Loja Z',
            category: 'Comércio'
          }
        }
      ];

      const mockStats: DashboardStats = {
        totalComplaints: 3,
        resolvedComplaints: 1,
        inProgress: 1,
        pendingResponse: 1,
        averageResolutionTime: '8 dias',
        successRate: 33.3
      };

      const mockEscalations: EscalationService[] = [
        {
          id: '1',
          complaintId: '3',
          status: 'PENDING',
          documents: ['Nota fiscal', 'Laudo técnico'],
          estimatedCost: 150.00,
          createdAt: '2024-01-22T10:00:00Z'
        }
      ];

      setComplaints(mockComplaints);
      setStats(mockStats);
      setEscalations(mockEscalations);
      setLastSync(new Date());
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS':
      case 'IN_ANALYSIS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'WAITING':
      case 'WAITING_RESPONSE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'RESPONDED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'IN_PROGRESS':
      case 'IN_ANALYSIS':
        return <Clock className="h-4 w-4" />;
      case 'WAITING':
      case 'WAITING_RESPONSE':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const refreshData = () => {
    loadDashboardData();
  };

  const requestEscalation = (complaintId: string) => {
    // Lógica para solicitar serviço de escalonamento
    console.log('Solicitando escalonamento para reclamação:', complaintId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-[#2A5C9A]" />
        <span className="ml-2">Carregando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2A5C9A]">Meu Dashboard</h1>
          <p className="text-gray-600">Acompanhe todas as suas reclamações em um só lugar</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Reclamações</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComplaints}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolvedComplaints}</div>
            <p className="text-xs text-muted-foreground">
              {stats.successRate.toFixed(1)}% de sucesso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Resposta</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingResponse}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="complaints" className="space-y-4">
        <TabsList>
          <TabsTrigger value="complaints">Minhas Reclamações</TabsTrigger>
          <TabsTrigger value="notifications">
            Notificações
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="escalations">Escalonamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="complaints" className="space-y-4">
          <div className="grid gap-4">
            {complaints.map((complaint) => (
              <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{complaint.title}</CardTitle>
                        <Badge className={getPriorityColor(complaint.priority)}>
                          {complaint.priority}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {complaint.company.name} • Protocolo: {complaint.protocol}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(complaint.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(complaint.status)}
                        {complaint.status}
                      </div>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{complaint.description}</p>
                  
                  {complaint.channels && complaint.channels.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Status nos Canais:</h4>
                      <div className="grid gap-2">
                        {complaint.channels.map((channel, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                {getStatusIcon(channel.status)}
                                <span className="font-medium text-sm">{channel.name}</span>
                              </div>
                              {channel.protocol && (
                                <Badge variant="outline" className="text-xs">
                                  {channel.protocol}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(channel.status)}>
                                {channel.status}
                              </Badge>
                              {channel.response && (
                                <Button size="sm" variant="outline">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Ver
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-gray-500">
                      Criado em {formatDistanceToNow(new Date(complaint.createdAt), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </div>
                    <div className="flex gap-2">
                      {complaint.status !== 'RESOLVED' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => requestEscalation(complaint.id)}
                        >
                          <Scale className="h-3 w-3 mr-1" />
                          Escalonar
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Nenhuma notificação</p>
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(notification.type)}
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{notification.type}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <div className="text-xs text-gray-500 mt-2">
                          {formatDistanceToNow(new Date(notification.timestamp), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="escalations" className="space-y-4">
          <div className="grid gap-4">
            {escalations.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Scale className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Nenhum serviço de escalonamento solicitado</p>
                </CardContent>
              </Card>
            ) : (
              escalations.map((escalation) => (
                <Card key={escalation.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Serviço de Escalonamento</CardTitle>
                      <Badge className={getStatusColor(escalation.status)}>
                        {escalation.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Custo Estimado:</span>
                        <span className="ml-2">R$ {escalation.estimatedCost.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="font-medium">Documentos:</span>
                        <span className="ml-2">{escalation.documents.length}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-xs text-gray-500">
                        Solicitado em {formatDistanceToNow(new Date(escalation.createdAt), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </div>
                      <Button size="sm" variant="outline">
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Last Sync Info */}
      <div className="text-xs text-gray-500 text-center">
        Última sincronização: {formatDistanceToNow(lastSync, { addSuffix: true, locale: ptBR })}
      </div>
    </div>
  );
};