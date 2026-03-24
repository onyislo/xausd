import React from 'react';
import Link from 'next/link';

import LiveNewsStream from '@/components/LiveNewsStream';
import NewsAggregator from '@/components/NewsAggregator';
import FlatMapVisualization from '@/components/FlatMapVisualization';
import GoldChart from '@/components/GoldChart';
import Sidebar from '@/components/Sidebar';
import HeaderPrice from '@/components/HeaderPrice';

export default function Dashboard() {
  return (
    <main className="terminal-layout bg-[#0a0e17] text-slate-200 font-sans">
      <Sidebar />
      <div className="terminal-content">
        
        {/* ── HEADER ── */}
        <header className="terminal-header relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800">
          {/* Decorative lines */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent"></div>
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent"></div>

          {/* Title Area (Logo is now in Sidebar) */}
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-[15px] font-black tracking-[0.12em] text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 uppercase" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                  AuScope
                </h1>
                <span className="text-slate-500 text-[10px] tracking-widest uppercase font-semibold">|</span>
                <span className="text-[11px] text-slate-400 tracking-[0.15em] uppercase font-semibold" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Terminal</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-slate-600 tracking-widest uppercase">Global Intelligence</span>
                <span className="text-[9px] text-slate-700">•</span>
                <span className="text-[9px] text-slate-600 tracking-widest uppercase">v3.0.0</span>
              </div>
            </div>
          </div>

          {/* Right side — status + tools */}
          <div className="flex items-center gap-5">
            <HeaderPrice />
            
            <div className="h-7 w-px bg-slate-700/60"></div>
            
            {/* Status indicators */}
            <div className="flex items-center gap-3 mr-2">
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.8)] animate-pulse"></div>
                <span className="text-[8px] text-slate-600 uppercase tracking-wider">Sys</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.6)]"></div>
                <span className="text-[8px] text-slate-600 uppercase tracking-wider">AI</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── ROW 1: MAP AND CHART ── */}
        <div className="terminal-map">
          <div className="w-full h-full flex flex-col bg-slate-900/40 rounded-lg overflow-hidden border border-slate-800/50">
             <div className="px-3 py-1.5 bg-slate-800/80 border-b border-slate-700/50 flex justify-between items-center shrink-0">
               <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Global Intelligence Map</span>
             </div>
             <div className="flex-1 relative min-h-0">
               <FlatMapVisualization />
             </div>
          </div>
        </div>

        <div className="terminal-chart panel p-0 border-yellow-500/20 bg-slate-900/60 rounded-lg flex flex-col min-h-[300px]">
          <div className="px-3 py-1.5 bg-slate-800/80 border-b border-yellow-500/10 flex justify-between items-center shrink-0">
            <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">XAU/USD Market Analysis</span>
          </div>
          <div className="flex-1 relative min-h-0 p-1">
            <GoldChart />
          </div>
        </div>

        {/* ── ROW 2: VIDEO, AI NEWS, NEWS LIST ── */}
        <div className="terminal-bottom-left">
          <div className="terminal-video">
            <LiveNewsStream />
          </div>
          <div className="terminal-ai-news">
            <NewsAggregator />
          </div>
        </div>

        <div className="terminal-news-list panel p-0 border-slate-800 rounded-lg flex flex-col">
          <div className="bg-slate-800/50 p-3 border-b border-slate-700 flex justify-between shrink-0 items-center">
            <span className="text-yellow-500 text-xs font-bold uppercase tracking-wider">Live News Stream</span>
            <div className="flex gap-4">
              <Link href="/news" className="text-xs text-yellow-500 font-bold tracking-widest cursor-pointer hover:text-yellow-400 flex items-center gap-1 transition-colors">VIEW ALL ↗</Link>
              <span className="text-xs text-slate-400 font-bold tracking-widest cursor-pointer hover:text-white flex items-center gap-1">FILTER <span className="text-slate-300">▼</span></span>
            </div>
          </div>

          {/* Header row */}
          <div className="flex px-4 py-2 text-[10px] text-slate-500 font-bold tracking-widest border-b border-slate-800/50 bg-slate-900/40 shrink-0">
            <div className="w-[140px]">PRIORITY</div>
            <div className="flex-1">HEADLINE</div>
            <div className="w-[80px] text-right">TIMSET</div>
          </div>

          <div className="flex flex-col flex-1 overflow-y-auto p-2 gap-1 bg-slate-900/60 custom-scrollbar">
            {/* News Item 1 */}
            <div className="flex items-center text-sm border-b border-slate-800/50 pt-1 pb-2 px-2 hover:bg-slate-800 transition-colors cursor-pointer rounded">
              <div className="w-[140px]">
                <div className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider inline-block text-center w-[120px]">Breaking<br />News High</div>
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

            {/* News Item 2 */}
            <div className="flex items-center text-sm border-b border-slate-800/50 pt-1 pb-2 px-2 hover:bg-slate-800 transition-colors cursor-pointer rounded">
              <div className="w-[140px]">
                <div className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider inline-block text-center w-[120px]">Geopolitical<br />News Med</div>
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

            {/* News Item 3 */}
            <div className="flex items-center text-sm border-b border-slate-800/50 pt-1 pb-2 px-2 hover:bg-slate-800 transition-colors cursor-pointer rounded">
              <div className="w-[140px]">
                <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider inline-block text-center w-[120px]">Market<br />News Med</div>
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

            {/* News Item 4 */}
            <div className="flex items-center text-sm pt-1 pb-2 px-2 hover:bg-slate-800 transition-colors cursor-pointer rounded">
              <div className="w-[140px]">
                <div className="bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider inline-block text-center w-[120px]">Economic<br />News Low</div>
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
      </div>
    </main>
  );
}
