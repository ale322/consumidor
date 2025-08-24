'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Info, ArrowRight, ArrowLeft } from 'lucide-react';
import { suggestChannels } from '@/lib/channelSuggestion';

interface ComplaintData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    document: string;
  };
  complaintDetails: {
    category: string;
    subcategory: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  };
  companyInfo: {
    name: string;
    cnpj?: string;
    category: string;
  };
  suggestedChannels: Array<{
    name: string;
    description: string;
    effectiveness: number;
    estimatedTime: string;
  }>;
}

const categories = [
  { value: 'telecom', label: 'Telecomunicações', subcategories: ['Internet', 'Telefone Fixo', 'Telefone Móvel', 'TV por Assinatura'] },
  { value: 'banking', label: 'Serviços Bancários', subcategories: ['Conta Corrente', 'Cartão de Crédito', 'Empréstimo', 'Investimentos'] },
  { value: 'retail', label: 'Comércio', subcategories: ['Produto com Defeito', 'Troca/Devolução', 'Atendimento', 'Preço'] },
  { value: 'services', label: 'Serviços', subcategories: ['Serviços Domésticos', 'Consultoria', 'Saúde', 'Educação'] },
  { value: 'utilities', label: 'Serviços Públicos', subcategories: ['Energia Elétrica', 'Água e Esgoto', 'Gás'] },
  { value: 'transport', label: 'Transporte', subcategories: ['Aéreo', 'Terrestre', 'Aplicativos', 'Transporte Público'] },
];

