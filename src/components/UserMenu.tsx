'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'rgba(245,196,81,0.08)', border: '1px solid rgba(245,196,81,0.2)',
        borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: '#e0e6ed',
      }}>
        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg,#f5c451,#b8860b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#0a0e17' }}>T</div>
        <span style={{ fontSize: '12px', fontWeight: 500 }}>Trader</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke="#8a9bb2" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          background: '#131a26', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px', minWidth: '180px', zIndex: 200,
          boxShadow: '0 16px 40px rgba(0,0,0,0.5)', overflow: 'hidden',
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#e0e6ed' }}>Trader</div>
            <div style={{ fontSize: '11px', color: '#4a5568', marginTop: '2px' }}>trader@auscope.com</div>
          </div>

          {[
            { icon: '👤', label: 'Profile',           href: '#' },
            { icon: '⚙️', label: 'Account Settings',  href: '#' },
          ].map(item => (
            <Link key={item.label} href={item.href} onClick={() => setOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 16px', fontSize: '13px', color: '#8a9bb2',
              textDecoration: 'none', transition: 'background 0.15s, color 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#e0e6ed'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8a9bb2'; }}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <Link href="/login" style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 16px', fontSize: '13px', color: '#ef4444',
              textDecoration: 'none', transition: 'background 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <span>🚪</span>Log out
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
