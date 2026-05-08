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

        router.push('/login?msg=Account Created! Check email for confirmation.');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      if (!data.user) {
        throw new Error('No user data returned');
      }

      // Mark user as online (don't fail the whole login if this fails)
      try {
        await supabase.from('profiles').update({ status: 'online' }).eq('id', data.user.id);
        if (data.user.email) {
          await supabase.from('profiles').update({ status: 'online' }).eq('email', data.user.email);
        }
      } catch (profileError) {
        console.warn('Profile update failed:', profileError);
      }

      // Force a router refresh to ensure auth state is updated
      router.refresh();
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    // Mark user as offline before signing out
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ status: 'offline' }).eq('id', user.id);
      if (user.email) {
        await supabase.from('profiles').update({ status: 'offline' }).eq('email', user.email);
      }
    }
    await supabase.auth.signOut();
    router.refresh();
  };

  return { signIn, signUp, signOut, loading, error };
}
