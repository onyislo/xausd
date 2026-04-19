'use client';

import React, { Suspense } from 'react';
import AuthCard from '@/components/AuthCard';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'next/navigation';

function LoginContent() {
  const { signIn, loading, error } = useAuth();
  const searchParams = useSearchParams();
  const successMsg = searchParams.get('msg');

  return (
    <div className="relative">
      {successMsg && (
        <div style={{
          position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 100, padding: '12px 24px', borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(245,196,81,0.9), rgba(184,134,11,0.9))',
          color: '#1a1200', fontSize: '12px', fontWeight: 700,
          boxShadow: '0 10px 30px rgba(245,196,81,0.2)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '1rem', textAlign: 'center', pointerEvents: 'none'
        }}>
          {successMsg}
        </div>
      )}
      <AuthCard
        mode="login"
        fields={[
          { id: 'email', label: 'Email Address', type: 'email', placeholder: 'trader@example.com' },
          { id: 'password', label: 'Password', type: 'password', placeholder: '••••••••••••' },
        ]}
        onSubmit={(form) => signIn(form.email, form.password)}
        loading={loading}
        error={error}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
