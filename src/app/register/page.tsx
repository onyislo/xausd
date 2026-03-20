'use client';

import AuthCard from '@/components/AuthCard';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  return (
    <AuthCard
      mode="register"
      fields={[
        { id: 'name',     label: 'Full Name',      type: 'text',     placeholder: 'John Doe' },
        { id: 'email',    label: 'Email Address',  type: 'email',    placeholder: 'trader@example.com' },
        { id: 'password', label: 'Password',       type: 'password', placeholder: '••••••••••••' },
        { id: 'confirm',  label: 'Confirm Password',type: 'password', placeholder: '••••••••••••' },
      ]}
      onSubmit={() => router.push('/login')}
    />
  );
}
