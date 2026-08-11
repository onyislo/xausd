'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/ThemeContext';
import {
  LayoutDashboard, Globe, BarChart2, Video,
  Newspaper, MessageSquare, Settings, Menu, X
} from 'lucide-react';

const HexLogo = ({ size = 24, color = '#f5c451' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round"/>
    <polyline points="8,22 12,17 16,19 22,11" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="22" cy="11" r="2.2" fill={color}/>
  </svg>
);

export default function Sidebar({ hideMobileTrigger = false }: { hideMobileTrigger?: boolean }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const bg       = dark ? '#0d1117'               : '#ffffff';
  const bgHover  = dark ? 'rgba(255,255,255,0.05)': 'rgba(0,0,0,0.05)';
  const bgActive = dark ? 'rgba(245,196,81,0.1)'  : 'rgba(184,134,11,0.1)';
  const border   = dark ? 'rgba(255,255,255,0.07)': 'rgba(0,0,0,0.09)';
  const txtSec   = dark ? '#64748b'               : '#94a3b8';
  const txtHover = dark ? '#e2e8f0'               : '#0f172a';
  const gold     = dark ? '#f5c451'               : '#b8860b';
  const tooltip  = dark ? '#1e293b'               : '#f1f5f9';
  const tooltipTxt = dark ? '#e2e8f0'             : '#0f172a';

  useEffect(() => {
    const cached = localStorage.getItem('user-profile');
    if (cached) setProfile(JSON.parse(cached));
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').update({ status: 'online' }).eq('id', user.id).then();
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
          .then(({ data }) => {
            const p = {
              ...data,
              full_name: data?.full_name || user.user_metadata?.full_name,
              avatar_url: data?.avatar_url || user.user_metadata?.avatar_url,
            };
            setProfile(p);
            localStorage.setItem('user-profile', JSON.stringify(p));
          });
      }
    });
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const navItems = [
    { name: 'Dashboard',   icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Global Intel', icon: Globe,           href: '/intel'     },
    { name: 'Markets',     icon: BarChart2,        href: '/chart'     },
    { name: 'Live Feeds',  icon: Video,            href: '/live'      },
    { name: 'News Stream', icon: Newspaper,        href: '/news'      },
  ];
  const bottomItems = [
    { name: 'Comms',    icon: MessageSquare, href: '/comms'    },
    { name: 'Settings', icon: Settings,      href: '/settings' },
  ];

  const NavIcon = ({ item }: { item: (typeof navItems)[0] }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    return (
      <Link href={item.href} style={{
        width: '100%', aspectRatio: '1', borderRadius: '12px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '4px', position: 'relative', transition: 'all 0.2s',
        background: isActive ? bgActive : 'transparent',
        color: isActive ? gold : txtSec,
        boxShadow: isActive ? `inset 2px 0 0 ${gold}` : 'none',
        textDecoration: 'none',
      }}
        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = bgHover; e.currentTarget.style.color = txtHover; } }}
        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = txtSec; } }}
      >
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        {/* Tooltip */}
        <div style={{
          position: 'absolute', left: 'calc(100% + 12px)', top: '50%', transform: 'translateY(-50%)',
          padding: '4px 10px', background: tooltip, color: tooltipTxt,
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
          borderRadius: '6px', border: `1px solid ${border}`, whiteSpace: 'nowrap',
          opacity: 0, pointerEvents: 'none', zIndex: 50,
          transition: 'opacity 0.15s',
        }} className="sidebar-tooltip">
          {item.name}
        </div>
      </Link>
    );
  };

  const MobileNavItem = ({ item }: { item: (typeof navItems)[0] }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    return (
      <Link href={item.href} onClick={() => setMobileOpen(false)} style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px',
        borderRadius: '12px', textDecoration: 'none', transition: 'all 0.2s',
        background: isActive ? bgActive : 'transparent',
        color: isActive ? gold : txtSec,
      }}>
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      <style>{`
        .sidebar-item:hover .sidebar-tooltip { opacity: 1 !important; }
        a:hover .sidebar-tooltip { opacity: 1 !important; }
      `}</style>

      {/* DESKTOP SIDEBAR */}
      <aside style={{
        width: '64px', height: '100vh', background: bg,
        borderRight: `1px solid ${border}`,
        flexDirection: 'column', alignItems: 'center',
        padding: '16px 0', zIndex: 40, flexShrink: 0, transition: 'background 0.2s',
      }} className="hidden md:flex">
        <Link href="/" style={{ marginBottom: '28px', display: 'flex', textDecoration: 'none' }}>
          <HexLogo size={28} color={gold} />
        </Link>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', padding: '0 8px' }}>
          {navItems.map(item => <NavIcon key={item.href} item={item} />)}
        </nav>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', padding: '0 8px', marginTop: 'auto' }}>
          {bottomItems.map(item => <NavIcon key={item.href} item={item} />)}
          {/* Profile */}
          <Link href="/profile" style={{
            width: '100%', aspectRatio: '1', borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: pathname === '/profile' ? bgActive : 'transparent',
            border: `2px solid ${pathname === '/profile' ? gold : border}`,
            overflow: 'hidden', textDecoration: 'none', transition: 'all 0.2s',
          }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              : <span style={{ fontSize: '13px', fontWeight: 700, color: pathname === '/profile' ? gold : txtSec }}>
                  {profile?.full_name?.[0] || 'U'}
                </span>
            }
          </Link>
        </nav>
      </aside>

      {/* MOBILE TRIGGER */}
      {!hideMobileTrigger && (
        <button onClick={() => setMobileOpen(true)} style={{
          position: 'fixed', top: '12px', left: '12px', zIndex: 40,
          width: '40px', height: '40px', borderRadius: '10px',
          background: bg, border: `1px solid ${border}`,
          alignItems: 'center', justifyContent: 'center',
          color: txtSec, cursor: 'pointer', backdropFilter: 'blur(8px)',
        }} className="flex md:hidden" aria-label="Open menu">
          <Menu size={20} />
        </button>
      )}

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)', zIndex: 40,
        }} className="md:hidden" />
      )}

      {/* MOBILE DRAWER */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, height: '100vh', width: '260px',
        background: bg, borderRight: `1px solid ${border}`, zIndex: 50,
        flexDirection: 'column', padding: '16px 0',
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
      }} className="flex md:hidden">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', marginBottom: '24px' }}>
          <Link href="/" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <HexLogo size={24} color={gold} />
            <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: gold, fontFamily: "'Chakra Petch',sans-serif" }}>Globard</span>
          </Link>
          <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', color: txtSec, cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px', overflowY: 'auto' }}>
          {navItems.map(item => <MobileNavItem key={item.href} item={item} />)}
          <div style={{ height: '1px', background: border, margin: '8px 0' }} />
          {bottomItems.map(item => <MobileNavItem key={item.href} item={item} />)}
          <Link href="/profile" onClick={() => setMobileOpen(false)} style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px',
            borderRadius: '12px', textDecoration: 'none',
            background: pathname === '/profile' ? bgActive : 'transparent',
            color: pathname === '/profile' ? gold : txtSec,
          }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: dark ? '#1e293b' : '#e2e8f0', border: `2px solid ${pathname === '/profile' ? gold : border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                : <span style={{ fontSize: '11px', fontWeight: 700 }}>{profile?.full_name?.[0] || 'U'}</span>
              }
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Profile</span>
          </Link>
        </nav>
      </aside>
    </>
  );
}
