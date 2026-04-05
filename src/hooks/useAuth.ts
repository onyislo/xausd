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
    try {
      const { data, error: authError } = await supabase.auth.signUp({ 
        email, 
        password: pass,
        options: { data: metadata } 
      });
      
      if (authError) throw authError;

      if (data.user) {
        // Try creating the profile record
        const { error: profileError } = await supabase.from('profiles').insert([{ 
          id: data.user.id, 
          username: email.split('@')[0],
          full_name: metadata.full_name || ''
        }]);

        if (profileError) {
          console.warn("Profile creation log:", profileError);
          // Don't stop the whole process if only profile creation fails
        }
        
        router.push('/login?msg=Account Created! Check email.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication issue');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (authError) throw authError;
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return { signIn, signUp, signOut, loading, error };
}
