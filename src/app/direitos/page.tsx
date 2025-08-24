'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  BookOpen, 
  Video, 
  FileText, 
  Clock, 
  Eye,
  Filter,
  TrendingUp,
  Star,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  Shield,
  Gavel,
  Users,
  Heart
} from 'lucide-react'

// Mock data for rights content
const categories = [
  { id: 'all', name: 'Todos os Direitos', icon: BookOpen, count: 45 },
  { id: 'products', name: 'Produtos', icon: Shield, count: 12 },
  { id: 'services', name: 'Serviços', icon: Users, count: 15 },
  { id: 'banking', name: 'Financeiro', icon: TrendingUp, count: 8 },
  { id: 'telecom', name: 'Telecomunicações', icon: Eye, count: 6 },
  { id: 'health', name: 'Saúde', icon: Heart, count: 4 }
]

const mockContent = [
  {
    id: '1',
    title: 'Direito de Arrependimento em Compras Online',
    content: 'O Código de Defesa do Consumidor garante o direito de arrependimento em compras realizadas fora do estabelecimento comercial, incluindo compras pela internet. Você tem até 7 dias corridos para desistir da compra, sem necessidade de justificar a razão.',
    category: 'products',
    tags: ['arrependimento', 'compra online', 'devolução'],
    readTime: 5,
    views: 1250,
    published: true,
    featured: true,
    createdAt: '2024-01-10T10:00:00Z',
    videoUrl: null
  },
  {
    id: '2',
    title: 'Como Funciona o Cadastro Positivo',
    content: 'O Cadastro Positivo é um banco de dados que registra informações sobre o histórico de pagamentos dos consumidores. Entenda como funciona, quais são seus direitos e como consultar seu cadastro.',
    category: 'banking',
    tags: ['cadastro positivo', 'serasa', 'score', 'crédito'],
    readTime: 8,
    views: 890,
    published: true,
    featured: false,
    createdAt: '2024-01-08T14:30:00Z',
    videoUrl: 'https://example.com/video-cadastro-positivo'
  },
  {
    id: '3',
    title: 'Direitos do Consumidor em Planos de Saúde',
    content: 'Os planos de saúde devem seguir regras estritas de atendimento, cobertura e reajustes. Conheça seus direitos em casos de negativa de cobertura, carências e reajustes abusivos.',
    category: 'health',
    tags: ['plano de saúde', 'ans', 'cobertura', 'carência'],
    readTime: 12,
    views: 2100,
    published: true,
    featured: true,
    createdAt: '2024-01-05T09:15:00Z',
    videoUrl: null
  },
  {
    id: '4',
    title: 'Cobranças Abusivas: Como Identificar e Agir',
    content: 'Juros excessivos, multas desproporcionais e cobranças por serviços não contratados caracterizam cobrança abusiva. Saiba como identificar e o que fazer nesses casos.',
    category: 'banking',
    tags: ['cobrança abusiva', 'juros', 'multa', 'procon'],
    readTime: 6,
    views: 1560,
    published: true,
    featured: false,
    createdAt: '2024-01-03T16:45:00Z',
    videoUrl: null
  },
  {
    id: '5',
    title: 'Garantia de Produtos: O Que a Lei Diz',
    content: 'A garantia legal de produtos é de 90 dias, independentemente da garantia contratual. Entenda como funciona, o que está coberto e como exigir seus direitos.',
    category: 'products',
    tags: ['garantia', 'defeito', 'fabricação', 'lei'],
    readTime: 7,
    views: 980,
    published: true,
    featured: false,
    createdAt: '2024-01-01T11:20:00Z',
    videoUrl: 'https://example.com/video-garantia'
  },
  {
    id: '6',
    title: 'Direitos em Serviços de Telecomunicações',
    content: 'Operadoras de telefonia e internet devem cumprir regras de qualidade, cobertura e atendimento. Conheça seus direitos em casos de falhas, cobranças indevidas e má qualidade do serviço.',
    category: 'telecom',
    tags: ['telecom', 'anatel', 'internet', 'telefonia'],
    readTime: 10,
    views: 1340,
    published: true,
    featured: true,
    createdAt: '2023-12-28T13:10:00Z',
    videoUrl: null
  }
]

const faqItems = [
  {
    question: 'O que fazer quando um produto apresenta defeito?',
    answer: 'Você pode exigir o reparo, substituição do produto, devolução do dinheiro ou abatimento proporcional do preço, nesta ordem de preferência.'
  },
  {
    question: 'Como funciona o prazo de garantia?',
    answer: 'A garantia legal é de 90 dias para produtos não duráveis e 180 dias para duráveis, além da garantia contratual oferecida pelo fabricante.'
  },
  {
    question: 'Posso cancelar um serviço a qualquer momento?',
    answer: 'Depende do contrato. Geralmente, serviços com prazo determinado podem ser cancelados com pagamento de multa proporcional, enquanto serviços sem prazo podem ser cancelados sem custos.'
  },
  {
    question: 'O que é publicidade enganosa?',
    answer: 'É qualquer modalidade de informação ou comunicação capaz de induzir o consumidor a erro sobre características, qualidade, quantidade, propriedades, origem, preço ou quaisquer outros dados sobre produtos ou serviços.'
  }
]

