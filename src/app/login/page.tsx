'use client';

import AuthCard from '@/components/AuthCard';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { signIn, loading, error } = useAuth();

  return (
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
  );
}
