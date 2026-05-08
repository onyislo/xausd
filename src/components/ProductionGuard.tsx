'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function ProductionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isProd, setIsProd] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsProd(typeof window !== 'undefined' && process.env.NODE_ENV === 'production');
  }, []);

  // Always render children during SSR to avoid hydration issues
  if (!mounted || typeof window === 'undefined') {
    return <>{children}</>;
  }

  // Show normal pages in development
  if (!isProd) {
    return <>{children}</>;
  }

  // ─── PRODUCTION-READY pages (fully functional) ───
<<<<<<< HEAD
  const productionReadyPaths = [
    '/',
    '/comms',
    '/profile',
    '/login',
    '/register',
  ];

  // ─── COMING SOON pages (show overlay with blurred background) ───
  const comingSoonPaths = [
    '/dashboard',
    '/news',
    '/live',
    '/settings',
    '/intel',
    '/chart',
  ];
=======
  const productionReadyPaths = ['/', '/comms', '/profile', '/login', '/register'];

  // ─── COMING SOON pages (show overlay with blurred background) ───
  const comingSoonPaths = ['/dashboard', '/news', '/live', '/settings', '/intel', '/chart'];
>>>>>>> 5ac5f59 (fix:added the pructin girad)

  const isProductionReady = productionReadyPaths.some(path =>
    pathname === path || (pathname?.startsWith(`${path}/`) && path !== '/')
  );

  const isComingSoon = comingSoonPaths.some(path =>
    pathname === path || pathname?.startsWith(`${path}/`)
  );

<<<<<<< HEAD
  // Production-ready pages render normally
=======
>>>>>>> 5ac5f59 (fix:added the pructin girad)
  if (isProductionReady) {
    return <>{children}</>;
  }

<<<<<<< HEAD
  // Coming soon pages — show the page content blurred behind a "Coming Soon" card
  if (isComingSoon) {
    return (
      <div className="relative min-h-screen w-full bg-[#0a0e17] overflow-hidden">
        {/* Blurred background — the actual page content is visible but blurred */}
        <div className="absolute inset-0 pointer-events-none select-none" style={{ filter: 'blur(8px)', opacity: 0.35 }}>
          {children}
        </div>

        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-[#0a0e17]/50 pointer-events-none" />

        {/* Coming Soon Card */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
          <div
            className="relative overflow-hidden"
=======
  // Coming soon pages — blurred background + card
  if (isComingSoon) {
    return (
      <div className="relative min-h-screen w-full bg-[#0a0e17] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none" style={{ filter: 'blur(8px)', opacity: 0.35 }}>
          {children}
        </div>
        <div className="absolute inset-0 bg-[#0a0e17]/50 pointer-events-none" />

        <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
          <div
>>>>>>> 5ac5f59 (fix:added the pructin girad)
            style={{
              background: 'linear-gradient(135deg, rgba(15,20,35,0.92), rgba(20,25,40,0.95))',
              padding: '3rem 3.5rem',
              borderRadius: '1.25rem',
              border: '1px solid rgba(245, 196, 81, 0.25)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 80px rgba(245,196,81,0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center',
              textAlign: 'center' as const,
              maxWidth: '480px',
              width: '90%',
<<<<<<< HEAD
            }}
          >
            {/* Decorative top accent line */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '10%',
              right: '10%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, rgba(245,196,81,0.6), transparent)',
              borderRadius: '2px',
            }} />

            {/* Animated icon */}
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(245,196,81,0.08), rgba(245,196,81,0.15))',
              border: '2px solid rgba(245,196,81,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.75rem',
              boxShadow: '0 0 30px rgba(245,196,81,0.1)',
            }}>
=======
              position: 'relative' as const,
              overflow: 'hidden',
            }}
          >
            {/* Top accent */}
            <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(245,196,81,0.6), transparent)', borderRadius: '2px' }} />

            {/* Clock icon */}
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(245,196,81,0.08), rgba(245,196,81,0.15))', border: '2px solid rgba(245,196,81,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.75rem', boxShadow: '0 0 30px rgba(245,196,81,0.1)' }}>
>>>>>>> 5ac5f59 (fix:added the pructin girad)
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f5c451" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>

<<<<<<< HEAD
            {/* Title */}
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              color: '#f5c451',
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
              marginBottom: '0.75rem',
              textShadow: '0 2px 20px rgba(245,196,81,0.3)',
              fontFamily: "'Chakra Petch', sans-serif",
              lineHeight: 1.2,
            }}>
              Coming Soon
            </h1>

            {/* Subtitle */}
            <p style={{
              color: 'rgba(148,163,184,0.9)',
              fontSize: '0.8rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase' as const,
              fontWeight: 600,
              marginBottom: '0.5rem',
              fontFamily: 'monospace',
            }}>
              Feature Still in Development
            </p>

            {/* Description */}
            <p style={{
              color: 'rgba(100,116,139,0.8)',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              maxWidth: '320px',
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}>
              This module is being built to institutional-grade standards. We&apos;re refining every detail for maximum performance.
            </p>

            {/* Animated progress dots */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '2rem',
            }}>
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#f5c451',
                    opacity: 0.5,
                    animation: `comingSoonPulse 1.5s ease-in-out ${i * 0.3}s infinite`,
                  }}
                />
              ))}
            </div>

            {/* Back button */}
            <button
              onClick={() => router.push('/')}
