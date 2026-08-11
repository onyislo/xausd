'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import LiveTicker from '@/components/LiveTicker';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/ThemeContext';

export default function HomePage() {
  const [nav, setNav] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';

  // Theme-aware colours
  const bg        = dark ? '#0a0e17'              : '#f4f6fa';
  const bgCard    = dark ? '#141c2e'              : '#ffffff';
  const bgNav     = dark ? 'rgba(10,14,23,0.85)'  : 'rgba(244,246,250,0.92)';
  const border    = dark ? 'rgba(255,255,255,0.06)': 'rgba(0,0,0,0.08)';
  const txtPri    = dark ? '#e0e6ed'              : '#0a0e17';
  const txtSec    = dark ? '#8a9bb2'              : '#4a5568';
  const txtMuted  = dark ? '#6b7a8d'              : '#718096';
  const gold      = dark ? '#f5c451'              : '#b8860b';

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      !!(window.navigator as any).standalone;

    if (!isStandalone) return; // Browser mode — show homepage as-is

    setIsPWA(true);

    (async () => {
      await new Promise(r => setTimeout(r, 1500));
      const { data: { session } } = await supabase.auth.getSession();
      const lastPath = localStorage.getItem('last_path');
      router.replace(!session ? '/login' : (lastPath && lastPath !== '/' ? lastPath : '/comms'));
    })();
  }, [router]);

  return (
    <div style={{ background: bg, color: txtPri, fontFamily: "'Inter',sans-serif", minHeight: '100vh' }}>

      {/* ── PWA SPLASH OVERLAY (only after hydration when in standalone mode) ── */}
      {isPWA && (
        <div style={{ position: 'fixed', inset: 0, background: '#0a0e17', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', animation: 'fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{ width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="38" height="38" viewBox="0 0 32 32" fill="none">
                <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" stroke="#f5c451" strokeWidth="2" fill="none" strokeLinejoin="round"/>
                <polyline points="8,22 12,17 16,19 22,11" stroke="#f5c451" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="22" cy="11" r="2.2" fill="#f5c451"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Chakra Petch',sans-serif", fontWeight: 800, fontSize: '32px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f5c451' }}>Globard</span>
          </div>
          <div style={{ position: 'absolute', bottom: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', animation: 'fade-in 1s ease-out 0.5s both' }}>
            <div style={{ width: '24px', height: '24px', border: '2px solid rgba(245,196,81,0.15)', borderTop: '2px solid #f5c451', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontSize: '10px', color: '#8a9bb2', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: "'Chakra Petch',sans-serif" }}>Intelligence Terminal</span>
          </div>
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          `}</style>
        </div>
      )}
      <style dangerouslySetInnerHTML={{
        __html: `
        .mobile-nav-btn { display: none !important; }
        .desktop-nav { display: flex !important; }
        .nav-logo-icon { display: flex; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-btn { display: block !important; }
          .nav-logo-icon { display: none !important; }
          .hero-buttons { flex-direction: column; gap: 20px !important; align-items: center !important; }
        }
      `}} />

      {/* ── MOBILE DRAWER ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px',
        background: dark ? 'rgba(10,14,23,0.98)' : 'rgba(244,246,250,0.98)', backdropFilter: 'blur(20px)', zIndex: 200,
        borderRight: `1px solid ${border}`,
        transform: nav ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column', padding: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" stroke="#f5c451" strokeWidth="2" fill="none" strokeLinejoin="round"/>
              <polyline points="8,22 12,17 16,19 22,11" stroke="#f5c451" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="22" cy="11" r="2.2" fill="#f5c451"/>
            </svg>
            <span style={{ fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f5c451' }}>Globard</span>
          </div>
          <button onClick={() => setNav(false)} style={{ background: 'none', border: 'none', color: txtSec, cursor: 'pointer', padding: '4px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {[['#home', 'Home'], ['#about', 'About Us'], ['#pricing', 'Subscription']].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setNav(false)} style={{ fontSize: '16px', color: txtPri, textDecoration: 'none', letterSpacing: '0.04em' }}>{label}</a>
          ))}
          <div style={{ height: '1px', background: border, margin: '8px 0' }} />
          <Link href="/login" onClick={() => setNav(false)} style={{ fontSize: '16px', color: txtSec, textDecoration: 'none' }}>Log in</Link>
          <Link href="/register" onClick={() => setNav(false)} style={{ fontSize: '16px', fontWeight: 600, color: gold, textDecoration: 'none' }}>Get started →</Link>
          <button onClick={() => { toggle(); setNav(false); }} style={{ background: 'none', border: `1px solid ${border}`, borderRadius: '8px', color: txtSec, cursor: 'pointer', padding: '10px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}>
            {dark
              ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> Light Mode</>
              : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> Dark Mode</>
            }
          </button>
        </div>
      </div>
      {nav && (
        <div
          onClick={() => setNav(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 150 }}
        />
      )}

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: `1px solid ${border}`,
        background: bgNav, backdropFilter: 'blur(16px)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Left Menu / Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="mobile-nav-btn" onClick={() => setNav(true)} style={{ background: 'none', border: 'none', color: gold, cursor: 'pointer', padding: '4px', marginLeft: '-4px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg className="nav-logo-icon" width="24" height="24" viewBox="0 0 32 32" fill="none">
                <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" stroke="#f5c451" strokeWidth="2" fill="none" strokeLinejoin="round"/>
                <polyline points="8,22 12,17 16,19 22,11" stroke="#f5c451" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="22" cy="11" r="2.2" fill="#f5c451"/>
              </svg>
              <span style={{ fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f5c451' }}>Globard</span>
            </div>
          </div>

          {/* Desktop links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="desktop-nav">
            {[['#home', 'Home'], ['#about', 'About Us'], ['#pricing', 'Subscription']].map(([href, label]) => (
              <a key={href} href={href} style={{ fontSize: '13px', color: txtSec, textDecoration: 'none', letterSpacing: '0.04em', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = txtPri)}
                onMouseLeave={e => (e.currentTarget.style.color = txtSec)}>{label}</a>
            ))}
          </div>

          {/* Auth links + theme toggle */}
          <div className="desktop-nav" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <button onClick={toggle} title="Toggle theme" style={{ background: 'none', border: 'none', cursor: 'pointer', color: txtSec, padding: '4px', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = gold)}
              onMouseLeave={e => (e.currentTarget.style.color = txtSec)}>
              {dark
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </button>
            <Link href="/login" style={{ fontSize: '13px', fontWeight: 400, color: txtSec, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = txtPri)}
              onMouseLeave={e => (e.currentTarget.style.color = txtSec)}>Log in</Link>
            <Link href="/register" style={{ fontSize: '13px', fontWeight: 600, color: gold, textDecoration: 'none', borderBottom: `1px solid ${gold}40`, paddingBottom: '1px', transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = gold)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = `${gold}40`)}>Get started →</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="home" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle bg line */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${gold}18 1px,transparent 1px),linear-gradient(90deg,${gold}18 1px,transparent 1px)`, backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.18em', color: gold, textTransform: 'uppercase', fontFamily: "'Chakra Petch',sans-serif", marginBottom: '28px', opacity: 0.8 }}>
            XAU/USD &nbsp;·&nbsp; Live Intelligence Terminal
          </p>

          <h1 style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 'clamp(32px,6vw,64px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '24px' }}>
            <span style={{ color: txtPri }}>Trade Gold With</span><br />
            <span style={{ color: gold }}>Total Edge</span>
          </h1>

          <p style={{ fontSize: '16px', color: txtSec, lineHeight: 1.8, maxWidth: '520px', margin: '0 auto 40px', fontWeight: 400 }}>
            Real-time XAU/USD insights driven by macro, central bank policy, technical analysis, and market sentiment. All in one terminal.
          </p>

          <div className="hero-buttons" style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'baseline', marginBottom: '8px' }}>
            <Link href="/login" style={{ fontSize: '16px', fontWeight: 600, color: gold, textDecoration: 'none', borderBottom: `1px solid ${gold}`, paddingBottom: '2px', letterSpacing: '-0.01em', transition: 'opacity 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              Open the terminal →
            </Link>
            <a href="#about" style={{ fontSize: '14px', fontWeight: 400, color: txtMuted, textDecoration: 'none', letterSpacing: '0em', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = txtSec)}
              onMouseLeave={e => (e.currentTarget.style.color = txtMuted)}>How it works ↓</a>
          </div>

          <LiveTicker />
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding: '100px 24px', background: dark ? 'rgba(14,19,32,0.98)' : '#edf0f7', borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.22em', color: gold, textTransform: 'uppercase', fontFamily: "'Chakra Petch',sans-serif", marginBottom: '14px' }}>About the Platform</div>
            <h2 style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 'clamp(26px,5vw,48px)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: txtPri, margin: 0 }}>
              Why Traders Choose Us
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '20px' }}>

            <div style={{ padding: '36px 32px', background: bgCard, border: `1px solid ${border}`, borderRadius: '14px' }}>
              <div style={{ marginBottom: '24px' }}>
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="#f5c451" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="26" cy="26" r="20" /><ellipse cx="26" cy="26" rx="8" ry="20" />
                  <line x1="6" y1="26" x2="46" y2="26" />
                  <path d="M9 16 Q26 22 43 16" /><path d="M9 36 Q26 30 43 36" />
                </svg>
              </div>
              <h3 style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: '15px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: txtPri, marginBottom: '12px' }}>Multi-Factor Analysis</h3>
              <p style={{ fontSize: '14px', color: txtMuted, lineHeight: 1.75, margin: 0 }}>Every conflict, sanction, and central bank decision is mapped to its gold price impact in real time.</p>
            </div>

            <div style={{ padding: '36px 32px', background: bgCard, border: `1px solid ${border}`, borderRadius: '14px' }}>
              <div style={{ marginBottom: '24px' }}>
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke={gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="13" y="10" width="26" height="24" rx="7" />
                  <circle cx="20" cy="22" r="3" /><circle cx="32" cy="22" r="3" />
                  <path d="M20 30 Q26 35 32 30" />
                  <line x1="26" y1="34" x2="26" y2="44" /><line x1="18" y1="44" x2="34" y2="44" />
                  <line x1="7" y1="20" x2="13" y2="20" /><line x1="39" y1="20" x2="45" y2="20" />
                </svg>
              </div>
              <h3 style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: '15px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: txtPri, marginBottom: '12px' }}>AI-Powered Intelligence</h3>
              <p style={{ fontSize: '14px', color: txtMuted, lineHeight: 1.75, margin: 0 }}>Machine learning models trained on 20 years of gold price data deliver daily buy/sell/hold insights.</p>
            </div>

            <div style={{ padding: '36px 32px', background: bgCard, border: `1px solid ${border}`, borderRadius: '14px' }}>
              <div style={{ marginBottom: '24px' }}>
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke={gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="26" y1="42" x2="26" y2="30" /><line x1="16" y1="46" x2="36" y2="46" />
                  <path d="M8 24 Q17 10 26 10 Q35 10 44 24" />
                  <path d="M13 30 Q19 20 26 20 Q33 20 39 30" />
                  <circle cx="26" cy="30" r="3" fill={gold} stroke="none" />
                </svg>
              </div>
              <h3 style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: '15px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: txtPri, marginBottom: '12px' }}>Real-Time Data</h3>
              <p style={{ fontSize: '14px', color: txtMuted, lineHeight: 1.75, margin: 0 }}>Streaming XAU/USD prices, economic calendar events, and breaking news all in one unified dashboard.</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '100px 24px', background: bg }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.2em', color: gold, textTransform: 'uppercase', fontFamily: "'Chakra Petch',sans-serif", marginBottom: '12px' }}>Subscription Plans</div>
          <h2 style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 'clamp(22px,4vw,38px)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: txtPri, marginBottom: '16px' }}>Simple, Transparent Pricing</h2>
          <p style={{ color: txtMuted, fontSize: '14px', marginBottom: '60px' }}>Start free. Upgrade when you're ready.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px' }}>
            {[
              { name: 'Free', price: 'Free', period: 'forever', color: txtMuted, features: ['Live XAU/USD price', 'DXY, USD/JPY & US10Y', 'AI market snapshot', 'Basic news feed', 'Economic calendar', 'Community access'], cta: 'Get Started', href: '/register', highlight: false },
              { name: 'Individual', price: '$9', period: '/month', color: gold, features: ['Everything in Free', 'Full AI daily insights', 'Geopolitical heat map', 'Live chart with indicators', 'Real-time push alerts'], cta: 'Get Started', href: '/register', highlight: false },
              { name: 'Pro', price: '$40', period: '/month', color: gold, features: ['Everything in Individual', 'Unlimited AI analysis', 'Priority news stream', 'Custom price alerts', 'Priority support'], cta: 'Start Free Trial', href: '/register', highlight: true },
            ].map(plan => (
              <div key={plan.name} style={{
                padding: '36px 28px',
                background: plan.highlight
                  ? dark ? 'linear-gradient(180deg,rgba(245,196,81,0.08) 0%,rgba(10,14,23,0.95) 100%)' : 'linear-gradient(180deg,rgba(184,134,11,0.06) 0%,#ffffff 100%)'
                  : bgCard,
                border: `1px solid ${plan.highlight ? (dark ? 'rgba(245,196,81,0.35)' : 'rgba(184,134,11,0.35)') : border}`,
                borderRadius: '16px', position: 'relative',
                boxShadow: plan.highlight ? `0 0 40px ${gold}14` : 'none',
              }}>
                {plan.highlight && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: `linear-gradient(90deg,${gold},${dark ? '#d4a017' : '#8a6000'})`, padding: '4px 16px', borderRadius: '100px', fontSize: '10px', fontWeight: 800, color: dark ? '#0a0e17' : '#fff', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Chakra Petch',sans-serif" }}>Most Popular</div>}
                <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: plan.color, marginBottom: '12px' }}>{plan.name}</div>
                <div style={{ marginBottom: '28px' }}>
                  <span style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: '40px', fontWeight: 800, color: txtPri }}>{plan.price}</span>
                  <span style={{ fontSize: '13px', color: txtMuted, marginLeft: '4px' }}>{plan.period}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', textAlign: 'left' }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ fontSize: '13px', color: txtSec, padding: '7px 0', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: plan.color, fontSize: '12px' }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} style={{
                  display: 'block', width: '100%', padding: '12px',
                  background: plan.highlight ? gold : 'transparent',
                  border: plan.highlight ? 'none' : `1px solid ${border}`,
                  borderRadius: '4px', color: plan.highlight ? (dark ? '#0a0e17' : '#fff') : txtSec,
                  fontSize: '13px', fontWeight: plan.highlight ? 700 : 400,
                  letterSpacing: '-0.01em', textDecoration: 'none',
                  boxSizing: 'border-box', textAlign: 'center', transition: 'background 0.2s, color 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = plan.highlight ? (dark ? '#ffd166' : '#a07800') : (dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'); }}
                  onMouseLeave={e => { e.currentTarget.style.background = plan.highlight ? gold : 'transparent'; }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${border}`, background: dark ? '#0b0f1a' : '#edf0f7', padding: '64px 24px 32px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {/* Top row — brand + nav columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '40px', marginBottom: '48px', flexWrap: 'wrap' }}>

            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                  <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" stroke={gold} strokeWidth="2" fill="none" strokeLinejoin="round"/>
                  <polyline points="8,22 12,17 16,19 22,11" stroke={gold} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="22" cy="11" r="2.2" fill={gold}/>
                </svg>
                <span style={{ fontFamily: "'Chakra Petch',sans-serif", fontWeight: 800, fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', color: gold }}>Globard</span>
              </div>
              <p style={{ fontSize: '13px', color: txtMuted, lineHeight: 1.75, maxWidth: '260px', margin: 0 }}>
                A professional XAU/USD intelligence terminal. Real-time data, macro analysis and market insights in one place.
              </p>
            </div>

            {/* Product */}
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: txtMuted, marginBottom: '16px', fontFamily: "'Chakra Petch',sans-serif" }}>Product</div>
              {[['#home', 'Home'], ['#about', 'About'], ['#pricing', 'Pricing']].map(([href, label]) => (
                <a key={href} href={href} style={{ display: 'block', fontSize: '13px', color: txtSec, textDecoration: 'none', marginBottom: '10px', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = gold)}
                  onMouseLeave={e => (e.currentTarget.style.color = txtSec)}>{label}</a>
              ))}
            </div>

            {/* Account */}
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: txtMuted, marginBottom: '16px', fontFamily: "'Chakra Petch',sans-serif" }}>Account</div>
              {[['/login', 'Log In'], ['/register', 'Sign Up'], ['/dashboard', 'Dashboard']].map(([href, label]) => (
                <a key={href} href={href} style={{ display: 'block', fontSize: '13px', color: txtSec, textDecoration: 'none', marginBottom: '10px', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = gold)}
                  onMouseLeave={e => (e.currentTarget.style.color = txtSec)}>{label}</a>
              ))}
            </div>

            {/* Legal */}
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: txtMuted, marginBottom: '16px', fontFamily: "'Chakra Petch',sans-serif" }}>Legal</div>
              {[['#', 'Privacy Policy'], ['#', 'Terms of Service'], ['#', 'Risk Disclaimer']].map(([href, label]) => (
                <a key={label} href={href} style={{ display: 'block', fontSize: '13px', color: txtSec, textDecoration: 'none', marginBottom: '10px', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = gold)}
                  onMouseLeave={e => (e.currentTarget.style.color = txtSec)}>{label}</a>
              ))}
            </div>

          </div>

          {/* Divider */}
          <div style={{ borderTop: `1px solid ${border}`, paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ fontSize: '11px', color: txtMuted, letterSpacing: '0.06em', margin: 0 }}>
              © 2025 Globard. All rights reserved.
            </p>
            <p style={{ fontSize: '11px', color: txtMuted, margin: 0 }}>
              Trading involves risk. Past performance is not indicative of future results.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
