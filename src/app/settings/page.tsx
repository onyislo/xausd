'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { 
  User, 
  Settings as SettingsIcon, 
  Trash2, 
  Cpu, 
  Zap, 
  Bell, 
  Shield, 
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Volume2,
  Activity
} from 'lucide-react';

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newsInstant, setNewsInstant] = useState(true);
  const [aiSignals, setAiSignals] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
          .then(({ data }) => {
            setProfile({ 
              ...data, 
              email: user.email,
              full_name: data?.full_name || user.user_metadata?.full_name,
              avatar_url: data?.avatar_url || user.user_metadata?.avatar_url
            });
            setLoading(false);
          });
      }
    });
  }, []);

  return (
    <main className="terminal-layout bg-[#0a0e17] text-slate-200 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        <header className="h-[64px] border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <SettingsIcon size={20} className="text-yellow-500" />
            </div>
            <div>
              <h1 className="text-[14px] font-black tracking-[0.15em] text-slate-100 uppercase" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                System Configuration
              </h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mt-0.5">Terminal Preferences & Security</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded text-[10px] text-green-500 font-bold tracking-widest uppercase">
               Sync Status: Online
             </div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-gradient-to-b from-slate-900/20 to-transparent">
          {!profile && loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
            </div>
          ) : profile ? (
            <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
              
              <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800/40">
                  <User size={16} className="text-yellow-500/80" />
                  <h2 className="text-[12px] font-bold text-slate-400 tracking-[.2em] uppercase">User Profile & Account</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/60 border border-slate-800/50 p-5 rounded-xl hover:border-slate-700/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-xl font-bold text-yellow-500 overflow-hidden">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          profile.full_name?.[0] || profile.username?.[0] || 'U'
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-200">{profile.full_name || profile.username}</h3>
                        <p className="text-xs text-slate-500">{profile.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-xl flex flex-col justify-between hover:bg-red-500/10 transition-all group">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-red-500/90">Account Termination</h3>
                        <p className="text-[11px] text-slate-500 mt-1">Permanently delete your profile and all trading history.</p>
                      </div>
                      <Trash2 size={18} className="text-red-500/40 group-hover:text-red-500 transition-colors" />
                    </div>
                    <button className="mt-4 px-4 py-2 border border-red-500/30 text-red-500/80 text-[10px] font-bold tracking-widest uppercase rounded hover:bg-red-500 hover:text-white hover:border-red-500 transition-all self-start">
                      Terminate Account
                    </button>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800/40">
                  <Cpu size={16} className="text-blue-400/80" />
                  <h2 className="text-[12px] font-bold text-slate-400 tracking-[.2em] uppercase">AI Analytics & Signals</h2>
                </div>
                
                <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl overflow-hidden">
                  <div className="p-5 flex items-center justify-between border-b border-slate-800/50">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <Zap size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-200">Instant AI Signals</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Get real-time XAU/USD buy/sell notifications powered by GPT-Pro.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAiSignals(!aiSignals)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${aiSignals ? 'bg-blue-600' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${aiSignals ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  
                  <div className="p-5">
                     <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-3">Model Selection</div>
                     <div className="grid grid-cols-3 gap-3">
                        {['Standard', 'Advanced', 'Institutional'].map(level => (
                          <div key={level} className={`p-3 border rounded-lg text-center cursor-pointer transition-all ${level === 'Institutional' ? 'border-yellow-500/40 bg-yellow-500/5 text-yellow-500' : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'}`}>
                            <div className="text-[11px] font-bold uppercase tracking-wider">{level}</div>
                            <div className="text-[9px] mt-1 opacity-60">
                              {level === 'Standard' ? 'Low Latency' : level === 'Advanced' ? 'Deep Analysis' : 'Tier-1 Data'}
                            </div>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800/40">
                  <Bell size={16} className="text-amber-500/80" />
                  <h2 className="text-[12px] font-bold text-slate-400 tracking-[.2em] uppercase">Intelligence Stream</h2>
                </div>
                
                <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-bold text-slate-200">Real-time News Synchronization</h3>
                      <p className="text-xs text-slate-500 mt-1">Updates feed every 500ms for zero-latency intelligence.</p>
                    </div>
                    <button 
                      onClick={() => setNewsInstant(!newsInstant)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${newsInstant ? 'bg-green-600' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${newsInstant ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800/40">
                  <BarChart3 size={16} className="text-green-400/80" />
                  <h2 className="text-[12px] font-bold text-slate-400 tracking-[.2em] uppercase">Visual Engine & Charting</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/40 border border-slate-800/50 p-5 rounded-xl">
                    <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-4">Default Timeframe</div>
                    <div className="flex gap-2">
                      {['1M', '5M', '15M', '1H', '4H', '1D'].map(tf => (
                        <button key={tf} className={`flex-1 py-1.5 border rounded text-[10px] font-bold transition-all ${tf === '15M' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-slate-800 hover:border-slate-700 text-slate-500'}`}>
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
