'use client';

import AuthCard from '@/components/AuthCard';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  return (
    <AuthCard
      mode="login"
      fields={[
        { id: 'email',    label: 'Email Address', type: 'email',    placeholder: 'trader@example.com' },
        { id: 'password', label: 'Password',       type: 'password', placeholder: '••••••••••••' },
      ]}
      onSubmit={() => router.push('/dashboard')}
    />
  );
}
