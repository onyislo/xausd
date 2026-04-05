'use client';

import AuthCard from '@/components/AuthCard';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const { signUp, loading, error } = useAuth();

  const handleRegister = (data: Record<string, string>) => {
    if (data.password !== data.confirm) {
      alert("Passwords do not match!");
      return;
    }
    signUp(data.email, data.password, { full_name: data.name });
  };

  return (
    <AuthCard
      mode="register"
      fields={[
        { id: 'name',     label: 'Full Name',      type: 'text',     placeholder: 'John Doe' },
        { id: 'email',    label: 'Email Address',  type: 'email',    placeholder: 'trader@example.com' },
        { id: 'password', label: 'Password',       type: 'password', placeholder: '••••••••••••' },
        { id: 'confirm',  label: 'Confirm Password',type: 'password', placeholder: '••••••••••••' },
      ]}
      loading={loading}
      error={error}
      onSubmit={handleRegister}
    />
  );
}
