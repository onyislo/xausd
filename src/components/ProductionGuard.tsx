'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Build-time constant — Next.js inlines this
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// ─── Pages that are FULLY READY for production ───
const PRODUCTION_READY: string[] = [
  '/',
  '/comms',
  '/profile',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

// ─── Pages that should show "Coming Soon" overlay ───
const COMING_SOON: string[] = [
  '/dashboard',
  '/news',
  '/live',
  '/settings',
  '/intel',
  '/chart',
];

function matchesAny(pathname: string, paths: string[]): boolean {
  return paths.some(
    (p) => pathname === p || (p !== '/' && pathname.startsWith(`${p}/`))
  );
}

export default function ProductionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);

    // ─── 1. Inactivity Logout Logic (12 Days) ───
    const checkInactivity = async () => {
      const lastSeen = localStorage.getItem('last_activity');
      const now = Date.now();
      const twelveDays = 12 * 24 * 60 * 60 * 1000;

      if (lastSeen && now - parseInt(lastSeen) > twelveDays) {
        const { supabase } = await import('@/lib/supabase');
        await supabase.auth.signOut();
        localStorage.removeItem('last_activity');
        router.push('/login?msg=Session expired due to 12 days of inactivity.');
      } else {
        localStorage.setItem('last_activity', now.toString());
      }
    };
    checkInactivity();

    // ─── 2. Service Worker Registration ───
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('SW registered:', registration.scope);
          },
          (err) => {
            console.log('SW registration failed:', err);
          }
        );
      });
    }
  }, [router]);

  // ── Development mode → always render everything normally ──
  if (!IS_PRODUCTION) {
    return <>{children}</>;
  }

  // ── SSR / first paint → render children to avoid hydration mismatch ──
  if (!hydrated) {
    return <>{children}</>;
  }

  // ── Production-ready pages → render normally ──
  if (matchesAny(pathname, PRODUCTION_READY)) {
    return <>{children}</>;
  }

  // ── Coming Soon pages → blurred background + overlay card ──
  if (matchesAny(pathname, COMING_SOON)) {
    return (
      <div
        style={{
          position: 'relative',
          minHeight: '100vh',
          width: '100%',
          background: '#0a0e17',
          overflow: 'hidden',
        }}
      >
        {/* ── Blurred page content visible behind the overlay ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            userSelect: 'none',
            filter: 'blur(8px)',
            opacity: 0.35,
            overflow: 'hidden',
          }}
        >
          {children}
        </div>

        {/* ── Dark scrim for contrast ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(10,14,23,0.50)',
            pointerEvents: 'none',
          }}
        />

        {/* ── Coming Soon Card ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
        >
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              background:
                'linear-gradient(135deg, rgba(15,20,35,0.92), rgba(20,25,40,0.95))',
              padding: '3rem 3.5rem',
              borderRadius: '1.25rem',
              border: '1px solid rgba(245, 196, 81, 0.25)',
              backdropFilter: 'blur(24px)',
              boxShadow:
                '0 25px 60px rgba(0,0,0,0.6), 0 0 80px rgba(245,196,81,0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center',
              textAlign: 'center' as const,
              maxWidth: '480px',
              width: '90%',
            }}
          >
            {/* Top accent line */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '10%',
                right: '10%',
                height: '2px',
                background:
                  'linear-gradient(90deg, transparent, rgba(245,196,81,0.6), transparent)',
                borderRadius: '2px',
              }}
            />

            {/* Clock icon */}
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background:
                  'linear-gradient(135deg, rgba(245,196,81,0.08), rgba(245,196,81,0.15))',
                border: '2px solid rgba(245,196,81,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.75rem',
                boxShadow: '0 0 30px rgba(245,196,81,0.1)',
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f5c451"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 900,
                color: '#f5c451',
                letterSpacing: '0.15em',
                textTransform: 'uppercase' as const,
                marginBottom: '0.75rem',
                textShadow: '0 2px 20px rgba(245,196,81,0.3)',
                fontFamily: "'Chakra Petch', sans-serif",
                lineHeight: 1.2,
              }}
            >
              Coming Soon
            </h1>

            {/* Subtitle */}
            <p
              style={{
                color: 'rgba(148,163,184,0.9)',
                fontSize: '0.8rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase' as const,
                fontWeight: 600,
                marginBottom: '0.5rem',
                fontFamily: 'monospace',
              }}
            >
              Feature Still in Development
            </p>

            {/* Description */}
            <p
              style={{
                color: 'rgba(100,116,139,0.8)',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                maxWidth: '320px',
                lineHeight: '1.6',
                marginBottom: '2rem',
              }}
            >
              This module is currently in development. <br />
              <span style={{ color: '#f5c451', fontWeight: 700 }}>ACCESSIBLE NOW:</span> <br />
              • <a href="/comms" style={{ textDecoration: 'underline' }}>Comms Hub</a> (Secure Messaging) <br />
              • <a href="/profile" style={{ textDecoration: 'underline' }}>Profile Hub</a> (Identity Management)
            </p>

            {/* Animated progress dots */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="coming-soon-dot"
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#f5c451',
                    opacity: 0.5,
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              ))}
            </div>

            {/* Back button */}
            <button
              onClick={() => router.push('/comms')}
              style={{
                padding: '0.65rem 2rem',
                background:
                  'linear-gradient(135deg, rgba(245,196,81,0.1), rgba(245,196,81,0.05))',
                color: '#f5c451',
                border: '1px solid rgba(245,196,81,0.35)',
                borderRadius: '0.5rem',
                fontSize: '0.65rem',
                fontWeight: 800,
                letterSpacing: '0.2em',
                textTransform: 'uppercase' as const,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, rgba(245,196,81,0.2), rgba(245,196,81,0.1))';
                e.currentTarget.style.borderColor = 'rgba(245,196,81,0.6)';
                e.currentTarget.style.boxShadow =
                  '0 0 20px rgba(245,196,81,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, rgba(245,196,81,0.1), rgba(245,196,81,0.05))';
                e.currentTarget.style.borderColor = 'rgba(245,196,81,0.35)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Return to Terminal
            </button>

            {/* Bottom accent */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: '20%',
                right: '20%',
                height: '1px',
                background:
                  'linear-gradient(90deg, transparent, rgba(245,196,81,0.3), transparent)',
              }}
            />
          </div>
        </div>

        {/* CSS animation for pulsing dots */}
        <style>{`
          @keyframes comingSoonPulse {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          .coming-soon-dot {
            animation: comingSoonPulse 1.5s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  // ── Unknown / unregistered page → locked screen ──
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        background: '#0a0e17',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          userSelect: 'none',
          filter: 'blur(10px)',
          opacity: 0.25,
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(10,14,23,0.60)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
        }}
      >
        <div
          style={{
            background: 'rgba(15,20,32,0.80)',
            padding: '3rem',
            borderRadius: '1rem',
            border: '1px solid rgba(245,196,81,0.3)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              background: 'rgba(245,196,81,0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(245,196,81,0.4)',
              marginBottom: '1.5rem',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f5c451"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              color: '#f5c451',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            Module Locked
          </h1>
          <p
            style={{
              color: 'rgb(148,163,184)',
              fontFamily: 'monospace',
              letterSpacing: '0.15em',
              fontSize: '0.8rem',
              maxWidth: '28rem',
            }}
          >
            THIS SECTOR IS CURRENTLY IN DEVELOPMENT. NEW INTEL COMING SOON...
          </p>
          <button
            onClick={() => router.push('/comms')}
            style={{
              marginTop: '2rem',
              padding: '0.625rem 1.5rem',
              background: 'rgba(245,196,81,0.1)',
              color: '#f5c451',
              border: '1px solid rgba(245,196,81,0.4)',
              borderRadius: '0.5rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            Return to Terminal
          </button>
        </div>
      </div>
    </div>
  );
}
