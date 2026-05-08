'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  LayoutDashboard,
  Globe,
  BarChart2,
  Video,
  Newspaper,
  MessageSquare,
  Settings,
  Menu,
  X
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Load from cache on mount
    const cached = localStorage.getItem('user-profile');
    if (cached) setProfile(JSON.parse(cached));
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').update({ status: 'online' }).eq('id', user.id).then();
        if (user.email) {
          supabase.from('profiles').update({ status: 'online' }).eq('email', user.email).then();
        }
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
          .then(({ data }) => {
            const p = {
              ...data,
              full_name: data?.full_name || user.user_metadata?.full_name,
              avatar_url: data?.avatar_url || user.user_metadata?.avatar_url
            };
            setProfile(p);
            localStorage.setItem('user-profile', JSON.stringify(p));
          });
      }
    });
  }, []);

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Global Intel', icon: Globe, href: '/intel' },
    { name: 'Markets', icon: BarChart2, href: '/chart' },
    { name: 'Live Feeds', icon: Video, href: '/live' },
    { name: 'News Stream', icon: Newspaper, href: '/news' },
  ];

  const bottomItems = [
    { name: 'Comms', icon: MessageSquare, href: '/comms' },
    { name: 'Settings', icon: Settings, href: '/settings' },
  ];

  const renderNav = (items: typeof navItems, mobile = false) => items.map((item) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    if (mobile) {
      return (
        <Link
          key={item.name}
          href={item.href}
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            isActive ? 'bg-yellow-500/10 text-yellow-500' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
          }`}
        >
          <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
          <span className="text-sm font-bold tracking-wider uppercase">{item.name}</span>
        </Link>
      );
    }
    return (
      <Link
        key={item.name}
        href={item.href}
        className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 group relative transition-all ${
          isActive ? 'bg-yellow-500/10 text-yellow-500 shadow-[inset_2px_0_0_#f5c451]' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'
        }`}
      >
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="transition-transform group-hover:scale-110" />
        <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-slate-200 text-[10px] font-bold tracking-widest uppercase rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-slate-700">
          {item.name}
        </div>
      </Link>
    );
  });

  return (
    <>
      {/* DESKTOP SIDEBAR (md+) */}
      <aside className="hidden md:flex w-[64px] h-screen bg-slate-900 border-r border-slate-800/60 flex-col items-center py-4 z-40 shrink-0">
        <Link href="/" className="mb-8 shrink-0">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-700 shadow-[0_0_12px_rgba(245,196,81,0.4)] flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="14" width="20" height="5" rx="1" fill="#1a1200" opacity="0.9" />
              <rect x="4" y="9" width="16" height="5" rx="1" fill="#1a1200" opacity="0.9" />
              <rect x="6" y="4" width="12" height="5" rx="1" fill="#1a1200" opacity="0.9" />
            </svg>
          </div>
        </Link>
        <nav className="flex-1 flex flex-col gap-4 w-full px-2">{renderNav(navItems)}</nav>
        <nav className="flex flex-col gap-4 w-full px-2 mt-auto">
          {renderNav(bottomItems)}
          <Link
            href="/profile"
            className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 group relative transition-all ${
              pathname === '/profile' ? 'bg-yellow-500/10 text-yellow-500 shadow-[inset_2px_0_0_#f5c451]' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <div className={`w-8 h-8 rounded-full bg-slate-800 border-2 flex items-center justify-center transition-colors overflow-hidden ${
              pathname === '/profile' ? 'border-yellow-500' : 'border-slate-700 group-hover:border-slate-500'
            }`}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
              ) : (
                <span className={`text-xs font-bold transition-colors ${pathname === '/profile' ? 'text-yellow-500' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {profile?.full_name?.[0] || profile?.username?.[0] || 'U'}
                </span>
              )}
            </div>
          </Link>
        </nav>
      </aside>

      {/* MOBILE HAMBURGER TRIGGER (visible < md) */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-40 w-10 h-10 rounded-lg bg-slate-900/90 border border-slate-700 flex items-center justify-center text-slate-200 backdrop-blur-sm shadow-lg"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`md:hidden fixed top-0 left-0 h-screen w-[260px] bg-slate-900 border-r border-slate-800/60 z-50 flex flex-col py-4 transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 mb-6">
          <Link href="/" onClick={() => setMobileOpen(false)}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-700 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="14" width="20" height="5" rx="1" fill="#1a1200" opacity="0.9" />
                <rect x="4" y="9" width="16" height="5" rx="1" fill="#1a1200" opacity="0.9" />
                <rect x="6" y="4" width="12" height="5" rx="1" fill="#1a1200" opacity="0.9" />
              </svg>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-9 h-9 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">
          {renderNav(navItems, true)}
          <div className="my-2 border-t border-slate-800/60" />
          {renderNav(bottomItems, true)}
        </nav>

        <div className="px-3 mt-2">
          <Link
            href="/profile"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              pathname === '/profile' ? 'bg-yellow-500/10 text-yellow-500' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <div className={`w-8 h-8 rounded-full bg-slate-800 border-2 flex items-center justify-center overflow-hidden ${
              pathname === '/profile' ? 'border-yellow-500' : 'border-slate-700'
            }`}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
              ) : (
                <span className="text-xs font-bold">{profile?.full_name?.[0] || profile?.username?.[0] || 'U'}</span>
              )}
            </div>
            <span className="text-sm font-bold tracking-wider uppercase">Profile</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
