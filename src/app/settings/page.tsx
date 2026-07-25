'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/ThemeContext';
import { User, Settings as SettingsIcon, Trash2, Cpu, Zap, Bell, Sun, Moon, BarChart3 } from 'lucide-react';

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newsInstant, setNewsInstant] = useState(true);
  const [aiInsights, setAiInsights] = useState(true);
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';

  // Theme tokens
  const bg       = dark ? '#0a0e17'               : '#f4f6fa';
  const bgCard   = dark ? 'rgba(15,20,35,0.6)'    : '#ffffff';
  const bgHeader = dark ? 'rgba(15,20,35,0.5)'    : 'rgba(255,255,255,0.8)';
  const border   = dark ? 'rgba(255,255,255,0.07)': 'rgba(0,0,0,0.09)';
  const txtPri   = dark ? '#e2e8f0'               : '#0a0e17';
  const txtSec   = dark ? '#94a3b8'               : '#4a5568';
  const txtMuted = dark ? '#475569'               : '#718096';
  const gold     = dark ? '#f5c451'               : '#b8860b';

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
          .then(({ data }) => {
            setProfile({
              ...data,
              email: user.email,
              full_name: data?.full_name || user.user_metadata?.full_name,
              avatar_url: data?.avatar_url || user.user_metadata?.avatar_url,
            });
            setLoading(false);
          });
      }
    });
  }, []);

  const card = (children: React.ReactNode, style?: React.CSSProperties) => (
    <div style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: '12px', ...style }}>
      {children}
    </div>
  );

  const sectionLabel = (icon: React.ReactNode, label: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px', borderBottom: `1px solid ${border}`, marginBottom: '16px' }}>
      {icon}
      <span style={{ fontSize: '11px', fontWeight: 700, color: txtMuted, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: "'Chakra Petch',sans-serif" }}>{label}</span>
    </div>
  );

  const Toggle = ({ on, onToggle, color = '#3b82f6' }: { on: boolean; onToggle: () => void; color?: string }) => (
    <button onClick={onToggle} style={{ width: '48px', height: '24px', borderRadius: '100px', background: on ? color : (dark ? '#334155' : '#cbd5e1'), border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
      <div style={{ position: 'absolute', top: '4px', left: on ? '28px' : '4px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
    </button>
  );

  return (
    <main style={{ display: 'flex', height: '100vh', background: bg, color: txtPri, fontFamily: "'Inter',sans-serif" }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden' }}>

        {/* Header */}
        <header style={{ height: '64px', borderBottom: `1px solid ${border}`, background: bgHeader, backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', background: `${gold}18`, borderRadius: '8px', border: `1px solid ${gold}30`, display: 'flex' }}>
              <SettingsIcon size={18} color={gold} />
            </div>
            <div>
              <h1 style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '0.15em', color: txtPri, textTransform: 'uppercase', fontFamily: "'Chakra Petch',sans-serif", margin: 0 }}>System Configuration</h1>
              <p style={{ fontSize: '10px', color: txtMuted, letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>Terminal Preferences & Security</p>
            </div>
          </div>
          <div style={{ padding: '4px 12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '4px', fontSize: '10px', color: '#22c55e', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Sync Status: Online
          </div>
        </header>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {!profile && loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ width: '32px', height: '32px', border: `2px solid ${gold}30`, borderTop: `2px solid ${gold}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : profile ? (
            <div style={{ maxWidth: '860px', margin: '0 auto', paddingBottom: '80px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

              {/* Profile */}
              <section>
                {sectionLabel(<User size={14} color={gold} />, 'User Profile & Account')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {card(
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: dark ? '#1e293b' : '#e2e8f0', border: `2px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: gold, overflow: 'hidden', flexShrink: 0 }}>
                        {profile.avatar_url ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : (profile.full_name?.[0] || 'U')}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: txtPri }}>{profile.full_name || profile.username}</div>
                        <div style={{ fontSize: '12px', color: txtSec, marginTop: '2px' }}>{profile.email}</div>
                      </div>
                    </div>
                  )}
                  {card(
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444' }}>Account Termination</div>
                          <div style={{ fontSize: '11px', color: txtMuted, marginTop: '4px' }}>Permanently delete your profile and all history.</div>
                        </div>
                        <Trash2 size={16} color="#ef444460" />
                      </div>
                      <button style={{ alignSelf: 'flex-start', padding: '6px 14px', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', background: 'transparent', color: '#ef4444', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                        Terminate Account
                      </button>
                    </div>,
                    { background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)' }
                  )}
                </div>
              </section>

              {/* Theme */}
              <section>
                {sectionLabel(theme === 'dark' ? <Moon size={14} color={gold} /> : <Sun size={14} color={gold} />, 'Display Theme')}
                {card(
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ padding: '8px', background: `${gold}15`, borderRadius: '8px', display: 'flex' }}>
                        {theme === 'dark' ? <Moon size={18} color={gold} /> : <Sun size={18} color={gold} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: txtPri }}>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</div>
                        <div style={{ fontSize: '12px', color: txtSec, marginTop: '2px' }}>Switch between dark and light terminal display.</div>
                      </div>
                    </div>
                    <Toggle on={theme === 'light'} onToggle={toggle} color={gold} />
                  </div>
                )}
              </section>

              {/* AI */}
              <section>
                {sectionLabel(<Cpu size={14} color="#60a5fa" />, 'AI Analytics & Insights')}
                {card(
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: `1px solid ${border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ padding: '8px', background: 'rgba(96,165,250,0.1)', borderRadius: '8px', display: 'flex' }}>
                          <Zap size={18} color="#60a5fa" />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: txtPri }}>Instant AI Insights</div>
                          <div style={{ fontSize: '12px', color: txtSec, marginTop: '2px' }}>Real-time XAU/USD analysis notifications via GPT-Pro.</div>
                        </div>
                      </div>
                      <Toggle on={aiInsights} onToggle={() => setAiInsights(!aiInsights)} color="#3b82f6" />
                    </div>
                    <div style={{ padding: '20px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: txtMuted, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '12px' }}>Model Selection</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        {[['Standard', 'Low Latency'], ['Advanced', 'Deep Analysis'], ['Pro', 'Tier-1 Data']].map(([level, sub]) => (
                          <div key={level} style={{ padding: '12px', border: `1px solid ${level === 'Pro' ? gold + '60' : border}`, borderRadius: '8px', textAlign: 'center', cursor: 'pointer', background: level === 'Pro' ? `${gold}08` : 'transparent' }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: level === 'Pro' ? gold : txtSec }}>{level}</div>
                            <div style={{ fontSize: '10px', marginTop: '4px', color: txtMuted }}>{sub}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </section>

              {/* News */}
              <section>
                {sectionLabel(<Bell size={14} color="#f59e0b" />, 'Intelligence Stream')}
                {card(
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: txtPri }}>Real-time News Synchronization</div>
                      <div style={{ fontSize: '12px', color: txtSec, marginTop: '4px' }}>Updates feed every 500ms for zero-latency intelligence.</div>
                    </div>
                    <Toggle on={newsInstant} onToggle={() => setNewsInstant(!newsInstant)} color="#22c55e" />
                  </div>
                )}
              </section>

              {/* Chart */}
              <section>
                {sectionLabel(<BarChart3 size={14} color="#4ade80" />, 'Visual Engine & Charting')}
                {card(
                  <div style={{ padding: '20px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: txtMuted, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '12px' }}>Default Timeframe</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['1M', '5M', '15M', '1H', '4H', '1D'].map(tf => (
                        <button key={tf} style={{ flex: 1, padding: '6px 0', border: `1px solid ${tf === '15M' ? gold : border}`, borderRadius: '4px', background: tf === '15M' ? `${gold}15` : 'transparent', color: tf === '15M' ? gold : txtSec, fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}>
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>

            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