=======
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f5c451', letterSpacing: '0.15em', textTransform: 'uppercase' as const, marginBottom: '0.75rem', textShadow: '0 2px 20px rgba(245,196,81,0.3)', fontFamily: "'Chakra Petch', sans-serif", lineHeight: 1.2 }}>
              Coming Soon
            </h1>

            <p style={{ color: 'rgba(148,163,184,0.9)', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase' as const, fontWeight: 600, marginBottom: '0.5rem', fontFamily: 'monospace' }}>
              Feature Still in Development
            </p>

            <p style={{ color: 'rgba(100,116,139,0.8)', fontSize: '0.75rem', letterSpacing: '0.1em', maxWidth: '320px', lineHeight: 1.6, marginBottom: '2rem' }}>
              This module is being built to institutional-grade standards. We&apos;re refining every detail for maximum performance.
            </p>

            {/* Animated dots */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f5c451', opacity: 0.5, animation: `comingSoonPulse 1.5s ease-in-out ${i * 0.3}s infinite` }} />
              ))}
            </div>

            {/* Back button — goes BACK in history, not to landing page */}
            <button
              onClick={() => window.history.back()}
>>>>>>> 5ac5f59 (fix:added the pructin girad)
              style={{
                padding: '0.65rem 2rem',
                background: 'linear-gradient(135deg, rgba(245,196,81,0.1), rgba(245,196,81,0.05))',
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
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(245,196,81,0.2), rgba(245,196,81,0.1))';
                e.currentTarget.style.borderColor = 'rgba(245,196,81,0.6)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(245,196,81,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(245,196,81,0.1), rgba(245,196,81,0.05))';
                e.currentTarget.style.borderColor = 'rgba(245,196,81,0.35)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
<<<<<<< HEAD
              Return to Terminal
            </button>

            {/* Decorative bottom accent */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: '20%',
              right: '20%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(245,196,81,0.3), transparent)',
            }} />
          </div>
        </div>

        {/* CSS animation for the pulsing dots */}
=======
              Go Back
            </button>

            <div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(245,196,81,0.3), transparent)' }} />
          </div>
        </div>

>>>>>>> 5ac5f59 (fix:added the pructin girad)
        <style jsx>{`
          @keyframes comingSoonPulse {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `}</style>
      </div>
    );
  }

<<<<<<< HEAD
  // Unknown/unregistered pages — show locked message
=======
  // Unknown pages — locked
>>>>>>> 5ac5f59 (fix:added the pructin girad)
  return (
    <div className="relative min-h-screen w-full bg-[#0a0e17] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none select-none" style={{ filter: 'blur(10px)', opacity: 0.25 }}>
        {children}
      </div>
      <div className="absolute inset-0 bg-[#0a0e17]/60 pointer-events-none" />
<<<<<<< HEAD

=======
>>>>>>> 5ac5f59 (fix:added the pructin girad)
      <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
        <div className="bg-[#0f1420]/80 p-12 rounded-2xl border border-yellow-500/30 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/40 mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f5c451" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-yellow-500 tracking-[0.2em] uppercase mb-4 drop-shadow-lg">
            Module Locked
          </h1>
          <p className="text-slate-400 font-mono tracking-widest text-sm max-w-md">
            THIS SECTOR IS CURRENTLY IN DEVELOPMENT. NEW INTEL COMING SOON...
          </p>
<<<<<<< HEAD

          <button
            onClick={() => router.push('/')}
            className="mt-8 px-6 py-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/40 rounded-lg text-xs font-bold tracking-widest uppercase transition-all"
          >
            Return to Terminal
=======
          <button
            onClick={() => window.history.back()}
            className="mt-8 px-6 py-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/40 rounded-lg text-xs font-bold tracking-widest uppercase transition-all"
          >
            Go Back
>>>>>>> 5ac5f59 (fix:added the pructin girad)
          </button>
        </div>
      </div>
    </div>
  );
}
