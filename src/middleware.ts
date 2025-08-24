import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Páginas públicas que não requerem autenticação
    const publicPages = [
      '/',
      '/login',
      '/signup',
      '/empresas',
      '/direitos',
      '/termos',
      '/privacidade',
      '/cookies',
      '/lgpd',
      '/contato',
      '/como-funciona'
    ];

    // Se a página é pública, permitir acesso
    if (publicPages.includes(pathname)) {
      return NextResponse.next();
    }

    // Se o usuário está tentando acessar páginas protegidas sem estar autenticado
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Redirecionar usuário autenticado que tenta acessar login/signup
    if (token && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Permitir acesso a páginas públicas mesmo sem token
        return true; // O middleware vai lidar com a lógica de redirecionamento
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};