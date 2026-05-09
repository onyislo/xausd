'use client';

import React, { useState } from 'react';
import AuthCard from '@/components/AuthCard';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: Record<string, string>) => {
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <AuthCard
      mode="login"
      fields={[
        { id: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter your registered email' }
      ]}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      successTitle={success ? "Check your email" : undefined}
      successMessage={success ? (
        <div className="space-y-4">
          <p>We've sent a secure password reset link to your email.</p>
          <p className="text-[10px] opacity-70 italic">Note: If you are on the waitlist, this will allow you to set your first password.</p>
        </div>
      ) : undefined}
    />
  );
}
