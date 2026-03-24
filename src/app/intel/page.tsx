'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import GlobeVisualization from '@/components/GlobeVisualization';
import { 
  ShieldAlert, 
  Globe2, 
  TrendingUp, 
  Map as MapIcon, 
  Zap,
  Activity,
  Building2,
  Pickaxe,
  Brain,
  Calendar
} from 'lucide-react';

export default function GlobalIntelPage() {
  return (
    <main className="terminal-layout bg-[#0a0e17] text-slate-200 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* ── HEADER ── */}
        <header className="h-[64px] border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Globe2 size={20} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-[14px] font-black tracking-[0.15em] text-slate-100 uppercase" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                Global Intelligence Terminal
              </h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mt-0.5">Geopolitical Risk & Macro Analysis</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 px-4 py-1.5 bg-slate-800/40 border border-slate-700/50 rounded-lg">
               <div className="flex flex-col items-center">
                  <span className="text-[8px] text-slate-500 font-bold uppercase">Sentiment</span>
                  <span className="text-[10px] text-green-400 font-bold">BULLISH</span>
               </div>
               <div className="w-px h-6 bg-slate-700" />
               <div className="flex flex-col items-center">
                  <span className="text-[8px] text-slate-500 font-bold uppercase">Liquidity</span>
                  <span className="text-[10px] text-yellow-500 font-bold">TIGHTENING</span>
               </div>
            </div>
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
              <ShieldAlert size={14} className="text-red-500 animate-pulse" />
              <span className="text-[10px] text-red-500 font-black uppercase tracking-widest">Risk Level: High</span>
            </div>
          </div>
        </header>

        {/* ── INTEL CONTENT ── */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-gradient-to-b from-slate-900/20 to-transparent">
          
          {/* Globe Section (Large) */}
          <div className="flex-[2] relative min-h-[400px] border-r border-slate-800/40 bg-slate-900/10">
            {/* Overlay Panels */}
            <div className="absolute top-4 left-4 z-20 space-y-3">
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl backdrop-blur-sm w-40">
                 <div className="text-[9px] text-slate-500 font-bold tracking-widest uppercase mb-1">Live Coordinates</div>
                 <div className="text-[11px] font-mono text-blue-400">20.0000° N, 0.0000° E</div>
              </div>
              
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl backdrop-blur-sm w-40">
                 <div className="text-[9px] text-slate-500 font-bold tracking-widest uppercase mb-2">Regional Sentiment</div>
                 <div className="space-y-2">
                    {['ASIA', 'EURO', 'US'].map(reg => (
                      <div key={reg} className="flex items-center justify-between">
                         <span className="text-[9px] text-slate-400 font-bold">{reg}</span>
                         <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${reg === 'US' ? 'bg-red-500 w-3/4' : 'bg-green-500 w-1/2'}`} />
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
 
              {/* Institutional Intelligence (Banks) */}
              <div className="p-5 border-b border-slate-800/60 transition-all hover:bg-slate-800/20">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] font-bold text-slate-400 tracking-widest uppercase flex items-center gap-2">
                       <Building2 size={14} className="text-blue-400" /> Institutional Int.
                    </h3>
                    <span className="text-[10px] text-blue-500 font-bold">14 Banks Active</span>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 bg-slate-950/40 border border-slate-800 rounded-lg">
                       <div className="text-[8px] text-slate-500 font-bold uppercase mb-1">JPM BULLISH</div>
                       <div className="text-[11px] font-black text-slate-200 font-mono">$2.4B <span className="text-[9px] text-slate-500 font-normal">INFLOW</span></div>
                    </div>
                    <div className="p-2.5 bg-slate-950/40 border border-slate-800 rounded-lg">
                       <div className="text-[8px] text-slate-500 font-bold uppercase mb-1">GS NEUTRAL</div>
                       <div className="text-[11px] font-black text-slate-200 font-mono">$1.1B <span className="text-[9px] text-slate-500 font-normal">HEDGE</span></div>
                    </div>
                 </div>
              </div>
 
              {/* Mining Operations (Gold Mines) */}
              <div className="p-5 border-b border-slate-800/60 transition-all hover:bg-slate-800/20">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] font-bold text-slate-400 tracking-widest uppercase flex items-center gap-2">
                       <Pickaxe size={14} className="text-yellow-500" /> Mining Intel
                    </h3>
                    <span className="text-[10px] text-yellow-500 font-bold tracking-widest uppercase">Operational</span>
                 </div>
                 <div className="space-y-2.5">
                    <div className="flex justify-between items-center bg-slate-800/20 p-2 rounded border border-slate-700/30">
                       <span className="text-[10px] text-slate-400 font-bold uppercase">Nevada Gold Mines</span>
                       <span className="text-[10px] text-green-500 font-black">+4.2% OPS</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-800/20 p-2 rounded border border-slate-700/30">
                       <span className="text-[10px] text-slate-400 font-bold uppercase">Muruntau (UZ)</span>
                       <span className="text-[10px] text-slate-200 font-black">98.1% CAP</span>
                    </div>
                 </div>
              </div>
 
              {/* Sentiment Hub (Retail & AI) */}
              <div className="p-5 border-b border-slate-800/60 transition-all hover:bg-slate-800/20">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] font-bold text-slate-400 tracking-widest uppercase flex items-center gap-2">
                       <Brain size={14} className="text-purple-400" /> Sentiment Core
                    </h3>
                    <div className="flex gap-1">
                       <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                       <span className="text-[9px] text-purple-400 font-bold uppercase tracking-widest">Live Signals</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex-1">
                       <div className="text-[8px] text-slate-500 font-bold uppercase mb-1.5">Retail Trader</div>
                       <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 w-[65%]" />
                       </div>
                       <div className="flex justify-between text-[9px] mt-1.5 text-slate-400 font-medium font-mono">
                          <span>LONG</span><span>65%</span>
                       </div>
                    </div>
                    <div className="flex-1">
                       <div className="text-[8px] text-slate-500 font-bold uppercase mb-1.5">AI Sentiment</div>
                       <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 w-[78%]" />
                       </div>
                       <div className="flex justify-between text-[9px] mt-1.5 text-slate-400 font-medium font-mono">
                          <span>BULLISH</span><span>78%</span>
                       </div>
                    </div>
                 </div>
              </div>
 
              {/* Strategic Roadmap (Plans) */}
              <div className="p-5 border-b border-slate-800/60 transition-all hover:bg-slate-800/20">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] font-bold text-slate-400 tracking-widest uppercase flex items-center gap-2">
                       <Calendar size={14} className="text-green-400" /> Future Roadmap
                    </h3>
                 </div>
                 <div className="space-y-2">
                    <div className="text-[10px] text-slate-300 flex items-center gap-3 bg-slate-800/10 p-2 rounded">
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                       <span className="font-medium">Basel III Final Compliance - Q4 2026</span>
                    </div>
                    <div className="text-[10px] text-slate-300 flex items-center gap-3 bg-slate-800/10 p-2 rounded">
                       <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                       <span className="font-medium">CBDC Gold Digital Integration - PHASE 1</span>
                    </div>
                 </div>
              </div>
            </div>
            
            {/* Hotspots Overlay */}
            <div className="absolute top-4 right-4 z-20">
               <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-xl backdrop-blur-sm">
                  <div className="text-[9px] text-red-500 font-black uppercase tracking-widest mb-2 flex items-center gap-1">
                     <Zap size={10} /> Active Hotspots
                  </div>
                  <div className="space-y-1.5">
                     <div className="text-[10px] text-slate-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        Suez Canal Obstruction
                     </div>
                     <div className="text-[10px] text-slate-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                        South China Sea Drill
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="w-full h-full">
               <GlobeVisualization />
            </div>
            
            <div className="absolute bottom-6 left-6 z-20">
               <div className="flex items-center gap-6">
                  {['APAC', 'EU', 'MENA', 'AMER'].map(region => (
                    <div key={region} className="flex flex-col gap-1">
                       <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">{region}</span>
                       <div className="h-1 w-12 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${region === 'MENA' ? 'bg-red-500 w-4/5' : 'bg-green-500 w-1/3'}`} />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Intelligence Sidebar */}
          <div className="flex-1 flex flex-col min-w-[320px] bg-slate-900/30 backdrop-blur-sm border-l border-slate-800/40 overflow-hidden">
             
             {/* Risk Dashboard */}
             <div className="p-5 border-b border-slate-800/60 transition-all hover:bg-slate-800/20">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-[11px] font-bold text-slate-400 tracking-widest uppercase flex items-center gap-2">
                      <Activity size={14} className="text-blue-400" /> Geopolitical Pulse
                   </h3>
                   <span className="text-[10px] text-blue-500 font-bold">+1.2% Vol</span>
                </div>
                
                <div className="space-y-3">
                   {[
                     { label: 'Supply Chain Stress', val: '84%', color: 'text-red-500' },
                     { label: 'Central Bank Policy', val: 'Hawkish', color: 'text-yellow-500' },
                     { label: 'Energy Security', val: 'Stable', color: 'text-green-500' }
                   ].map(item => (
                     <div key={item.label} className="bg-slate-800/40 border border-slate-700/30 p-3 rounded-lg flex justify-between items-center group cursor-help">
                        <span className="text-[11px] text-slate-400 font-medium">{item.label}</span>
                        <span className={`text-[11px] font-bold ${item.color}`}>{item.val}</span>
                     </div>
                   ))}
                </div>
             </div>

             {/* Central Bank Watch */}
             <div className="p-5 border-b border-slate-800/60">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Central Bank Watch</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg">
                      <div className="text-[8px] text-slate-500 font-bold uppercase mb-1">FED (US)</div>
                      <div className="text-[12px] font-black text-slate-200">5.50% <span className="text-[9px] text-slate-500 font-normal">NC</span></div>
                   </div>
                   <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg">
                      <div className="text-[8px] text-slate-500 font-bold uppercase mb-1">ECB (EU)</div>
                      <div className="text-[12px] font-black text-slate-200">4.50% <span className="text-[9px] text-yellow-500 font-normal">▲</span></div>
                   </div>
                </div>
             </div>

             {/* Intelligence Stream */}
             <div className="flex-1 flex flex-col min-h-0">
                <div className="px-5 py-4 bg-slate-800/30 border-b border-slate-800/60 flex justify-between items-center">
                   <h3 className="text-[11px] font-bold text-slate-400 tracking-widest uppercase flex items-center gap-2">
                      <Zap size={14} className="text-yellow-500" /> Intel Stream
                   </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                   {[
                     { time: '14:20', text: 'ECB hints at aggressive rate hike cycle', type: 'Macro' },
                     { time: '13:45', text: 'Container fleet congestion in Suez rises', type: 'Trade' },
                     { time: '12:10', text: 'Gold reserves up 4% in Asian markets', type: 'Asset' },
                     { time: '10:30', text: 'New trade sanctions proposed in EU council', type: 'Risk' },
                     { time: '09:15', text: 'Institutional Gold flows hit YTD high', type: 'Flow' }
                   ].map((log, i) => (
                     <div key={i} className="flex gap-3 text-[11px] leading-relaxed border-b border-slate-800/20 pb-2 last:border-0 hover:bg-slate-800/10 px-1 rounded transition-colors cursor-default">
                        <span className="text-slate-600 font-mono shrink-0">{log.time}</span>
                        <div>
                           <span className="text-blue-400 font-bold uppercase tracking-tighter mr-2">[{log.type}]</span>
                           <span className="text-slate-300">{log.text}</span>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             {/* Footer Navigation */}
             <div className="p-4 border-t border-slate-800/60 bg-slate-900/40">
                <button className="w-full py-2 bg-blue-600/10 border border-blue-500/30 rounded-lg text-blue-400 text-[10px] font-bold tracking-widest uppercase hover:bg-blue-600 hover:text-white transition-all">
                   Export Intelligence Report
                </button>
             </div>

          </div>

        </div>
      </div>
    </main>
  );
}
