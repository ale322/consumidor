'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  ChevronLeft, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  MessageSquare,
  Paperclip,
  Share2,
  Download,
  RefreshCw,
  Send,
  FileText,
  Building2,
  Calendar,
  Hash
} from 'lucide-react'

// Mock data for demonstration
const mockComplaint = {
  id: '1',
  title: 'Cobrança indevida em plano telefônico',
  description: 'Fui cobrado por serviços não contratados em meu plano telefônico. Entrei em contato com a operadora diversas vezes, mas não obtive solução. O valor cobrado é de R$ 89,90 referente a pacote de dados que nunca ativei.',
  category: 'Telecomunicações',
  subcategory: 'Cobrança',
  priority: 'HIGH',
  status: 'WAITING',
  protocol: 'CC2024-001234',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-16T14:20:00Z',
  estimatedDate: '2024-02-15T10:30:00Z',
  channels: ['Procon', 'Anatel', 'Reclame Aqui', 'Ouvidoria da Empresa'],
  documents: [
    { name: 'Fatura_janeiro.pdf', size: 245760, url: '/docs/fatura-janeiro.pdf' },
    { name: 'Screenshot_app.jpg', size: 153600, url: '/docs/screenshot-app.jpg' },
    { name: 'Chat_atendimento.pdf', size: 327680, url: '/docs/chat-atendimento.pdf' }
  ],
  company: {
    name: 'Operadora XYZ Telecom',
    cnpj: '00.000.000/0001-00',
    category: 'Telecomunicações'
  }
}

const mockUpdates = [
  {
    id: '1',
    message: 'Reclamação registrada com sucesso. Protocolo CC2024-001234 gerado.',
    source: 'system',
    channel: null,
    createdAt: '2024-01-15T10:30:00Z',
    metadata: {
      action: 'created',
      protocol: 'CC2024-001234'
    }
  },
  {
    id: '2',
    message: 'Reclamação enviada para os canais: Procon, Anatel, Reclame Aqui, Ouvidoria da Empresa.',
    source: 'system',
    channel: null,
    createdAt: '2024-01-15T11:00:00Z',
    metadata: {
      action: 'distributed',
      channels: ['Procon', 'Anatel', 'Reclame Aqui', 'Ouvidoria da Empresa']
    }
  },
  {
    id: '3',
    message: 'Recebemos sua reclamação. Estamos analisando o caso e retornaremos em até 5 dias úteis.',
    source: 'company',
    channel: 'Ouvidoria da Empresa',
    createdAt: '2024-01-16T09:15:00Z',
    metadata: {
      responseId: 'RESP-001',
      agent: 'João Silva'
    }
  },
  {
    id: '4',
    message: 'Seu caso foi registrado no Procon sob o número 12345/2024. Você pode acompanhar pelo site do Procon.',
    source: 'channel',
    channel: 'Procon',
    createdAt: '2024-01-16T14:20:00Z',
    metadata: {
      externalId: '12345/2024',
      status: 'registered'
    }
  }
]

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'ANALYSIS':
      return { 
        label: 'Em Análise', 
        color: 'bg-blue-500',
        textColor: 'text-blue-500',
        bgColor: 'bg-blue-50',
        icon: Clock
      }
    case 'WAITING':
      return { 
        label: 'Aguardando Resposta', 
        color: 'bg-orange-500',
        textColor: 'text-orange-500',
        bgColor: 'bg-orange-50',
        icon: Clock
      }
    case 'RESPONDED':
      return { 
        label: 'Respondida', 
        color: 'bg-yellow-500',
        textColor: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        icon: MessageSquare
      }
    case 'RESOLVED':
      return { 
        label: 'Resolvida', 
        color: 'bg-green-500',
        textColor: 'text-green-500',
        bgColor: 'bg-green-50',
        icon: CheckCircle
      }
    case 'NOT_RESOLVED':
      return { 
        label: 'Não Resolvida', 
        color: 'bg-red-500',
        textColor: 'text-red-500',
        bgColor: 'bg-red-50',
        icon: XCircle
      }
    default:
      return { 
        label: 'Desconhecido', 
        color: 'bg-gray-500',
        textColor: 'text-gray-500',
        bgColor: 'bg-gray-50',
        icon: AlertCircle
      }
  }
}

const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case 'LOW':
      return { label: 'Baixa', color: 'bg-gray-100 text-gray-800' }
    case 'MEDIUM':
      return { label: 'Média', color: 'bg-yellow-100 text-yellow-800' }
    case 'HIGH':
      return { label: 'Alta', color: 'bg-orange-100 text-orange-800' }
    case 'URGENT':
      return { label: 'Urgente', color: 'bg-red-100 text-red-800' }
    default:
      return { label: 'Desconhecida', color: 'bg-gray-100 text-gray-800' }
  }
}

