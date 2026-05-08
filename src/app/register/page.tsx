'use client';

import { useState } from 'react';
import AuthCard from '@/components/AuthCard';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [successTitle, setSuccessTitle] = useState('');

  const fields = [
    { id: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
    { id: 'email', label: 'Email Address', type: 'email', placeholder: 'you@domain.com' },
    { id: 'password', label: 'Password', type: 'password', placeholder: '••••••••' }
  ];

  const handleRegister = async (data: Record<string, string>) => {
    setLoading(true);
    try {
      setSuccessTitle("Welcome");
      setTimeout(() => setSuccessMsg("Registration successful! Welcome to AuScope."), 500);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      mode="register"
      fields={fields}
      loading={loading}
      successMessage={successMsg}
      successTitle={successTitle}
      onSubmit={handleRegister}
    />
  );
}
