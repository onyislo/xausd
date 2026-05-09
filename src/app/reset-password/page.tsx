'use client';

import React, { useState, useEffect } from 'react';
import AuthCard from '@/components/AuthCard';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: Record<string, string>) => {
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({
      password: data.password
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
    setLoading(false);
  };

  return (
    <AuthCard
      mode="login"
      fields={[
        { id: 'password', label: 'New Password', type: 'password', placeholder: 'Enter new password' },
        { id: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Repeat new password' }
      ]}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      successTitle={success ? "Password Updated" : undefined}
      successMessage={success ? (
        <div className="space-y-4">
          <p>Your password has been successfully updated.</p>
          <p className="text-[10px] text-yellow-500 font-bold animate-pulse">Redirecting to login terminal...</p>
        </div>
      ) : undefined}
    />
  );
}
