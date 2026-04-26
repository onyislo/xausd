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

  const handleRegister = async (data: Record<string, string>) => {
    setLoading(true);
    try {
      if (isProd) {
        const res = await fetch('/api/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email }),
        });
        if (!res.ok) throw new Error('Failed');
        
        const result = await res.json();
        if (result.alreadyRegistered) {
          setSuccessMsg("You're already on our waitlist! We'll notify you as soon as access opens up.");
        } else {
          setSuccessMsg("You're on the list! Check your email — we've sent you a confirmation from AuScope.");
        }
      } else {
        setTimeout(() => setSuccessMsg("Registration successful! Welcome to AuScope."), 500);
      }
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
      onSubmit={handleRegister}
    />
  );
}
