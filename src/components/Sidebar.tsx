'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Globe, 
  BarChart2, 
  Video, 
  Newspaper, 
  MessageSquare, 
  Settings,
  LogOut
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

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

  return (
    <aside className="w-[64px] h-screen bg-slate-900 border-r border-slate-800/60 flex flex-col items-center py-4 z-40 shrink-0">
      {/* Brand Icon */}
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-700 shadow-[0_0_12px_rgba(245,196,81,0.4)] flex items-center justify-center mb-8 shrink-0">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="14" width="20" height="5" rx="1" fill="#1a1200" opacity="0.9" />
          <rect x="4" y="9" width="16" height="5" rx="1" fill="#1a1200" opacity="0.9" />
          <rect x="6" y="4" width="12" height="5" rx="1" fill="#1a1200" opacity="0.9" />
        </svg>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 flex flex-col gap-4 w-full px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 group relative transition-all ${
                isActive 
                  ? 'bg-yellow-500/10 text-yellow-500 shadow-[inset_2px_0_0_#f5c451]' 
                  : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="transition-transform group-hover:scale-110" />
              <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-slate-200 text-[10px] font-bold tracking-widest uppercase rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-slate-700">
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <nav className="flex flex-col gap-4 w-full px-2 mt-auto">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 group relative transition-all ${
                isActive 
                  ? 'bg-yellow-500/10 text-yellow-500 shadow-[inset_2px_0_0_#f5c451]' 
                  : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="transition-transform group-hover:scale-110" />
              <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-slate-200 text-[10px] font-bold tracking-widest uppercase rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-slate-700">
                {item.name}
              </div>
            </Link>
          );
        })}
        
        {/* User / Logout */}
        <button className="w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 group relative text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all mt-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center group-hover:border-red-500/50 transition-colors overflow-hidden">
             <span className="text-xs font-bold text-slate-400 group-hover:text-red-400">T</span>
          </div>
          <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-slate-200 text-[10px] font-bold tracking-widest uppercase rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-slate-700">
            Sign Out
          </div>
        </button>
      </nav>
    </aside>
  );
}
