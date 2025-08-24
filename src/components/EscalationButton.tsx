'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Scale, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Upload,
  DollarSign,
  Info
} from 'lucide-react';
import { escalationServiceManager, getEscalationRequirements, calculateEscalationCost } from '@/lib/escalationService';

interface EscalationButtonProps {
  complaintId: string;
  userId: string;
  category: string;
  onEscalationCreated?: () => void;
}

interface CostEstimate {
  cost: number;
  time: string;
  requirements: string[];
}

export const EscalationButton: React.FC<EscalationButtonProps> = ({
  complaintId,
  userId,
  category,
  onEscalationCreated
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  const [reason, setReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [step, setStep] = useState(1);

  const getCostEstimate = async () => {
    setIsEstimating(true);
    
    try {
      // Simular chamada API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const estimate = {
        cost: calculateEscalationCost(category),
        time: '5-7 dias úteis',
        requirements: getEscalationRequirements(category)
      };
      
      setCostEstimate(estimate);
    } catch (error) {
      console.error('Erro ao obter estimativa:', error);
    } finally {
      setIsEstimating(false);
    }
  };

  const handleSubmitEscalation = async () => {
    if (!reason.trim()) {
      alert('Por favor, informe o motivo do escalonamento');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await escalationServiceManager.createEscalation({
        complaintId,
        userId,
        reason: reason.trim(),
        additionalInfo: additionalInfo.trim() || undefined
      });

      // Resetar formulário
      setReason('');
      setAdditionalInfo('');
      setStep(1);
      setIsOpen(false);
      
      if (onEscalationCreated) {
        onEscalationCreated();
      }
      
      alert('Serviço de escalonamento solicitado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar escalonamento:', error);
      alert(`Erro ao solicitar escalonamento: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDialog = () => {
    setIsOpen(true);
    setStep(1);
    getCostEstimate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="text-orange-600 border-orange-300 hover:bg-orange-50"
        >
          <Scale className="h-3 w-3 mr-1" />
          Minha reclamação não foi resolvida. E agora?
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-[#FF6B35]" />
            Serviço de Escalonamento para Juizado Especial Cível
          </DialogTitle>
          <DialogDescription>
            Quando as tentativas de resolução falham, podemos ajudar você a preparar a documentação necessária para ação no Juizado Especial Cível.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber ? 'bg-[#FF6B35] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-[#FF6B35]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Como funciona o serviço?</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Nós preparamos toda a documentação necessária para você entrar com uma ação no Juizado Especial Cível, 
                      incluindo a petição inicial e orientações sobre o processo.
                    </p>
                  </div>
                </div>
              </div>

              {isEstimating ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35]" />
                  <span className="ml-2">Calculando custo estimado...</span>
                </div>
              ) : costEstimate ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Custo Estimado
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        R$ {costEstimate.cost.toFixed(2)}
                      </div>
                      <p className="text-sm text-gray-600">
                        Tempo estimado: {costEstimate.time}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Documentos Necessários
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {costEstimate.requirements.map((req, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Este é um serviço pago. O valor será cobrado apenas após a confirmação e aprovação 
                      da documentação gerada.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : null}

              <div className="flex justify-end">
                <Button 
                  onClick={() => setStep(2)}
                  disabled={!costEstimate}
                  className="bg-[#FF6B35] hover:bg-[#FF6B35]/90"
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Reason */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Motivo do Escalonamento *</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Descreva por que você deseja escalar esta reclamação para o Juizado Especial Cível..."
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  Explique brevemente why as tentativas anteriores de resolução não foram bem-sucedidas.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Informações Adicionais</Label>
                <Textarea
                  id="additionalInfo"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Adicione qualquer informação relevante que possa ajudar no preparo da documentação..."
                  rows={3}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Anterior
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  disabled={!reason.trim()}
                  className="bg-[#FF6B35] hover:bg-[#FF6B35]/90"
                >
                  Revisar e Confirmar
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && costEstimate && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Resumo da Solicitação</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Serviço:</span>
                    <span className="text-sm font-medium">Preparação para Juizado Especial Cível</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Custo:</span>
                    <span className="text-sm font-medium text-green-600">R$ {costEstimate.cost.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Prazo estimado:</span>
                    <span className="text-sm font-medium">{costEstimate.time}</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Motivo:</span>
                      <span className="text-sm font-medium text-right max-w-xs">{reason}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Após a confirmação, nossa equipe entrará em contato para coletar os documentos necessários 
                  e iniciar a preparação da sua documentação jurídica.
                </AlertDescription>
              </Alert>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Anterior
                </Button>
                <Button 
                  onClick={handleSubmitEscalation}
                  disabled={isSubmitting}
                  className="bg-[#FF6B35] hover:bg-[#FF6B35]/90"
                >
                  {isSubmitting ? 'Processando...' : 'Confirmar Solicitação'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};