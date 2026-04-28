'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  User as UserIcon, 
  Camera, 
  Mail, 
  Lock, 
  LogOut, 
  ShieldCheck, 
  Clock,
  ChevronRight
} from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState<string>('Just now');

  // Track real online/offline status
  useEffect(() => {
    // Set initial state from browser
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const handleOnline = () => {
      setIsOnline(true);
      setLastSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        // Force update status to online in DB when viewing profile
        supabase.from('profiles').update({ status: 'online' }).eq('id', user.id).then();
        if (user.email) {
          supabase.from('profiles').update({ status: 'online' }).eq('email', user.email).then();
        }

        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
          .then(({ data }) => {
            if (data) setIsOnline(true); // If we got data, we are definitely online
            setProfile({ 
              ...data, 
              email: user.email,
              full_name: data?.full_name || user.user_metadata?.full_name,
              avatar_url: data?.avatar_url || user.user_metadata?.avatar_url
            });
            setLastSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            setLoading(false);
          });
      }
    });
  }, []);

  const handleLogout = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ status: 'offline' }).eq('id', user.id);
    }
    await supabase.auth.signOut();
  };

  const uploadAvatar = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const filePath = `${user.id}-${Math.random()}.${file.name.split('.').pop()}`;
    await supabase.storage.from('avatars').upload(filePath, file);
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

    await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
    await supabase.from('profiles').upsert({ id: user.id, avatar_url: publicUrl, username: profile?.username || user.email?.split('@')[0] });
    setProfile({ ...profile, avatar_url: publicUrl });
  };

  return (
    <main className="terminal-layout bg-[#0a0e17] text-slate-200 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        <header className="h-[64px] border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <UserIcon size={20} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-[14px] font-black tracking-[0.15em] text-slate-100 uppercase" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                Identity Terminal
              </h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mt-0.5">User Profile & Security</p>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-gradient-to-b from-slate-900/20 to-transparent">
          {!profile && loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : profile ? (
            <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
              
              <section className="bg-slate-900/60 border border-slate-800/50 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
              
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center text-4xl font-black text-yellow-500 shadow-2xl overflow-hidden">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                      profile.full_name?.[0] || profile.username?.[0] || 'U'
                    )}
                  </div>
                  <input type="file" id="avatar-input" className="hidden" accept="image/*" onChange={uploadAvatar} />
                  <button 
                    onClick={() => document.getElementById('avatar-input')?.click()}
                    className="absolute bottom-1 right-1 p-2 bg-blue-600 rounded-full border-2 border-slate-900 text-white hover:bg-blue-500 transition-colors shadow-lg">
                    <Camera size={14} />
                  </button>
                </div>
                
                <div className="flex-1 text-center md:text-left space-y-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <h2 className="text-xl font-black text-slate-100 tracking-tight">{profile.full_name || profile.username}</h2>
                    <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded text-[9px] text-yellow-500 font-bold tracking-widest uppercase self-center md:self-auto">Institutional Tier</span>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Global Markets Intelligence Operator</p>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4 pt-4 border-t border-slate-800/50">
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase ${
                      isOnline ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                      }`} />
                      {isOnline ? 'Online' : 'Offline'}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold tracking-wider uppercase">
                      <Clock size={12} /> Last Sync: {isOnline ? lastSync : 'Disconnected'}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <section className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-5 space-y-4">
                <h3 className="text-[11px] font-bold text-slate-500 tracking-widest uppercase">General Access</h3>
                
                <div className="space-y-3">
                  <div className="group cursor-pointer">
                    <label className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block mb-1.5 ml-1">Profile Name</label>
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg px-4 py-2.5 flex items-center justify-between group-hover:border-slate-600 transition-colors">
                      <span className="text-sm text-slate-300">{profile.full_name || profile.username}</span>
                      <ChevronRight size={14} className="text-slate-600" />
                    </div>
                  </div>
                  
                  <div className="group cursor-pointer">
                    <label className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block mb-1.5 ml-1">Primary Email</label>
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg px-4 py-2.5 flex items-center justify-between group-hover:border-slate-600 transition-colors">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-blue-400" />
                        <span className="text-sm text-slate-300">{profile.email}</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-600" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-5 space-y-4">
                <h3 className="text-[11px] font-bold text-slate-500 tracking-widest uppercase">Security Protocols</h3>
                
                <div className="space-y-3">
                  <div className="group cursor-pointer">
                    <label className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block mb-1.5 ml-1">Access Password</label>
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg px-4 py-2.5 flex items-center justify-between group-hover:border-slate-600 transition-colors">
                      <div className="flex items-center gap-2">
                        <Lock size={14} className="text-yellow-500/80" />
                        <span className="text-sm text-slate-300">••••••••••••</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-600" />
                    </div>
                  </div>
                  
                  <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg px-4 py-2.5 flex items-center gap-3">
                    <ShieldCheck size={16} className="text-blue-400" />
                    <div>
                      <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Multi-Factor Enabled</div>
                      <div className="text-[9px] text-slate-500 font-medium">Protected by hardware key & Biometrics</div>
                    </div>
                  </div>
                </div>
              </section>

            </div>

            <section className="pt-4">
              <Link href="/login" 
                onClick={handleLogout}
                className="flex items-center justify-center gap-3 w-full p-4 bg-red-500/5 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-bold text-sm tracking-widest uppercase group">
                <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                Terminate Session (Logout)
              </Link>
            </section>
          </div>
        ) : null}
        </div>
      </div>
    </main>
  );
}