const getSourceConfig = (source: string) => {
  switch (source) {
    case 'system':
      return { label: 'Sistema', color: 'bg-blue-100 text-blue-800' }
    case 'user':
      return { label: 'Você', color: 'bg-green-100 text-green-800' }
    case 'company':
      return { label: 'Empresa', color: 'bg-purple-100 text-purple-800' }
    case 'channel':
      return { label: 'Canal Externo', color: 'bg-orange-100 text-orange-800' }
    default:
      return { label: 'Desconhecido', color: 'bg-gray-100 text-gray-800' }
  }
}

export default function ComplaintDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [complaint, setComplaint] = useState(mockComplaint)
  const [updates, setUpdates] = useState(mockUpdates)
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const statusConfig = getStatusConfig(complaint.status)
  const priorityConfig = getPriorityConfig(complaint.priority)
  const StatusIcon = statusConfig.icon

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const newUpdate = {
        id: String(updates.length + 1),
        message: newMessage,
        source: 'user',
        channel: null,
        createdAt: new Date().toISOString(),
        metadata: {}
      }
      
      setUpdates([newUpdate, ...updates])
      setNewMessage('')
      setIsLoading(false)
    }, 1000)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <ChevronLeft className="h-5 w-5 text-[#757575]" />
              <span className="text-[#757575]">Voltar ao Dashboard</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Status Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-[#333333]">{complaint.title}</h1>
                  <Badge className={priorityConfig.color}>
                    {priorityConfig.label}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-[#757575] mb-4">
                  <span className="flex items-center gap-1">
                    <Hash className="h-4 w-4" />
                    {complaint.protocol}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {complaint.company.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(complaint.createdAt)}
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bgColor}`}>
                    <StatusIcon className={`h-4 w-4 ${statusConfig.textColor}`} />
                    <span className={`text-sm font-medium ${statusConfig.textColor}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  
                  {complaint.estimatedDate && (
                    <div className="text-sm text-[#757575]">
                      Previsão de resolução: {new Date(complaint.estimatedDate).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-[#757575] mb-1">Canais ativos</div>
                <div className="flex flex-wrap gap-1">
                  {complaint.channels.map((channel, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {channel}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#333333] flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Linha do Tempo
                </CardTitle>
                <CardDescription className="text-[#757575]">
                  Acompanhe todas as atualizações da sua reclamação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {updates.map((update, index) => {
                    const sourceConfig = getSourceConfig(update.source)
                    
                    return (
                      <div key={update.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            update.source === 'system' ? 'bg-blue-500' :
                            update.source === 'user' ? 'bg-green-500' :
                            update.source === 'company' ? 'bg-purple-500' :
                            'bg-orange-500'
                          }`}></div>
                          {index < updates.length - 1 && (
                            <div className="w-px h-16 bg-gray-300 mt-2"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={sourceConfig.color}>
                              {sourceConfig.label}
                            </Badge>
                            {update.channel && (
                              <Badge variant="outline" className="text-xs">
                                {update.channel}
                              </Badge>
                            )}
                            <span className="text-sm text-[#757575]">
                              {formatDate(update.createdAt)}
                            </span>
                          </div>
                          
                          <p className="text-[#333333]">{update.message}</p>
                          
                          {update.metadata && Object.keys(update.metadata).length > 0 && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-[#757575]">
                              <pre>{JSON.stringify(update.metadata, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Add Message */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#333333] flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Adicionar Atualização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div>
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      placeholder="Descreva novas informações, respostas recebidas ou atualizações sobre o caso..."
                      className="min-h-[100px]"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="bg-[#2A5C9A] hover:bg-[#2A5C9A]/90"
                    disabled={isLoading || !newMessage.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isLoading ? 'Enviando...' : 'Enviar Atualização'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#333333]">Detalhes da Reclamação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-[#757575]">Categoria</Label>
                  <p className="text-[#333333]">{complaint.category}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-[#757575]">Subcategoria</Label>
                  <p className="text-[#333333]">{complaint.subcategory}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-[#757575]">Empresa</Label>
                  <p className="text-[#333333]">{complaint.company.name}</p>
                  <p className="text-sm text-[#757575]">CNPJ: {complaint.company.cnpj}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-[#757575]">Descrição</Label>
                  <p className="text-[#333333] text-sm leading-relaxed">{complaint.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#333333] flex items-center gap-2">
                  <Paperclip className="h-5 w-5" />
                  Documentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complaint.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-[#333333]">{doc.name}</p>
                          <p className="text-xs text-[#757575]">{formatFileSize(doc.size)}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Visualizar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#333333]">Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Verificar Status
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar Caso
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Relatório
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}