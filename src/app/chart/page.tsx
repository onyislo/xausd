'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import HeaderPrice from '@/components/HeaderPrice';
import GoldChart from '@/components/GoldChart';

export default function ChartPage() {
  return (
    <main className="terminal-layout bg-[#0a0e17] text-slate-200 font-sans flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 p-4 gap-4 overflow-hidden">
        <header className="shrink-0 h-[60px] bg-[#0f1420] border border-yellow-500/10 flex justify-between items-center px-6 rounded-xl shadow-lg relative">
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent" />
          <h1 className="text-[16px] font-black tracking-widest text-yellow-500 uppercase">Globard | Charts</h1>
          <div className="flex items-center gap-6"><HeaderPrice /></div>
        </header>
        <div className="flex-1 bg-[#0f1420] border border-yellow-500/20 rounded-xl overflow-hidden shadow-2xl">
          <GoldChart height={600} fullscreen={false} />
        </div>
      </div>
    </main>
  );
}
