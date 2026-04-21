'use client';

import { useState } from 'react';
import AuthCard from '@/components/AuthCard';
import { supabase } from '@/lib/supabase';

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
        // Insert the email into a Supabase table named 'waitlist'
        const { error } = await supabase.from('waitlist').insert([{ email: data.email }]);
        
        if (error) {
          console.error("Waitlist error:", error);
          // If the user already exists in waitlist (unique constraint), we can still show success
          if (error.code !== '23505') throw error; 
        }

        setSuccessMsg("System not launched yet. You have been added to the exclusive waitlist. We will communicate further instructions via email.");
      } else {
        // Local Dev simulation (you can replace this with your actual useAuth signUp if needed)
        setTimeout(() => {
          setSuccessMsg("Registration successful! Welcome to AuScope.");
        }, 500);
      }
    } catch (error) {
      console.error(error);
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
