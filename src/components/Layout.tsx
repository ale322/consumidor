'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NotificationButton } from '@/components/NotificationButton';
import { AuthModalTrigger } from '@/components/AuthModalTrigger';
import { 
  Home, 
  FileText, 
  BookOpen, 
  User, 
  Menu, 
  X,
  Shield,
  BarChart3,
  Settings,
  Star
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export const Layout: React.FC<LayoutProps> = ({ children, user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Início', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, requireAuth: true },
    { name: 'Nova Reclamação', href: '/nova-reclamacao', icon: FileText, requireAuth: true },
    { name: 'Empresas', href: '/empresas', icon: Star },
    { name: 'Direitos', href: '/direitos', icon: BookOpen },
    { name: 'Perfil', href: '/perfil', icon: User, requireAuth: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 link-hover clickable">
                <Shield className="h-8 w-8 text-[#2A5C9A] icon-hover" />
                <span className="text-xl font-bold text-[#2A5C9A]">
                  Central do Consumidor
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => {
                if (item.requireAuth && !user) return null;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-1 text-gray-700 hover:text-[#2A5C9A] transition-colors link-hover clickable"
                  >
                    <item.icon className="h-4 w-4 icon-hover" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <NotificationButton userId={user.id} />
                  <div className="hidden md:flex items-center space-x-2">
                    <div className="text-sm text-gray-700">
                      Olá, {user.name.split(' ')[0]}
                    </div>
                    <Button variant="outline" size="sm" asChild className="btn-hover clickable">
                      <Link href="/logout" className="link-hover">Sair</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <AuthModalTrigger tab="login">
                    <Button variant="ghost" className="btn-hover clickable">
                      Entrar
                    </Button>
                  </AuthModalTrigger>
                  <AuthModalTrigger tab="signup">
                    <Button className="btn-hover clickable">
                      Cadastrar
                    </Button>
                  </AuthModalTrigger>
                </div>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden btn-hover clickable"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5 icon-hover" /> : <Menu className="h-5 w-5 icon-hover" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="container mx-auto px-4 py-4">
              <nav className="space-y-2">
                {navigation.map((item) => {
                  if (item.requireAuth && !user) return null;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-2 text-gray-700 hover:text-[#2A5C9A] transition-colors py-2 link-hover clickable"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="h-4 w-4 icon-hover" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                {user ? (
                  <div className="pt-4 border-t">
                    <div className="text-sm text-gray-700 mb-2">
                      Olá, {user.name}
                    </div>
                    <Button variant="outline" size="sm" asChild className="w-full btn-hover clickable">
                      <Link href="/logout" onClick={() => setIsMenuOpen(false)} className="link-hover">
                        Sair
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="pt-4 border-t space-y-2">
                    <AuthModalTrigger tab="login">
                      <Button variant="ghost" className="w-full btn-hover clickable">
                        Entrar
                      </Button>
                    </AuthModalTrigger>
                    <AuthModalTrigger tab="signup">
                      <Button className="w-full btn-hover clickable">
                        Cadastrar
                      </Button>
                    </AuthModalTrigger>
                  </div>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#2A5C9A] text-white mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4 link-hover clickable">
                <Shield className="h-6 w-6 icon-hover" />
                <span className="text-lg font-bold">Central do Consumidor</span>
              </div>
              <p className="text-blue-100 text-sm">
                Sua voz faz a diferença. Defenda seus direitos com nossa plataforma inteligente de reclamações.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Plataforma</h3>
              <ul className="space-y-2 text-sm text-blue-100">
                <li><Link href="/" className="hover:text-white transition-colors link-hover clickable">Início</Link></li>
                <li><Link href="/como-funciona" className="hover:text-white transition-colors link-hover clickable">Como Funciona</Link></li>
                <li><Link href="/direitos" className="hover:text-white transition-colors link-hover clickable">Direitos do Consumidor</Link></li>
                <li><Link href="/contato" className="hover:text-white transition-colors link-hover clickable">Contato</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-blue-100">
                <li><Link href="/termos" className="hover:text-white transition-colors link-hover clickable">Termos de Uso</Link></li>
                <li><Link href="/privacidade" className="hover:text-white transition-colors link-hover clickable">Política de Privacidade</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors link-hover clickable">Política de Cookies</Link></li>
                <li><Link href="/lgpd" className="hover:text-white transition-colors link-hover clickable">LGPD</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contato</h3>
              <ul className="space-y-2 text-sm text-blue-100">
                <li>Email: contato@centraldoconsumidor.com.br</li>
                <li>Telefone: (11) 9999-0000</li>
                <li>Horário: Seg-Sex 9h-18h</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-blue-800 mt-8 pt-8 text-center text-sm text-blue-100">
            <p>&copy; 2024 Central do Consumidor. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};