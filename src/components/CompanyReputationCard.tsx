'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, TrendingUp, TrendingDown, Minus, Award, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { CompanyReputation } from '@/lib/companyReputation';

interface CompanyReputationCardProps {
  reputation: CompanyReputation;
  showDetails?: boolean;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

const getScoreBgColor = (score: number) => {
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-yellow-100';
  return 'bg-red-100';
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'improving':
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'declining':
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-gray-500" />;
  }
};

const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'improving':
      return 'text-green-600 bg-green-50';
    case 'declining':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export const CompanyReputationCard: React.FC<CompanyReputationCardProps> = ({ 
  reputation, 
  showDetails = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const resolutionRate = reputation.totalComplaints > 0 
    ? (reputation.resolvedComplaints / reputation.totalComplaints) * 100 
    : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            {reputation.companyName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreBgColor(reputation.overallScore)} ${getScoreColor(reputation.overallScore)}`}>
              {reputation.overallScore}/100
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getTrendColor(reputation.trend)}`}>
              {getTrendIcon(reputation.trend)}
              {reputation.trend === 'improving' && 'Melhorando'}
              {reputation.trend === 'declining' && 'Piorando'}
              {reputation.trend === 'stable' && 'Estável'}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {reputation.badges.map((badge, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              <Award className="h-3 w-3 mr-1" />
              {badge}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {reputation.resolvedComplaints}
            </div>
            <div className="text-sm text-gray-600">Resolvidas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {reputation.pendingComplaints}
            </div>
            <div className="text-sm text-gray-600">Pendentes</div>
          </div>
        </div>

        {/* Resolution Rate */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Taxa de Resolução</span>
            <span className="text-sm font-bold text-green-600">
              {resolutionRate.toFixed(1)}%
            </span>
          </div>
          <Progress value={resolutionRate} className="h-2" />
        </div>

        {/* Average Resolution Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Tempo Médio</span>
          </div>
          <span className="text-sm font-semibold">
            {reputation.averageResolutionTime} dias
          </span>
        </div>

        {/* Response Rate */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-600">Taxa de Resposta</span>
          </div>
          <span className="text-sm font-semibold text-green-600">
            {reputation.responseRate}%
          </span>
        </div>

        {/* Category Rankings */}
        {reputation.categoryRanking && reputation.categoryRanking.length > 0 && (
          <div className="border-t pt-3">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Ranking no Setor
            </div>
            {reputation.categoryRanking.map((ranking, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{ranking.category}</span>
                <span className="font-semibold">
                  #{ranking.rank} de {ranking.totalCompanies}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Expandable Details */}
        {showDetails && (
          <div className="border-t pt-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {isExpanded ? 'Menos detalhes' : 'Mais detalhes'}
            </button>
            
            {isExpanded && (
              <div className="mt-3 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Satisfação do Cliente</span>
                  <span className="font-semibold">{reputation.satisfactionScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total de Reclamações</span>
                  <span className="font-semibold">{reputation.totalComplaints}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Última Atualização</span>
                  <span className="font-semibold">
                    {new Date(reputation.lastUpdated).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status Indicator */}
        <div className="flex items-center gap-2 pt-2 border-t">
          {reputation.overallScore >= 80 && (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700 font-medium">
                Empresa Excelente - Alta confiança
              </span>
            </>
          )}
          {reputation.overallScore >= 60 && reputation.overallScore < 80 && (
            <>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-yellow-700 font-medium">
                Empresa Regular - Confiança moderada
              </span>
            </>
          )}
          {reputation.overallScore < 60 && (
            <>
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700 font-medium">
                Empresa com Atenção - Baixa confiança
              </span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};