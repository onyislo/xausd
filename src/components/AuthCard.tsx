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
  loading?: boolean;
  error?: string | null;
  successMessage?: React.ReactNode;
}

export default function AuthCard({ mode, fields, onSubmit, loading, error, successMessage }: AuthCardProps) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [show, setShow] = useState<Record<string, boolean>>({});

  const isLogin = mode === 'login';
  const isProd = process.env.NODE_ENV === 'production';

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
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
      padding: '16px',
    }}>
      {/* Animated background grid */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(245,196,81,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(245,196,81,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '380px' }}>

        {/* Logo - Clickable to Home */}
        <Link href="/" style={{ textDecoration: 'none', display: 'block', textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #f5c451, #b8860b)',
            boxShadow: '0 0 20px rgba(245,196,81,0.3)',
            marginBottom: '12px',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="14" width="20" height="5" rx="1" fill="#1a1200" opacity="0.9"/>
              <rect x="4" y="9" width="16" height="5" rx="1" fill="#1a1200" opacity="0.9"/>
              <rect x="6" y="4" width="12" height="5" rx="1" fill="#1a1200" opacity="0.9"/>
            </svg>
          </div>
          <h1 style={{
            fontFamily: "'Chakra Petch', sans-serif",
            fontSize: '12px', fontWeight: 700, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: '#f5c451', marginBottom: '2px',
          }}>AuScope</h1>
          <p style={{ fontSize: '10px', color: '#4a5568', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            XAU/USD Terminal
          </p>
        </Link>

        {/* Card */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(19,26,38,0.98) 0%, rgba(10,14,23,0.98) 100%)',
          border: '1px solid #2a3441',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,196,81,0.05)',
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
            fontSize: '15px', fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: '#e0e6ed',
            marginBottom: '4px',
          }}>
            {isLogin ? 'Sign In' : 'Register'}
          </h2>
          <p style={{ fontSize: '11px', color: '#4a5568', marginBottom: '10px' }}>
            {isLogin ? 'Access your dashboard' : (successMessage ? 'Registration Status' : (isProd ? 'Request Early Access' : 'Create your account'))}
          </p>

          {successMessage ? (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(245,196,81,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                border: '1px solid rgba(245,196,81,0.3)',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f5c451" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3 style={{ color: '#f5c451', fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', textTransform: 'uppercase' }}>
                Access Requested
              </h3>
              <div style={{ color: '#8a9bb2', fontSize: '12px', lineHeight: '1.5' }}>
                {successMessage}
              </div>
              <Link href="/" style={{
                 display: 'block', marginTop: '30px', color: '#f5c451', textDecoration: 'none',
                 fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', border: '1px solid #f5c451',
                 padding: '10px', borderRadius: '6px', textAlign: 'center', textTransform: 'uppercase'
              }}>
                Return to Home
              </Link>
            </div>
          ) : (
            <React.Fragment>
              {error && (
                <div style={{ fontSize: '10px', color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '4px', marginBottom: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  ⚠️ {error}
                </div>
              )}

          <form onSubmit={handle}>
            {fields.map(field => {
              const isPass = field.type === 'password';
              return (
                <div key={field.id} style={{ marginBottom: '12px' }}>
                  <label style={{
                    display: 'block', fontSize: '10px', fontWeight: 600,
                    color: '#8a9bb2', textTransform: 'uppercase', letterSpacing: '0.08em',
                    marginBottom: '6px',
                  }}>{field.label}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id={field.id}
                      type={isPass && show[field.id] ? 'text' : field.type}
                      placeholder={field.placeholder}
                      required
                      onChange={e => setForm(f => ({ ...f, [field.id]: e.target.value }))}
                      style={{
                        width: '100%', padding: '9px 12px',
                        paddingRight: isPass ? '40px' : '12px',
                        background: 'rgba(10,14,23,0.8)',
                        border: '1px solid #2a3441',
                        borderRadius: '6px',
                        color: '#e0e6ed', fontSize: '13px',
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
                          position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#4a5568', fontSize: '14px', padding: '2px',
                        }}>
                        {show[field.id] ? '🙈' : '👁'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {isLogin && (
              <div style={{ textAlign: 'right', marginBottom: '16px', marginTop: '-6px' }}>
                <Link href="#" style={{ fontSize: '10px', color: '#f5c451', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '11px',
              background: loading
                ? 'rgba(245,196,81,0.2)'
                : 'linear-gradient(135deg, #f5c451, #d4a017)',
              border: 'none', borderRadius: '6px',
              color: '#0a0e17', fontSize: '12px', fontWeight: 800,
              fontFamily: "'Chakra Petch', sans-serif",
              letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 0 15px rgba(245,196,81,0.25)',
              transition: 'all 0.2s',
              marginBottom: '16px',
            }}>
              {loading ? (isLogin ? 'Authenticating...' : 'Processing...') : (isLogin ? 'Access Terminal' : (isProd ? 'Join Waitlist' : 'Create Account'))}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ flex: 1, height: '1px', background: '#1e2a3a' }} />
              <span style={{ fontSize: '10px', color: '#2a3441', textTransform: 'uppercase' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: '#1e2a3a' }} />
            </div>

            {/* Social Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {[
                { label: 'Google', icon: 'G', color: '#4285F4' },
                { label: 'Apple', icon: '', color: '#ffffff' },
              ].map(s => (
                <button key={s.label} type="button" style={{
                  flex: 1, padding: '8px',
                  background: 'rgba(10,14,23,0.8)',
                  border: '1px solid #2a3441',
                  borderRadius: '6px', color: '#8a9bb2',
                  fontSize: '11px', fontWeight: 600,
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'all 0.2s',
                  fontFamily: "'Inter', sans-serif",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.color = '#e0e6ed'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a3441'; e.currentTarget.style.color = '#8a9bb2'; }}>
                  <span style={{ color: s.color, fontWeight: 800 }}>{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>

            <p style={{ textAlign: 'center', fontSize: '11px', color: '#4a5568' }}>
              {isLogin ? "New to Terminal? " : 'Known user? '}
              <Link href={isLogin ? '/register' : '/login'}
                style={{ color: '#f5c451', textDecoration: 'none', fontWeight: 600 }}>
                {isLogin ? 'Create Account' : 'Sign In'}
              </Link>
            </p>
          </form>
            </React.Fragment>
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '9px', color: '#2a3441', letterSpacing: '0.08em' }}>
          © 2025 AUSCOPE · SSL SECURE
        </p>
      </div>
    </div>
  );
}
