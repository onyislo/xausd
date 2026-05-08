'use client';

import { useState } from 'react';
import AuthCard from '@/components/AuthCard';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const { signUp, loading, error } = useAuth();
  const [successMsg, setSuccessMsg] = useState('');
  const [successTitle, setSuccessTitle] = useState('');

  const fields = [
    { id: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
    { id: 'email', label: 'Email Address', type: 'email', placeholder: 'you@domain.com' },
    { id: 'password', label: 'Password', type: 'password', placeholder: '••••••••' }
  ];

  const handleRegister = async (data: Record<string, string>) => {
    await signUp(data.email, data.password, { full_name: data.name });
    setSuccessTitle("Welcome");
    setSuccessMsg("Registration successful! Welcome to AuScope.");
  };

  return (
    <AuthCard
      mode="register"
      fields={fields}
      loading={loading}
      error={error}
      successMessage={successMsg}
      successTitle={successTitle}
      onSubmit={handleRegister}
    />
  );
}
