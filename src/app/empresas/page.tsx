'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, TrendingUp, Star, Award, Medal } from 'lucide-react';
import { CompanyReputationCard } from '@/components/CompanyReputationCard';
import { CompanyReputation } from '@/lib/companyReputation';

export default function EmpresasPage() {
  const [companies, setCompanies] = useState<CompanyReputation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'score' | 'resolved' | 'fastest'>('score');

  // Mock categories - in real app, this would come from API
  const categories = [
    'all',
    'telecom',
    'banking',
    'retail',
    'health',
    'education',
    'services',
    'technology'
  ];

  // Mock data for demonstration
  const mockCompanies: CompanyReputation[] = [
    {
      companyId: '1',
      companyName: 'Telecom Brasil',
      overallScore: 92,
      totalComplaints: 145,
      resolvedComplaints: 138,
      pendingComplaints: 7,
      averageResolutionTime: 5,
      responseRate: 98,
      satisfactionScore: 94,
      lastUpdated: new Date().toISOString(),
      trend: 'improving',
      badges: ['Excelente', 'Resolutivo', 'Muito Rápido'],
      categoryRanking: [{ category: 'telecom', rank: 1, totalCompanies: 15 }]
    },
    {
      companyId: '2',
      companyName: 'Banco Seguro',
      overallScore: 88,
      totalComplaints: 89,
      resolvedComplaints: 82,
      pendingComplaints: 7,
      averageResolutionTime: 8,
      responseRate: 95,
      satisfactionScore: 90,
      lastUpdated: new Date().toISOString(),
      trend: 'stable',
      badges: ['Excelente', 'Resolutivo', 'Rápido'],
      categoryRanking: [{ category: 'banking', rank: 2, totalCompanies: 20 }]
    },
    {
      companyId: '3',
      companyName: 'Saúde Plus',
      overallScore: 85,
      totalComplaints: 67,
      resolvedComplaints: 62,
      pendingComplaints: 5,
      averageResolutionTime: 12,
      responseRate: 92,
      satisfactionScore: 87,
      lastUpdated: new Date().toISOString(),
      trend: 'improving',
      badges: ['Excelente', 'Resolutivo'],
      categoryRanking: [{ category: 'health', rank: 1, totalCompanies: 12 }]
    },
    {
      companyId: '4',
      companyName: 'Educação Futuro',
      overallScore: 78,
      totalComplaints: 34,
      resolvedComplaints: 28,
      pendingComplaints: 6,
      averageResolutionTime: 15,
      responseRate: 88,
      satisfactionScore: 80,
      lastUpdated: new Date().toISOString(),
      trend: 'stable',
      badges: ['Bom'],
      categoryRanking: [{ category: 'education', rank: 3, totalCompanies: 8 }]
    },
    {
      companyId: '5',
      companyName: 'Varejo Rápido',
      overallScore: 72,
      totalComplaints: 203,
      resolvedComplaints: 168,
      pendingComplaints: 35,
      averageResolutionTime: 10,
      responseRate: 85,
      satisfactionScore: 75,
      lastUpdated: new Date().toISOString(),
      trend: 'declining',
      badges: ['Bom', 'Rápido'],
      categoryRanking: [{ category: 'retail', rank: 5, totalCompanies: 25 }]
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCompanies(mockCompanies);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCompanies = companies
    .filter(company => {
      const matchesSearch = company.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || 
        company.categoryRanking?.some(r => r.category === selectedCategory);
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.overallScore - a.overallScore;
        case 'resolved':
          return b.resolvedComplaints - a.resolvedComplaints;
        case 'fastest':
          return a.averageResolutionTime - b.averageResolutionTime;
        default:
          return 0;
      }
    });

  const topCompanies = filteredCompanies.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Ranking de Empresas
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Avaliamos empresas com base em resolução de reclamações, tempo de resposta e satisfação dos clientes
        </p>
      </div>

      {/* Top 3 Companies */}
      <div className="mb-12">
        <div className="flex items-center justify-center mb-6">
          <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Top 3 Empresas</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {topCompanies.map((company, index) => (
            <Card key={company.companyId} className="relative overflow-hidden">
              {index === 0 && (
                <div className="absolute top-0 right-0 bg-yellow-500 text-white px-3 py-1 text-sm font-bold">
                  <Medal className="h-4 w-4 inline mr-1" />
                  1º Lugar
                </div>
              )}
              {index === 1 && (
                <div className="absolute top-0 right-0 bg-gray-400 text-white px-3 py-1 text-sm font-bold">
                  <Medal className="h-4 w-4 inline mr-1" />
                  2º Lugar
                </div>
              )}
              {index === 2 && (
                <div className="absolute top-0 right-0 bg-orange-600 text-white px-3 py-1 text-sm font-bold">
                  <Medal className="h-4 w-4 inline mr-1" />
                  3º Lugar
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-lg">{company.companyName}</CardTitle>
                <div className="text-3xl font-bold text-blue-600">
                  {company.overallScore}/100
                </div>
                <div className="flex justify-center gap-1">
                  {company.badges.slice(0, 2).map((badge, badgeIndex) => (
                    <Badge key={badgeIndex} variant="secondary" className="text-xs">
                      <Award className="h-3 w-3 mr-1" />
                      {badge}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              
              <CardContent className="text-center">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-bold text-green-600">{company.resolvedComplaints}</div>
                    <div className="text-gray-600">Resolvidas</div>
                  </div>
                  <div>
                    <div className="font-bold text-blue-600">{company.averageResolutionTime}d</div>
                    <div className="text-gray-600">Tempo Médio</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar empresas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {categories.slice(1).map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Melhor Avaliação</SelectItem>
                <SelectItem value="resolved">Mais Resolvidas</SelectItem>
                <SelectItem value="fastest">Mais Rápidas</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Empresas ({filteredCompanies.length})
        </h3>
        <p className="text-gray-600">
          Ordenado por {sortBy === 'score' ? 'melhor avaliação' : sortBy === 'resolved' ? 'mais reclamações resolvidas' : 'tempo de resolução mais rápido'}
        </p>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <CompanyReputationCard
              key={company.companyId}
              reputation={company}
              showDetails={true}
            />
          ))}
        </div>
      )}

      {filteredCompanies.length === 0 && !loading && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma empresa encontrada
            </h3>
            <p className="text-gray-600">
              Tente ajustar seus filtros ou termos de busca
            </p>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estatísticas Gerais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {companies.length}
              </div>
              <div className="text-sm text-gray-600">Empresas Avaliadas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {Math.round(companies.reduce((sum, c) => sum + c.overallScore, 0) / companies.length)}
              </div>
              <div className="text-sm text-gray-600">Média Geral</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {companies.filter(c => c.overallScore >= 80).length}
              </div>
              <div className="text-sm text-gray-600">Empresas Excelentes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {Math.round(companies.reduce((sum, c) => sum + c.resolvedComplaints, 0) / companies.reduce((sum, c) => sum + c.totalComplaints, 1) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Taxa de Resolução</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}