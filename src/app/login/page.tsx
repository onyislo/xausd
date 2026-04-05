'use client';

import AuthCard from '@/components/AuthCard';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
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
          border: '1px solid rgba(245,196,81,0.4)',
          backdropFilter: 'blur(8px)',
          fontFamily: "'Chakra Petch', sans-serif",
          textTransform: 'uppercase', letterSpacing: '0.1em'
        }}>
          ✨ {successMsg}
        </div>
      )}
      
      <AuthCard
        mode="login"
        fields={[
          { id: 'email',    label: 'Email Address', type: 'email',    placeholder: 'trader@example.com' },
          { id: 'password', label: 'Password',       type: 'password', placeholder: '••••••••••••' },
        ]}
        loading={loading}
        error={error}
        onSubmit={(data) => signIn(data.email, data.password)}
      />
    </div>
  );
}
