'use client';

import { useState } from 'react';
import AuthCard from '@/components/AuthCard';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const isProd = process.env.NODE_ENV === 'production';

  const fields = isProd 
    ? [{ id: 'email', label: 'Email Address', type: 'email', placeholder: 'VIP Access Email' }]
    : [
        { id: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
        { id: 'email', label: 'Email Address', type: 'email', placeholder: 'you@domain.com' },
        { id: 'password', label: 'Password', type: 'password', placeholder: '••••••••' }
      ];

  const handleRegister = (data: Record<string, string>) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      if (isProd) {
        setSuccessMsg("System not launched yet. You have been added to the exclusive waitlist. We will communicate further instructions via email.");
      } else {
        setSuccessMsg("Registration successful! Welcome to AuScope.");
      }
    }, 800);
  };

  return (
    <AuthCard
      mode="register"
      fields={fields}
      loading={loading}
      successMessage={successMsg}
      onSubmit={handleRegister}
    />
  );
}
