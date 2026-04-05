import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const signUp = async (email: string, pass: string, metadata: any = {}) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password: pass,
      options: { data: metadata } 
    });
    
    if (error) setError(error.message);
    else if (data.user) {
      // Auto-create profile in our profile table
      await supabase.from('profiles').insert([{ 
        id: data.user.id, 
        username: email.split('@')[0],
        full_name: metadata.full_name || ''
      }]);
      router.push('/login?msg=Check email to confirm');
    }
    setLoading(false);
  };

  const signIn = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) setError(error.message);
    else router.push('/dashboard');
    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return { signIn, signUp, signOut, loading, error };
}
