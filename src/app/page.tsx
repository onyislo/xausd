import React from 'react';
import Link from 'next/link';


import LiveNewsStream from '@/components/LiveNewsStream';
import EconomicPulse from '@/components/EconomicPulse';
import BuySellGauge from '@/components/BuySellGauge';
import TacticalSessions from '@/components/TacticalSessions';
import CenterIntelToggle from '@/components/CenterIntelToggle';
import NewsAggregator from '@/components/NewsAggregator';
import LiveChat from '@/components/LiveChat';
import HeaderPrice from '@/components/HeaderPrice';

export default function Home() {
  return (
    <main className="dashboard-grid bg-[#0a0e17] text-slate-200 font-sans">
      
      {/* Header Area */}
      <header className="area-header col-span-full flex justify-between items-center px-5 py-2 border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 rounded-lg relative overflow-hidden">
        {/* Decorative accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent"></div>
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent"></div>
        
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          {/* Logo Mark */}
          <div className="relative w-9 h-9 shrink-0">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-700 shadow-[0_0_12px_rgba(245,196,81,0.4)]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Gold bars icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="14" width="20" height="5" rx="1" fill="#1a1200" opacity="0.9"/>
                <rect x="4" y="9" width="16" height="5" rx="1" fill="#1a1200" opacity="0.9"/>
                <rect x="6" y="4" width="12" height="5" rx="1" fill="#1a1200" opacity="0.9"/>
              </svg>
            </div>
          </div>

          {/* Brand text */}
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-[15px] font-black tracking-[0.12em] text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 uppercase" style={{fontFamily: "'Chakra Petch', sans-serif"}}>
                Geopolitical Gold
              </h1>
              <span className="text-slate-500 text-[10px] tracking-widest uppercase font-semibold">|</span>
              <span className="text-[11px] text-slate-400 tracking-[0.15em] uppercase font-semibold" style={{fontFamily: "'Chakra Petch', sans-serif"}}>Trading Intelligence</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] text-slate-600 tracking-widest uppercase">XAU/USD Terminal</span>
              <span className="text-[9px] text-slate-700">•</span>
              <span className="text-[9px] text-slate-600 tracking-widest uppercase">v2.4.1</span>
            </div>
          </div>
        </div>

        {/* PERSISTENT SESSION MONITOR */}
        <TacticalSessions />

        {/* Right side — status + market info */}
        <div className="flex items-center gap-5">
          {/* XAU Price */}
          <HeaderPrice />

          {/* Divider */}
          <div className="h-7 w-px bg-slate-700/60"></div>

          {/* System status */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.8)] animate-pulse"></div>
              <span className="text-[8px] text-slate-600 uppercase tracking-wider">Live</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.6)]"></div>
              <span className="text-[8px] text-slate-600 uppercase tracking-wider">AI</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.6)]"></div>
              <span className="text-[8px] text-slate-600 uppercase tracking-wider">Data</span>
            </div>
          </div>
        </div>
      </header>

      {/* Left Column */}
      <aside className="area-left overflow-y-auto pr-1">
        <LiveNewsStream />
        <EconomicPulse />
        <BuySellGauge />
      </aside>

      {/* Center Column (Globe & Sessions) */}
      <section className="area-center overflow-y-auto pr-1">
        <CenterIntelToggle />
      </section>

      {/* Right Column */}
      <aside className="area-right overflow-y-auto pr-1">
        <NewsAggregator />
      </aside>

      {/* Bottom Area */}
      <div className="area-bottom col-span-full flex gap-4">
        {/* News Stream List */}
        <div className="panel flex-[3] flex flex-col h-full bg-slate-900/80 border border-slate-800 rounded-lg overflow-hidden">
             <div className="bg-slate-800/50 p-3 border-b border-slate-700 flex justify-between h-[40px] items-center">
                <span className="text-yellow-500 text-xs font-bold uppercase tracking-wider">Live News Stream</span>
                 <div className="flex gap-4">
                    <Link href="/news" className="text-xs text-yellow-500 font-bold tracking-widest cursor-pointer hover:text-yellow-400 flex items-center gap-1 transition-colors">VIEW ALL NEWS ↗</Link>
                    <span className="text-xs text-slate-400 font-bold tracking-widest cursor-pointer hover:text-white flex items-center gap-1">FILTER: <span className="text-slate-300">FILTER </span></span>
                    <span className="text-xs text-slate-400 font-bold tracking-widest cursor-pointer hover:text-white flex items-center gap-1">EXPORT <span className="text-slate-300">☷</span></span>
                </div>
             </div>
             
             {/* Header row */}
             <div className="flex px-4 py-2 text-[10px] text-slate-500 font-bold tracking-widest border-b border-slate-800/50 bg-slate-900/40">
                <div className="w-[140px]">PRIORITY</div>
                <div className="flex-1">HEADLINE</div>
                <div className="w-[80px] text-right">TIMSET</div>
             </div>

             <div className="flex flex-col flex-1 overflow-y-auto p-2 gap-1 bg-slate-900/60">
                {/* Item 1 */}
                <div className="flex items-center text-sm border-b border-slate-800/50 pb-2 pt-1 px-2 hover:bg-slate-800 transition-colors cursor-pointer rounded">
                    <div className="w-[140px]">
                        <div className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider inline-block text-center w-[120px]">Breaking<br/>News High</div>
                    </div>
                    <div className="flex-1 px-4">
                        <div className="text-slate-200 font-bold text-sm">Global Tension Spike: Naval South China Sea</div>
                        <div className="text-[10px] text-slate-500">Source: Reuters & BBC</div>
                    </div>
                    <div className="w-[80px] text-right flex flex-col items-end">
                        <span className="text-slate-400 text-xs">14:38:05</span>
                        <span className="text-slate-500 text-[10px]">Impact ▼</span>
                    </div>
                </div>
                
                 {/* Item 2 */}
                <div className="flex items-center text-sm border-b border-slate-800/50 pb-2 pt-1 px-2 hover:bg-slate-800 transition-colors cursor-pointer rounded">
                    <div className="w-[140px]">
                        <div className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider inline-block text-center w-[120px]">Geopolitical<br/>News Med</div>
                    </div>
                    <div className="flex-1 px-4">
                         <div className="text-slate-200 font-bold text-sm">Geopolitical Conflict Zones: In South China</div>
                         <div className="text-[10px] text-slate-500">Bloomberg. EUROPE</div>
                    </div>
                    <div className="w-[80px] text-right flex flex-col items-end">
                        <span className="text-slate-400 text-xs">14:38:03</span>
                        <span className="text-slate-500 text-[10px]">Impact ⚬</span>
                    </div>
                </div>

                {/* Item 3 */}
                <div className="flex items-center text-sm border-b border-slate-800/50 pb-2 pt-1 px-2 hover:bg-slate-800 transition-colors cursor-pointer rounded">
                    <div className="w-[140px]">
                        <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider inline-block text-center w-[120px]">Market<br/>News Med</div>
                    </div>
                    <div className="flex-1 px-4">
                        <div className="text-slate-200 font-bold text-sm">Central Bank Meeting: ECB Hints at Rate Hike</div>
                        <div className="text-[10px] text-slate-500">Bloomberg. EUROPE</div>
                    </div>
                    <div className="w-[80px] text-right flex flex-col items-end">
                        <span className="text-slate-400 text-xs">14:35:05</span>
                        <span className="text-slate-500 text-[10px]">Impact ⚬</span>
                    </div>
                </div>

                {/* Item 4 */}
                <div className="flex items-center text-sm border-b border-slate-800/50 pb-2 pt-1 px-2 hover:bg-slate-800 transition-colors cursor-pointer rounded">
                    <div className="w-[140px]">
                        <div className="bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider inline-block text-center w-[120px]">Economic<br/>News Low</div>
                    </div>
                    <div className="flex-1 px-4">
                        <div className="text-slate-200 font-bold text-sm">Gold Demand Update: Demand Imports Rise</div>
                        <div className="text-[10px] text-slate-500">First News. SOUTH</div>
                    </div>
                    <div className="w-[80px] text-right flex flex-col items-end">
                        <span className="text-slate-400 text-xs">14:31:05</span>
                        <span className="text-green-500 text-[10px]">Impact ▲</span>
                    </div>
                </div>
             </div>
        </div>
        
        <div className="flex-[2] h-full">
            <LiveChat />
        </div>
      </div>
      
    </main>
  );
}
