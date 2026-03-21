'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import HeaderPrice from '@/components/HeaderPrice';

export default function MarketsPage() {
  const [buyersPct, setBuyersPct] = useState(64.2);
  const [sellersPct, setSellersPct] = useState(35.8);

  // Mock fluctuation in buyer/seller data for dynamic feel
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() * 2 - 1) * 0.5; // -0.5 to +0.5
      setBuyersPct(prev => {
        let next = prev + change;
        if (next > 80) next = 80;
        if (next < 20) next = 20;
        return Number(next.toFixed(1));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSellersPct(Number((100 - buyersPct).toFixed(1)));
  }, [buyersPct]);

  return (
    <main className="terminal-layout bg-[#0a0e17] text-slate-200 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0a0e17] p-4 gap-4">
        
        {/* ── HEADER ── */}
        <header className="shrink-0 h-[60px] relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 flex justify-between items-center px-6 border border-slate-800/60 rounded-xl shadow-lg">
          {/* Decorative lines */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent"></div>
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent"></div>

          {/* Title Area */}
          <div className="flex items-center gap-4 z-10">
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-[16px] font-black tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 uppercase" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                  AuScope
                </h1>
                <span className="text-slate-500 text-[11px] tracking-widest uppercase font-semibold">|</span>
                <span className="text-[13px] text-slate-300 tracking-[0.2em] uppercase font-bold" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Markets Data</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-slate-500 tracking-[0.2em] uppercase">Global Intelligence</span>
                <span className="text-[9px] text-slate-700">•</span>
                <span className="text-[9px] text-slate-500 tracking-[0.2em] uppercase">v3.0.0</span>
              </div>
            </div>
          </div>

          {/* Right side — status + tools */}
          <div className="flex items-center gap-6 z-10">
            <HeaderPrice />
            
            <div className="h-8 w-px bg-slate-700/60"></div>
            
            {/* Status indicators */}
            <div className="flex items-center gap-4 mr-2">
              <div className="flex flex-col items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></div>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Sys</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]"></div>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">AI</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── MAIN CONTENT (MARKET DATA TERMINAL) ── */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          
          {/* COLUMN 1: Order Flow & Market Depth */}
          <div className="xl:col-span-1 md:col-span-1 bg-[#0f1420] border border-yellow-500/20 rounded-xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-4 py-3 bg-slate-800/80 border-b border-yellow-500/10 flex justify-between items-center shrink-0">
               <span className="text-[11px] text-yellow-500 font-bold uppercase tracking-[0.15em]">XAU/USD Order Flow</span>
            </div>
            <div className="p-4 flex flex-col gap-5 flex-1 overflow-y-auto custom-scrollbar bg-[#0c1117]">
              
              {/* Buyer/Seller Ratio */}
              <div>
                <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">Real-time Dominance</h3>
                <div className="flex justify-between mb-1">
                   <span className="text-xs text-green-400 font-bold tracking-widest uppercase">Buyers {buyersPct}%</span>
                   <span className="text-xs text-red-400 font-bold tracking-widest uppercase">{sellersPct}% Sellers</span>
                </div>
                <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                  <div className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-700 relative" style={{ width: `${buyersPct}%` }}>
                     <div className="absolute inset-0 bg-white/10 w-full animate-pulse"></div>
                  </div>
                  <div className="h-full bg-gradient-to-l from-red-600 to-red-400 transition-all duration-700 relative" style={{ width: `${sellersPct}%` }}></div>
                </div>
              </div>

              {/* Level 2 Order Book */}
              <div className="flex-1 flex flex-col pt-2">
                <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">Level 2 Depth (Top Liquidity)</h3>
                
                <div className="flex gap-3 flex-1">
                  {/* Bids */}
                  <div className="flex-1 flex flex-col gap-1.5 border-r border-slate-800/50 pr-3">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest text-center">Bids (Vol)</span>
                    {[
                      { price: '2,328.45', vol: '1,450' },
                      { price: '2,328.10', vol: '2,100' },
                      { price: '2,327.90', vol: '4,500' },
                      { price: '2,326.50', vol: '8,200' },
                      { price: '2,325.00', vol: '18,500', isLarge: true },
                      { price: '2,320.00', vol: '22,000', isLarge: true },
                    ].map((idx, i) => (
                      <div key={i} className={`flex justify-between text-xs font-mono py-1 px-1.5 rounded ${idx.isLarge ? 'bg-green-500/10 text-green-300 font-bold border-l-2 border-green-500' : 'text-slate-400'}`}>
                        <span>{idx.vol}</span>
                        <span className="text-green-500">{idx.price}</span>
                      </div>
                    ))}
                  </div>

                  {/* Asks */}
                  <div className="flex-1 flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest text-center">Asks (Vol)</span>
                    {[
                      { price: '2,329.10', vol: '800' },
                      { price: '2,329.40', vol: '1,200' },
                      { price: '2,329.85', vol: '3,100' },
                      { price: '2,330.00', vol: '14,500', isLarge: true },
                      { price: '2,331.20', vol: '4,200' },
                      { price: '2,335.00', vol: '25,000', isLarge: true },
                    ].map((idx, i) => (
                      <div key={i} className={`flex justify-between text-xs font-mono py-1 px-1.5 rounded ${idx.isLarge ? 'bg-red-500/10 text-red-300 font-bold border-r-2 border-red-500' : 'text-slate-400'}`}>
                        <span className="text-red-500">{idx.price}</span>
                        <span>{idx.vol}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* COLUMN 2: Liquidity Nodes & Options Flow (NEW) */}
          <div className="xl:col-span-1 md:col-span-1 bg-[#0f1420] border border-yellow-500/20 rounded-xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-4 py-3 bg-slate-800/80 border-b border-yellow-500/10 flex justify-between items-center shrink-0">
               <span className="text-[11px] text-yellow-500 font-bold uppercase tracking-[0.15em]">Liquidity & Options Flow</span>
            </div>
            <div className="p-4 flex flex-col gap-5 flex-1 overflow-y-auto custom-scrollbar bg-[#0c1117]">
              
              {/* Technical Liquidity Zones */}
              <div className="flex flex-col gap-2">
                 <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest border-b border-slate-800 pb-1">Key Liquidity Nodes</h3>
                 <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-red-500/5 border border-red-500/20 p-2 rounded flex flex-col">
                      <span className="text-[9px] text-red-400 font-bold uppercase">Resistance (R2)</span>
                      <span className="text-sm font-mono text-slate-200">2,342.50</span>
                    </div>
                    <div className="bg-red-500/5 border border-red-500/20 p-2 rounded flex flex-col">
                      <span className="text-[9px] text-red-400 font-bold uppercase">Resistance (R1)</span>
                      <span className="text-sm font-mono text-slate-200">2,335.00</span>
                    </div>
                    <div className="bg-yellow-500/5 border border-yellow-500/20 p-2 rounded flex flex-col col-span-2 items-center justify-center">
                      <span className="text-[9px] text-yellow-500 font-bold uppercase tracking-widest">Vol. Point of Control (POC)</span>
                      <span className="text-md font-mono font-bold text-yellow-500">2,328.00</span>
                    </div>
                    <div className="bg-green-500/5 border border-green-500/20 p-2 rounded flex flex-col">
                      <span className="text-[9px] text-green-400 font-bold uppercase">Support (S1)</span>
                      <span className="text-sm font-mono text-slate-200">2,320.00</span>
                    </div>
                    <div className="bg-green-500/5 border border-green-500/20 p-2 rounded flex flex-col">
                      <span className="text-[9px] text-green-400 font-bold uppercase">Support (S2)</span>
                      <span className="text-sm font-mono text-slate-200">2,312.40</span>
                    </div>
                 </div>
              </div>

              {/* Options Skew / Greeks */}
              <div className="mt-2">
                 <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">Options Market Skew</h3>
                 <div className="flex flex-col gap-3">
                   <div className="flex items-center justify-between p-2 bg-slate-900/40 rounded border border-slate-800/50">
                     <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Put/Call Ratio</span>
                     <span className="text-xs font-mono text-green-400 font-bold">0.82 (Bullish)</span>
                   </div>
                   <div className="flex items-center justify-between p-2 bg-slate-900/40 rounded border border-slate-800/50">
                     <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">25-Delta Skew</span>
                     <span className="text-xs font-mono text-yellow-500 font-bold">+0.4 Vols</span>
                   </div>
                   <div className="flex items-start gap-3 mt-1">
                     <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1 shadow-[0_0_5px_rgba(245,196,81,0.6)]"></div>
                     <div className="flex flex-col">
                       <span className="text-[11px] text-slate-200 font-bold tracking-wide">Max Pain Strike (Exp Friday)</span>
                       <span className="text-[10px] text-slate-400 leading-relaxed mt-0.5">Heavy institutional call writing clustered at <span className="text-red-400 font-mono font-bold">2,350</span>, acting as major overhead ceiling.</span>
                     </div>
                   </div>
                 </div>
              </div>

            </div>
          </div>

          {/* COLUMN 3: Macro & USD Drivers */}
          <div className="xl:col-span-1 md:col-span-1 bg-[#0f1420] border border-yellow-500/20 rounded-xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-4 py-3 bg-slate-800/80 border-b border-yellow-500/10 flex justify-between items-center shrink-0">
               <span className="text-[11px] text-yellow-500 font-bold uppercase tracking-[0.15em]">Macro & USD Drivers</span>
            </div>
            <div className="p-4 flex flex-col gap-5 flex-1 overflow-y-auto custom-scrollbar bg-[#0c1117]">
              
              {/* Core Correlated Indexes */}
              <div className="flex flex-col gap-2">
                 <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest border-b border-slate-800 pb-1 mb-1">Live USD Metrics</h3>
                 <div className="p-3 bg-slate-900/60 rounded border border-slate-800/50 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-slate-300 font-bold tracking-widest uppercase">DXY (US Dollar Index)</span>
                      <span className="text-[9px] text-red-400 font-bold">Inverse Correlation</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-mono text-slate-200">104.25</span>
                      <span className="text-[10px] text-red-400 font-mono">-0.42% ▼</span>
                    </div>
                 </div>

                 <div className="p-3 bg-slate-900/60 rounded border border-slate-800/50 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-slate-300 font-bold tracking-widest uppercase">US 10Y Treasury</span>
                      <span className="text-[9px] text-red-400 font-bold">Opportunity Cost</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-mono text-slate-200">4.285%</span>
                      <span className="text-[10px] text-red-400 font-mono">-0.041 ▼</span>
                    </div>
                 </div>

                 <div className="p-3 bg-slate-900/60 rounded border border-slate-800/50 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-slate-300 font-bold tracking-widest uppercase">GVZ (Gold Vol.)</span>
                      <span className="text-[9px] text-green-400 font-bold">Market Uncertainty</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-mono text-slate-200">14.65</span>
                      <span className="text-[10px] text-green-400 font-mono">+1.20% ▲</span>
                    </div>
                 </div>
              </div>

              {/* Fundamental Intel */}
              <div className="mt-1">
                 <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">Key Fundamental Catalysts</h3>
                 <div className="flex flex-col gap-4">
                   <div className="flex items-start gap-3">
                     <div className="w-8 h-8 rounded shrink-0 bg-blue-500/10 border border-blue-500/20 flex flex-col items-center justify-center">
                       <span className="text-[8px] text-blue-400 font-bold">FED</span>
                     </div>
                     <div className="flex flex-col">
                       <span className="text-xs text-slate-200 font-bold tracking-wide">FOMC Probabilities</span>
                       <span className="text-[10px] text-slate-400 leading-relaxed mt-1">CME FedWatch Tools indicates a <span className="text-yellow-500 font-bold">65% chance</span> of a 25bps rate cut, supporting XAU.</span>
                     </div>
                   </div>

                   <div className="flex items-start gap-3">
                     <div className="w-8 h-8 rounded shrink-0 bg-red-500/10 border border-red-500/20 flex flex-col items-center justify-center">
                       <span className="text-[8px] text-red-400 font-bold">INF</span>
                     </div>
                     <div className="flex flex-col">
                       <span className="text-xs text-slate-200 font-bold tracking-wide">US CPI Data Imminent</span>
                       <span className="text-[10px] text-slate-400 leading-relaxed mt-1">Markets bracing for Core CPI print. A cooler print will heavily pressure the DXY.</span>
                     </div>
                   </div>
                 </div>
              </div>

            </div>
          </div>

          {/* COLUMN 4: Institutional Sentinel & Market Tape */}
          <div className="xl:col-span-1 md:col-span-1 bg-[#0f1420] border border-yellow-500/20 rounded-xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-4 py-3 bg-slate-800/80 border-b border-yellow-500/10 flex justify-between items-center shrink-0">
               <span className="text-[11px] text-yellow-500 font-bold uppercase tracking-[0.15em]">Institutional & Tape</span>
            </div>
            
            <div className="p-4 flex flex-col gap-6 flex-1 bg-[#0c1117] overflow-y-auto custom-scrollbar">
              
              {/* Institutions */}
              <div className="flex flex-col">
                <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">Tier 1 Bank Exposure</h3>
                <div className="flex flex-col gap-2">
                  {[
                    { name: 'JPMorgan Chase', pos: 'Net Long', size: '+450K oz', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
                    { name: 'Goldman Sachs', pos: 'Neutral', size: '+120K oz', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
                    { name: 'HSBC Holdings', pos: 'Net Short', size: '-300K oz', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
                    { name: 'Bank of America', pos: 'Net Long', size: '+85K oz', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
                  ].map((bank, i) => (
                    <div key={i} className="flex flex-col p-2 bg-slate-900/40 rounded border border-slate-800/50 hover:bg-slate-800/80 transition-colors">
                       <div className="flex justify-between items-center mb-1">
                         <span className="text-[11px] text-slate-200 font-bold">{bank.name}</span>
                         <span className={`text-[8px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-widest ${bank.color} ${bank.bg} ${bank.border}`}>{bank.pos}</span>
                       </div>
                       <div className="flex justify-between items-center text-[9px] font-mono">
                         <span className="text-slate-500 font-sans font-bold uppercase tracking-widest">Size:</span>
                         <span className="text-slate-200">{bank.size}</span>
                       </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Block Trade Tape */}
              <div className="flex flex-col mt-auto pb-2">
                <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">Live Block Tape</h3>
                <div className="flex flex-col gap-1.5">
                  {[
                    { time: '14:52:11', type: 'BUY', price: '2,328.45', value: '$3.49M' },
                    { time: '14:51:04', type: 'SELL', price: '2,328.60', value: '$9.78M' },
                    { time: '14:48:33', type: 'BUY', price: '2,327.90', value: '$1.86M' },
                    { time: '14:45:19', type: 'SWEEP', price: '2,325.00', value: '$29.0M', highlight: true },
                    { time: '14:42:01', type: 'SELL', price: '2,326.10', value: '$2.55M' },
                    { time: '14:35:12', type: 'DARK POOL', price: '2,320.00', value: '$58.0M', dark: true },
                  ].map((trade, i) => (
                    <div key={i} className={`flex items-center justify-between p-1.5 rounded border text-[9px] font-mono
                      ${trade.dark ? 'bg-purple-900/20 border-purple-500/30 text-purple-300' : 
                        trade.highlight ? 'bg-green-900/20 border-green-500/30 text-green-300' : 
                        trade.type === 'SELL' ? 'bg-red-900/10 border-red-500/10 text-red-400' : 'bg-green-900/10 border-green-500/10 text-green-400'}
                    `}>
                      <span className="text-slate-500">{trade.time}</span>
                      <span className="font-bold w-[50px]">{trade.type}</span>
                      <span>{trade.price}</span>
                      <span className="font-bold text-slate-300">{trade.value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