export const SmartComplaintForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [complaintData, setComplaintData] = useState<ComplaintData>({
    personalInfo: { name: '', email: '', phone: '', document: '' },
    complaintDetails: { category: '', subcategory: '', title: '', description: '', priority: 'medium' },
    companyInfo: { name: '', cnpj: '', category: '' },
    suggestedChannels: []
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const updatePersonalInfo = (field: string, value: string) => {
    setComplaintData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const updateComplaintDetails = (field: string, value: string) => {
    setComplaintData(prev => ({
      ...prev,
      complaintDetails: { ...prev.complaintDetails, [field]: value }
    }));
  };

  const updateCompanyInfo = (field: string, value: string) => {
    setComplaintData(prev => ({
      ...prev,
      companyInfo: { ...prev.companyInfo, [field]: value }
    }));
  };

  const analyzeComplaint = async () => {
    setIsAnalyzing(true);
    
    // Simular análise inteligente
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const suggestions = suggestChannels({
      category: complaintData.complaintDetails.category,
      subcategory: complaintData.complaintDetails.subcategory,
      priority: complaintData.complaintDetails.priority,
      companyName: complaintData.companyInfo.name
    });

    setComplaintData(prev => ({
      ...prev,
      suggestedChannels: suggestions
    }));
    
    setIsAnalyzing(false);
    setShowSuggestions(true);
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return complaintData.personalInfo.name && 
               complaintData.personalInfo.email && 
               complaintData.personalInfo.phone;
      case 2:
        return complaintData.complaintDetails.category && 
               complaintData.complaintDetails.subcategory && 
               complaintData.complaintDetails.title && 
               complaintData.complaintDetails.description;
      case 3:
        return complaintData.companyInfo.name;
      default:
        return true;
    }
  };

  const getSelectedCategory = () => {
    return categories.find(cat => cat.value === complaintData.complaintDetails.category);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#2A5C9A]">Formulário Inteligente de Reclamação</h1>
          <Badge variant="outline" className="text-sm">
            Passo {currentStep} de 4
          </Badge>
        </div>
        <Progress value={(currentStep / 4) * 100} className="h-2" />
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStep === 1 && <span className="text-[#FF6B35]">1. Informações Pessoais</span>}
            {currentStep === 2 && <span className="text-[#FF6B35]">2. Detalhes da Reclamação</span>}
            {currentStep === 3 && <span className="text-[#FF6B35]">3. Informações da Empresa</span>}
            {currentStep === 4 && <span className="text-[#FF6B35]">4. Canais Sugeridos</span>}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Preencha seus dados para identificarmos sua reclamação"}
            {currentStep === 2 && "Descreva detalhadamente o problema ocorrido"}
            {currentStep === 3 && "Informe os dados da empresa contra qual deseja reclamar"}
            {currentStep === 4 && "Baseado na sua reclamação, sugerimos os melhores canais para resolução"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={complaintData.personalInfo.name}
                  onChange={(e) => updatePersonalInfo('name', e.target.value)}
                  placeholder="João Silva"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={complaintData.personalInfo.email}
                  onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  placeholder="joao.silva@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={complaintData.personalInfo.phone}
                  onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="document">CPF/CNPJ</Label>
                <Input
                  id="document"
                  value={complaintData.personalInfo.document}
                  onChange={(e) => updatePersonalInfo('document', e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
          )}

          {/* Step 2: Complaint Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select 
                    value={complaintData.complaintDetails.category} 
                    onValueChange={(value) => updateComplaintDetails('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategoria *</Label>
                  <Select 
                    value={complaintData.complaintDetails.subcategory} 
                    onValueChange={(value) => updateComplaintDetails('subcategory', value)}
                    disabled={!complaintData.complaintDetails.category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma subcategoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSelectedCategory()?.subcategories.map((subcategory) => (
                        <SelectItem key={subcategory} value={subcategory}>
                          {subcategory}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Título da Reclamação *</Label>
                <Input
                  id="title"
                  value={complaintData.complaintDetails.title}
                  onChange={(e) => updateComplaintDetails('title', e.target.value)}
                  placeholder="Resumo do problema em poucas palavras"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição Detalhada *</Label>
                <Textarea
                  id="description"
                  value={complaintData.complaintDetails.description}
                  onChange={(e) => updateComplaintDetails('description', e.target.value)}
                  placeholder="Descreva detalhadamente o que aconteceu, quando, onde e como você foi afetado..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select 
                  value={complaintData.complaintDetails.priority} 
                  onValueChange={(value: any) => updateComplaintDetails('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3: Company Information */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa *</Label>
                <Input
                  id="companyName"
                  value={complaintData.companyInfo.name}
                  onChange={(e) => updateCompanyInfo('name', e.target.value)}
                  placeholder="Nome da empresa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyCnpj">CNPJ</Label>
                <Input
                  id="companyCnpj"
                  value={complaintData.companyInfo.cnpj}
                  onChange={(e) => updateCompanyInfo('cnpj', e.target.value)}
                  placeholder="00.000.000/0001-00"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyCategory">Categoria da Empresa</Label>
                <Input
                  id="companyCategory"
                  value={complaintData.companyInfo.category}
                  onChange={(e) => updateCompanyInfo('category', e.target.value)}
                  placeholder="Ex: Telecomunicações, Comércio, Serviços"
                />
              </div>
            </div>
          )}

          {/* Step 4: Channel Suggestions */}
          {currentStep === 4 && (
            <div className="space-y-4">
              {!showSuggestions ? (
                <div className="text-center py-8">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Vamos analisar sua reclamação para sugerir os melhores canais de resolução.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={analyzeComplaint} 
                    disabled={isAnalyzing}
                    className="mt-4 bg-[#FF6B35] hover:bg-[#FF6B35]/90"
                  >
                    {isAnalyzing ? 'Analisando...' : 'Analisar e Sugerir Canais'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Baseado na sua reclamação, sugerimos os seguintes canais para resolução:
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid gap-4">
                    {complaintData.suggestedChannels.map((channel, index) => (
                      <Card key={index} className="border-l-4 border-l-[#2A5C9A]">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{channel.name}</CardTitle>
                            <Badge variant="outline">{channel.effectiveness}% eficácia</Badge>
                          </div>
                          <CardDescription>{channel.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Tempo estimado: {channel.estimatedTime}</span>
                            <Button size="sm" variant="outline">
                              Selecionar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            
            <div className="flex gap-2">
              {currentStep < 4 ? (
                <Button
                  onClick={nextStep}
                  disabled={!isStepComplete(currentStep)}
                  className="bg-[#FF6B35] hover:bg-[#FF6B35]/90"
                >
                  Próximo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    // Aqui será implementada a lógica de envio da reclamação
                    console.log('Enviando reclamação:', complaintData);
                  }}
                  disabled={!showSuggestions}
                  className="bg-[#FF6B35] hover:bg-[#FF6B35]/90"
                >
                  Enviar Reclamação
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};