'use client';
import Link from 'next/link';
import { useState } from 'react';
import LiveTicker from '@/components/LiveTicker';

export default function HomePage() {
  const [nav, setNav] = useState(false);

  return (
    <div style={{ background: '#0a0e17', color: '#e0e6ed', fontFamily: "'Inter',sans-serif", minHeight: '100vh' }}>
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
        background: 'rgba(10,14,23,0.98)', backdropFilter: 'blur(20px)', zIndex: 200,
        borderRight: '1px solid rgba(255,255,255,0.06)',
        transform: nav ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column', padding: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#f5c451,#b8860b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="14" width="20" height="5" rx="1" fill="#1a1200" />
                <rect x="4" y="9" width="16" height="5" rx="1" fill="#1a1200" />
                <rect x="6" y="4" width="12" height="5" rx="1" fill="#1a1200" />
              </svg>
            </div>
            <span style={{ fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f5c451' }}>AuScope</span>
          </div>
          <button onClick={() => setNav(false)} style={{ background: 'none', border: 'none', color: '#8a9bb2', cursor: 'pointer', padding: '4px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {[['#home', 'Home'], ['#about', 'About Us'], ['#pricing', 'Subscription']].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setNav(false)} style={{ fontSize: '16px', color: '#e0e6ed', textDecoration: 'none', letterSpacing: '0.04em' }}>{label}</a>
          ))}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
          <Link href="/login" onClick={() => setNav(false)} style={{ fontSize: '16px', color: '#8a9bb2', textDecoration: 'none' }}>Log in</Link>
          <Link href="/register" onClick={() => setNav(false)} style={{ fontSize: '16px', fontWeight: 600, color: '#f5c451', textDecoration: 'none' }}>Get started →</Link>
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
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(10,14,23,0.85)', backdropFilter: 'blur(16px)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Left Menu / Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="mobile-nav-btn" onClick={() => setNav(true)} style={{ background: 'none', border: 'none', color: '#f5c451', cursor: 'pointer', padding: '4px', marginLeft: '-4px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="nav-logo-icon" style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#f5c451,#b8860b)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(245,196,81,0.3)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="14" width="20" height="5" rx="1" fill="#1a1200" />
                  <rect x="4" y="9" width="16" height="5" rx="1" fill="#1a1200" />
                  <rect x="6" y="4" width="12" height="5" rx="1" fill="#1a1200" />
                </svg>
              </div>
              <span style={{ fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f5c451' }}>AuScope</span>
            </div>
          </div>

          {/* Desktop links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="desktop-nav">
            {[['#home', 'Home'], ['#about', 'About Us'], ['#pricing', 'Subscription']].map(([href, label]) => (
              <a key={href} href={href} style={{ fontSize: '13px', color: '#8a9bb2', textDecoration: 'none', letterSpacing: '0.04em', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#e0e6ed')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8a9bb2')}>{label}</a>
            ))}
          </div>

          {/* Auth links — text only, no boxes */}
          <div className="desktop-nav" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link href="/login" style={{ fontSize: '13px', fontWeight: 400, color: '#8a9bb2', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#e0e6ed')}
              onMouseLeave={e => (e.currentTarget.style.color = '#8a9bb2')}>Log in</Link>
            <Link href="/register" style={{ fontSize: '13px', fontWeight: 600, color: '#f5c451', textDecoration: 'none', borderBottom: '1px solid rgba(245,196,81,0.4)', paddingBottom: '1px', transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#f5c451')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(245,196,81,0.4)')}>Get started →</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="home" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle bg line */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(245,196,81,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(245,196,81,0.025) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.18em', color: '#f5c451', textTransform: 'uppercase', fontFamily: "'Chakra Petch',sans-serif", marginBottom: '28px', opacity: 0.8 }}>
            XAU/USD &nbsp;·&nbsp; Live Intelligence Terminal
          </p>

          <h1 style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 'clamp(32px,6vw,64px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '24px' }}>
            <span style={{ color: '#e0e6ed' }}>Trade Gold With</span><br />
            <span style={{ background: 'linear-gradient(90deg,#f5c451,#d4a017)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Total Edge</span>
          </h1>

          <p style={{ fontSize: '16px', color: '#8a9bb2', lineHeight: 1.8, maxWidth: '520px', margin: '0 auto 40px', fontWeight: 400 }}>
            Real-time XAU/USD signals driven by macro, central bank policy, technical analysis, and market sentiment — all in one terminal.
          </p>

          <div className="hero-buttons" style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'baseline', marginBottom: '8px' }}>
            <Link href="/login" style={{ fontSize: '16px', fontWeight: 600, color: '#f5c451', textDecoration: 'none', borderBottom: '1px solid #f5c451', paddingBottom: '2px', letterSpacing: '-0.01em', transition: 'opacity 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              Open the terminal →
            </Link>
            <a href="#about" style={{ fontSize: '14px', fontWeight: 400, color: '#6b7a8d', textDecoration: 'none', letterSpacing: '0em', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#8a9bb2')}
              onMouseLeave={e => (e.currentTarget.style.color = '#6b7a8d')}>How it works ↓</a>
          </div>

          <LiveTicker />
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding: '100px 24px', background: 'rgba(14,19,32,0.98)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.22em', color: '#f5c451', textTransform: 'uppercase', fontFamily: "'Chakra Petch',sans-serif", marginBottom: '14px' }}>About the Platform</div>
            <h2 style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 'clamp(26px,5vw,48px)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#ffffff', margin: 0 }}>
              Why Traders Choose Us
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '20px' }}>

            <div style={{ padding: '36px 32px', background: '#141c2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px' }}>
              <div style={{ marginBottom: '24px' }}>
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="#f5c451" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="26" cy="26" r="20" /><ellipse cx="26" cy="26" rx="8" ry="20" />
                  <line x1="6" y1="26" x2="46" y2="26" />
                  <path d="M9 16 Q26 22 43 16" /><path d="M9 36 Q26 30 43 36" />
                </svg>
              </div>
              <h3 style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: '15px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ffffff', marginBottom: '12px' }}>Multi-Factor Analysis</h3>
              <p style={{ fontSize: '14px', color: '#6b7a8d', lineHeight: 1.75, margin: 0 }}>Every conflict, sanction, and central bank decision is mapped to its gold price impact in real time.</p>
            </div>

            <div style={{ padding: '36px 32px', background: '#141c2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px' }}>
              <div style={{ marginBottom: '24px' }}>
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="#f5c451" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="13" y="10" width="26" height="24" rx="7" />
                  <circle cx="20" cy="22" r="3" /><circle cx="32" cy="22" r="3" />
                  <path d="M20 30 Q26 35 32 30" />
                  <line x1="26" y1="34" x2="26" y2="44" /><line x1="18" y1="44" x2="34" y2="44" />
                  <line x1="7" y1="20" x2="13" y2="20" /><line x1="39" y1="20" x2="45" y2="20" />
                </svg>
              </div>
              <h3 style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: '15px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ffffff', marginBottom: '12px' }}>AI-Powered Signals</h3>
              <p style={{ fontSize: '14px', color: '#6b7a8d', lineHeight: 1.75, margin: 0 }}>Machine learning models trained on 20 years of gold price data deliver daily buy/sell/hold signals.</p>
            </div>

            <div style={{ padding: '36px 32px', background: '#141c2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px' }}>
              <div style={{ marginBottom: '24px' }}>
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="#f5c451" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="26" y1="42" x2="26" y2="30" /><line x1="16" y1="46" x2="36" y2="46" />
                  <path d="M8 24 Q17 10 26 10 Q35 10 44 24" />
                  <path d="M13 30 Q19 20 26 20 Q33 20 39 30" />
                  <circle cx="26" cy="30" r="3" fill="#f5c451" stroke="none" />
                </svg>
              </div>
              <h3 style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: '15px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ffffff', marginBottom: '12px' }}>Real-Time Data</h3>
              <p style={{ fontSize: '14px', color: '#6b7a8d', lineHeight: 1.75, margin: 0 }}>Streaming XAU/USD prices, economic calendar events, and breaking news all in one unified dashboard.</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#f5c451', textTransform: 'uppercase', fontFamily: "'Chakra Petch',sans-serif", marginBottom: '12px' }}>Subscription Plans</div>
          <h2 style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 'clamp(22px,4vw,38px)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#e0e6ed', marginBottom: '16px' }}>Simple, Transparent Pricing</h2>
          <p style={{ color: '#6b7a8d', fontSize: '14px', marginBottom: '60px' }}>Start free. Upgrade when you're ready.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px' }}>
            {[
              { name: 'Starter', price: 'Free', period: 'forever', color: '#4a5568', features: ['Live XAU/USD chart', 'Basic news feed', '1 AI signal/day', 'Community access'], cta: 'Get Started', href: '/register', highlight: false },
              { name: 'Pro', price: '$49', period: '/month', color: '#f5c451', features: ['Everything in Starter', 'Unlimited AI signals', 'Geopolitical heat map', 'Economic calendar', 'Priority support'], cta: 'Start Free Trial', href: '/register', highlight: true },
              { name: 'Institutional', price: '$199', period: '/month', color: '#3b82f6', features: ['Everything in Pro', 'API data access', 'Custom alerts', 'White-label reports', 'Dedicated analyst'], cta: 'Contact Sales', href: '/register', highlight: false },
            ].map(plan => (
              <div key={plan.name} style={{
                padding: '36px 28px',
                background: plan.highlight ? 'linear-gradient(180deg,rgba(245,196,81,0.08) 0%,rgba(10,14,23,0.95) 100%)' : 'rgba(10,14,23,0.8)',
                border: `1px solid ${plan.highlight ? 'rgba(245,196,81,0.35)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '16px', position: 'relative',
                boxShadow: plan.highlight ? '0 0 40px rgba(245,196,81,0.08)' : 'none',
              }}>
                {plan.highlight && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(90deg,#f5c451,#d4a017)', padding: '4px 16px', borderRadius: '100px', fontSize: '10px', fontWeight: 800, color: '#0a0e17', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Chakra Petch',sans-serif" }}>Most Popular</div>}
                <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: plan.color, marginBottom: '12px' }}>{plan.name}</div>
                <div style={{ marginBottom: '28px' }}>
                  <span style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: '40px', fontWeight: 800, color: '#e0e6ed' }}>{plan.price}</span>
                  <span style={{ fontSize: '13px', color: '#4a5568', marginLeft: '4px' }}>{plan.period}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', textAlign: 'left' }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ fontSize: '13px', color: '#8a9bb2', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: plan.color, fontSize: '12px' }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} style={{
                  display: 'block', width: '100%', padding: '12px',
                  background: plan.highlight ? '#f5c451' : 'transparent',
                  border: plan.highlight ? 'none' : `1px solid rgba(255,255,255,0.1)`,
                  borderRadius: '4px', color: plan.highlight ? '#0a0e17' : '#8a9bb2',
                  fontSize: '13px', fontWeight: plan.highlight ? 700 : 400,
                  letterSpacing: '-0.01em', textDecoration: 'none',
                  boxSizing: 'border-box', textAlign: 'center', transition: 'background 0.2s, color 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = plan.highlight ? '#ffd166' : 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = plan.highlight ? '#0a0e17' : '#c9d1da'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = plan.highlight ? '#f5c451' : 'transparent'; e.currentTarget.style.color = plan.highlight ? '#0a0e17' : '#8a9bb2'; }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[['#home', 'Home'], ['#about', 'About'], ['#pricing', 'Pricing'], ['/login', 'Login'], ['/register', 'Sign Up']].map(([href, label]) => (
              <a key={href} href={href} style={{ fontSize: '12px', color: '#4a5568', textDecoration: 'none', letterSpacing: '0.06em' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#8a9bb2')}
                onMouseLeave={e => (e.currentTarget.style.color = '#4a5568')}>{label}</a>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: '#2a3441', letterSpacing: '0.08em' }}>
            © 2025 AUSCOPE · ALL RIGHTS RESERVED · SSL ENCRYPTED
          </p>
        </div>
      </footer>

    </div>
  );
}
