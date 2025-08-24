'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Users, Shield, Zap, Star, ArrowRight } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { AuthModalTrigger } from '@/components/AuthModalTrigger'

export default function Home() {
  const steps = [
    {
      title: "Cadastre-se",
      description: "Crie sua conta em poucos minutos com dados básicos",
      icon: Users
    },
    {
      title: "Registre sua reclamação",
      description: "Preencha nosso formulário inteligente com detalhes do problema",
      icon: Shield
    },
    {
      title: "Acompanhe em tempo real",
      description: "Receba atualizações e acompanhe a resolução do seu caso",
      icon: Zap
    }
  ]

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Consumidora",
      content: "Finalmente consegui resolver meu problema com a operadora de telefonia. A plataforma facilitou todo o processo!",
      rating: 5
    },
    {
      name: "João Santos",
      role: "Empresário",
      content: "Como consumidor e empresário, vejo o valor desta plataforma para melhorar o relacionamento com clientes.",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Estudante",
      content: "A biblioteca de direitos me ajudou a entender meus direitos como consumidora. Muito útil!",
      rating: 4
    }
  ]

  const features = [
    {
      title: "Formulário Inteligente",
      description: "Nosso sistema guia você passo a passo para garantir todas as informações necessárias"
    },
    {
      title: "Distribuição Automática",
      description: "Recomendamos os melhores canais para sua reclamação baseados em histórico de eficácia"
    },
    {
      title: "Acompanhamento Unificado",
      description: "Todas as respostas e atualizações em um único lugar, sem precisar acessar múltiplos sites"
    },
    {
      title: "Biblioteca de Direitos",
      description: "Acesso a conteúdo educativo sobre o Código de Defesa do Consumidor"
    }
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] to-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-[#2A5C9A] to-[#1e4473] text-white">
          <div className="container mx-auto px-4 py-24 lg:py-32">
            <div className="grid lg:grid-cols-1 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <Badge variant="secondary" className="bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90">
                    Nova Plataforma
                  </Badge>
                  <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                    Central do Consumidor
                  </h1>
                  <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed">
                    Sua voz faz a diferença. Registre reclamações, acompanhe em tempo real e conheça seus direitos como consumidor.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <AuthModalTrigger tab="signup">
                    <Button size="lg" className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-semibold px-8 py-3 text-lg btn-hover clickable">
                      Começar Agora
                      <ArrowRight className="ml-2 h-5 w-5 icon-hover" />
                    </Button>
                  </AuthModalTrigger>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#2A5C9A] font-semibold px-8 py-3 text-lg btn-hover clickable">
                    Saiba Mais
                  </Button>
                </div>
                <div className="flex items-center gap-8 pt-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">10k+</div>
                    <div className="text-blue-100">Consumidores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">95%</div>
                    <div className="text-blue-100">Satisfação</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">24h</div>
                    <div className="text-blue-100">Suporte</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#F5F5F5]/70 to-transparent"></div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#333333] mb-4">
                Como Funciona
              </h2>
              <p className="text-xl text-[#757575] max-w-3xl mx-auto">
                Três passos simples para transformar sua reclamação em solução
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <Card key={index} className="text-center border-2 hover:border-[#2A5C9A] transition-all duration-300 hover:shadow-lg zoom-only">
                  <CardHeader>
                    <div className="w-16 h-16 bg-[#2A5C9A] rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-sm font-semibold text-[#FF6B35] mb-2">
                      PASSO {index + 1}
                    </div>
                    <CardTitle className="text-xl text-[#333333]">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-[#757575]">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 bg-[#F5F5F5]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#333333] mb-4">
                Recursos Exclusivos
              </h2>
              <p className="text-xl text-[#757575] max-w-3xl mx-auto">
                Tudo o que você precisa para defender seus direitos como consumidor
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="border-l-4 border-l-[#2A5C9A] hover:shadow-lg transition-shadow zoom-only">
                  <CardHeader>
                    <CardTitle className="text-xl text-[#333333]">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-[#757575]">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#333333] mb-4">
                O Que Dizem Nossos Usuários
              </h2>
              <p className="text-xl text-[#757575] max-w-3xl mx-auto">
                Histórias reais de consumidores que transformaram suas reclamações em soluções
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow zoom-only">
                  <CardHeader>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <CardTitle className="text-lg text-[#333333]">{testimonial.name}</CardTitle>
                    <CardDescription className="text-sm text-[#757575]">{testimonial.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#757575] italic">
                      "{testimonial.content}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-[#2A5C9A] to-[#1e4473] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">
              Pronto para Defender Seus Direitos?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de consumidores que já estão transformando suas reclamações em soluções concretas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <AuthModalTrigger tab="signup">
                <Button size="lg" className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-semibold px-8 py-3 text-lg btn-hover clickable">
                  Criar Conta Gratuita
                  <ArrowRight className="ml-2 h-5 w-5 icon-hover" />
                </Button>
              </AuthModalTrigger>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#2A5C9A] font-semibold px-8 py-3 text-lg btn-hover clickable">
                Ver Demonstração
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}