export default function DireitosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('relevant')
  const [content, setContent] = useState(mockContent)
  const [filteredContent, setFilteredContent] = useState(mockContent)

  useEffect(() => {
    let filtered = content

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Sort content
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'popular':
        filtered.sort((a, b) => b.views - a.views)
        break
      case 'readTime':
        filtered.sort((a, b) => (a.readTime || 0) - (b.readTime || 0))
        break
      default: // relevant
        // Featured content first, then by views
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return b.views - a.views
        })
    }

    setFilteredContent(filtered)
  }, [content, searchTerm, selectedCategory, sortBy])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatReadTime = (minutes: number) => {
    return `${minutes} min de leitura`
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#2A5C9A] to-[#1e4473] text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Biblioteca de Direitos do Consumidor
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Conheça seus direitos, entenda o Código de Defesa do Consumidor e aprenda como se proteger 
              em situações do dia a dia. Conteúdo educativo e prático para você se tornar um consumidor mais consciente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300" />
                <Input
                  placeholder="Buscar direitos, tópicos ou palavras-chave..."
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder-blue-200 focus:bg-white/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-semibold">
                Buscar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <BookOpen className="h-8 w-8 text-[#2A5C9A] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#333333]">45+</div>
              <div className="text-sm text-[#757575]">Artigos Educativos</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Video className="h-8 w-8 text-[#FF6B35] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#333333]">12</div>
              <div className="text-sm text-[#757575]">Vídeos Explicativos</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Eye className="h-8 w-8 text-[#4CAF50] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#333333]">15k+</div>
              <div className="text-sm text-[#757575]">Visualizações</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Users className="h-8 w-8 text-[#2A5C9A] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#333333]">98%</div>
              <div className="text-sm text-[#757575]">Satisfação</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg text-[#333333] flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Categorias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <button
                      key={category.id}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-[#2A5C9A] text-white'
                          : 'hover:bg-gray-100 text-[#333333]'
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <Badge variant="secondary" className={
                        selectedCategory === category.id ? 'bg-white/20 text-white' : ''
                      }>
                        {category.count}
                      </Badge>
                    </button>
                  )
                })}
              </CardContent>
            </Card>

            {/* Quick Access */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#333333]">Acesso Rápido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Gavel className="h-4 w-4 mr-2" />
                  Código de Defesa
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Perguntas Frequentes
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Dicas Úteis
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Header with Sort */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#333333]">
                  {selectedCategory === 'all' ? 'Todos os Artigos' : categories.find(c => c.id === selectedCategory)?.name}
                </h2>
                <p className="text-[#757575]">
                  {filteredContent.length} artigo(s) encontrado(s)
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#757575]">Ordenar por:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevant">Mais Relevantes</SelectItem>
                    <SelectItem value="recent">Mais Recentes</SelectItem>
                    <SelectItem value="popular">Mais Populares</SelectItem>
                    <SelectItem value="readTime">Menor Tempo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Featured Content */}
            {selectedCategory === 'all' && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#333333] mb-4">Destaques</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredContent.filter(item => item.featured).slice(0, 2).map((item) => (
                    <Card key={item.id} className="border-l-4 border-l-[#FF6B35] hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg text-[#333333] mb-2">{item.title}</CardTitle>
                            <div className="flex items-center gap-4 text-sm text-[#757575]">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatReadTime(item.readTime)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {item.views} visualizações
                              </span>
                            </div>
                          </div>
                          {item.videoUrl && (
                            <Badge className="bg-red-100 text-red-800">
                              <Video className="h-3 w-3 mr-1" />
                              Vídeo
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-[#757575] mb-4 line-clamp-3">
                          {item.content}
                        </CardDescription>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {item.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Button variant="outline" size="sm">
                            Ler Mais
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Content */}
            <div className="space-y-6">
              {filteredContent.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-[#333333] mb-2">{item.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-[#757575]">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatReadTime(item.readTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {item.views} visualizações
                          </span>
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                      </div>
                      {item.videoUrl && (
                        <Badge className="bg-red-100 text-red-800">
                          <Video className="h-3 w-3 mr-1" />
                          Vídeo
                        </Badge>
                      )}
                      {item.featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          Destaque
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-[#757575] mb-4 line-clamp-2">
                      {item.content}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button variant="outline" size="sm">
                        Ler Mais
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* FAQ Section */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-[#333333] mb-6">Perguntas Frequentes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {faqItems.map((faq, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg text-[#333333] flex items-start gap-2">
                        <HelpCircle className="h-5 w-5 text-[#2A5C9A] mt-0.5 flex-shrink-0" />
                        {faq.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[#757575]">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}