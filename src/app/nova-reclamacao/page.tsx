'use client';

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { SmartComplaintForm } from '@/components/SmartComplaintForm';

export default function NovaReclamacaoPage() {
  const [user, setUser] = useState({
    id: 'user-123',
    name: 'João Silva',
    email: 'joao.silva@email.com'
  });

  return (
    <Layout user={user}>
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] to-white py-8">
        <div className="container mx-auto px-4">
          <SmartComplaintForm />
        </div>
      </div>
    </Layout>
  );
}