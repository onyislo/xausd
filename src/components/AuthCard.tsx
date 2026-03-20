'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Field {
  id: string;
  label: string;
  type: string;
  placeholder: string;
}

interface AuthCardProps {
  mode: 'login' | 'register';
  fields: Field[];
  onSubmit: (data: Record<string, string>) => void;
}

export default function AuthCard({ mode, fields, onSubmit }: AuthCardProps) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [show, setShow] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login';

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    onSubmit(form);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 50%, rgba(245,196,81,0.04) 0%, transparent 60%), #0a0e17',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      padding: '24px',
    }}>
      {/* Animated background grid */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(245,196,81,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(245,196,81,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #f5c451, #b8860b)',
            boxShadow: '0 0 24px rgba(245,196,81,0.35)',
            marginBottom: '16px',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="14" width="20" height="5" rx="1" fill="#1a1200" opacity="0.9"/>
              <rect x="4" y="9" width="16" height="5" rx="1" fill="#1a1200" opacity="0.9"/>
              <rect x="6" y="4" width="12" height="5" rx="1" fill="#1a1200" opacity="0.9"/>
            </svg>
          </div>
          <h1 style={{
            fontFamily: "'Chakra Petch', sans-serif",
            fontSize: '13px', fontWeight: 700, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: '#f5c451', marginBottom: '4px',
          }}>AuScope</h1>
          <p style={{ fontSize: '11px', color: '#4a5568', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            XAU/USD Terminal
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(19,26,38,0.98) 0%, rgba(10,14,23,0.98) 100%)',
          border: '1px solid #2a3441',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(245,196,81,0.06)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Gold top accent */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, transparent, #f5c451, transparent)',
          }} />

          <h2 style={{
            fontFamily: "'Chakra Petch', sans-serif",
            fontSize: '16px', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: '#e0e6ed',
            marginBottom: '6px',
          }}>
            {isLogin ? 'Sign In to Terminal' : 'Create Account'}
          </h2>
          <p style={{ fontSize: '12px', color: '#4a5568', marginBottom: '28px' }}>
            {isLogin ? 'Access your trading intelligence dashboard' : 'Join the XAU/USD trading platform'}
          </p>

          <form onSubmit={handle}>
            {fields.map(field => {
              const isPass = field.type === 'password';
              return (
                <div key={field.id} style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block', fontSize: '11px', fontWeight: 600,
                    color: '#8a9bb2', textTransform: 'uppercase', letterSpacing: '0.1em',
                    marginBottom: '8px',
                  }}>{field.label}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id={field.id}
                      type={isPass && show[field.id] ? 'text' : field.type}
                      placeholder={field.placeholder}
                      required
                      onChange={e => setForm(f => ({ ...f, [field.id]: e.target.value }))}
                      style={{
                        width: '100%', padding: '11px 14px',
                        paddingRight: isPass ? '44px' : '14px',
                        background: 'rgba(10,14,23,0.8)',
                        border: '1px solid #2a3441',
                        borderRadius: '8px',
                        color: '#e0e6ed', fontSize: '14px',
                        outline: 'none', boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                        fontFamily: "'Inter', sans-serif",
                      }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(245,196,81,0.5)'; }}
                      onBlur={e => { e.target.style.borderColor = '#2a3441'; }}
                    />
                    {isPass && (
                      <button type="button"
                        onClick={() => setShow(s => ({ ...s, [field.id]: !s[field.id] }))}
                        style={{
                          position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#4a5568', fontSize: '16px', padding: '4px',
                        }}>
                        {show[field.id] ? '🙈' : '👁'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {isLogin && (
              <div style={{ textAlign: 'right', marginBottom: '20px', marginTop: '-8px' }}>
                <Link href="#" style={{ fontSize: '11px', color: '#f5c451', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              background: loading
                ? 'rgba(245,196,81,0.3)'
                : 'linear-gradient(135deg, #f5c451, #d4a017)',
              border: 'none', borderRadius: '8px',
              color: '#0a0e17', fontSize: '13px', fontWeight: 800,
              fontFamily: "'Chakra Petch', sans-serif",
              letterSpacing: '0.12em', textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 0 20px rgba(245,196,81,0.3)',
              transition: 'all 0.2s',
              marginBottom: '20px',
            }}>
              {loading ? '⟳ Authenticating...' : (isLogin ? 'Access Terminal' : 'Create Account')}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', background: '#1e2a3a' }} />
              <span style={{ fontSize: '11px', color: '#2a3441', textTransform: 'uppercase', letterSpacing: '0.1em' }}>or continue with</span>
              <div style={{ flex: 1, height: '1px', background: '#1e2a3a' }} />
            </div>

            {/* Social Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              {[
                { label: 'Google', icon: 'G', color: '#4285F4' },
                { label: 'Microsoft', icon: 'M', color: '#00A4EF' },
              ].map(s => (
                <button key={s.label} type="button" style={{
                  flex: 1, padding: '10px',
                  background: 'rgba(10,14,23,0.8)',
                  border: '1px solid #2a3441',
                  borderRadius: '8px', color: '#8a9bb2',
                  fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'border-color 0.2s',
                  fontFamily: "'Inter', sans-serif",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = s.color; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#2a3441'; }}>
                  <span style={{ color: s.color, fontWeight: 800 }}>{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>

            <p style={{ textAlign: 'center', fontSize: '12px', color: '#4a5568' }}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Link href={isLogin ? '/register' : '/login'}
                style={{ color: '#f5c451', textDecoration: 'none', fontWeight: 600 }}>
                {isLogin ? 'Sign up' : 'Sign in'}
              </Link>
            </p>
          </form>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '10px', color: '#2a3441', letterSpacing: '0.08em' }}>
          © 2025 AUSCOPE · SECURE CONNECTION · SSL ENCRYPTED
        </p>
      </div>
    </div>
  );
}
