'use client';

import React, { Suspense, useState } from 'react';
import AuthCard from '@/components/AuthCard';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'next/navigation';

function LoginContent() {
  const { signIn, loading, error } = useAuth();
  const searchParams = useSearchParams();
  const urlMsg = searchParams.get('msg');
  const [prodMsg, setProdMsg] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const isProd = process.env.NODE_ENV === 'production';

  const handleLogin = (form: Record<string, string>) => {
    if (isProd) {
      setLocalLoading(true);
      setTimeout(() => {
        setLocalLoading(false);
        setProdMsg("Terminal access is currently restricted. The system has not yet been rolled out to the public. Please join the waitlist to be notified of our launch.");
      }, 800);
    } else {
      signIn(form.email, form.password);
    }
  };

  return (
    <div className="relative">
      {urlMsg && !prodMsg && (
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
          {urlMsg}
        </div>
      )}
      <AuthCard
        mode="login"
        fields={[
          { id: 'email', label: 'Email Address', type: 'email', placeholder: 'trader@example.com' },
          { id: 'password', label: 'Password', type: 'password', placeholder: '••••••••••••' },
        ]}
        onSubmit={handleLogin}
        loading={isProd ? localLoading : loading}
        error={error}
        successMessage={prodMsg}
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
