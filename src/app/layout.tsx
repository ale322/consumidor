import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/components/AuthProvider";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { AuthModal } from "@/components/AuthModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Central do Consumidor - Defenda seus Direitos",
  description: "Plataforma inteligente para registro e acompanhamento de reclamações de consumidores. Sistema unificado com notificações em tempo real.",
  keywords: ["consumidor", "reclamação", "direitos do consumidor", "procon", "anatel", "bacen"],
  authors: [{ name: "Central do Consumidor" }],
  openGraph: {
    title: "Central do Consumidor",
    description: "Plataforma inteligente para registro e acompanhamento de reclamações de consumidores",
    url: "https://centraldoconsumidor.com.br",
    siteName: "Central do Consumidor",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Central do Consumidor",
    description: "Plataforma inteligente para registro e acompanhamento de reclamações de consumidores",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ErrorBoundary>
          <AuthProvider>
            <AuthModalProvider>
              {children}
              <AuthModal />
              <Toaster />
            </AuthModalProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
