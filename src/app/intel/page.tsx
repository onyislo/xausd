'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import GlobeVisualization from '@/components/GlobeVisualization';
import {
  ShieldAlert, Globe2, TrendingUp, Map as MapIcon, Zap,
  Activity, Building2, Pickaxe, Brain, Calendar
} from 'lucide-react';

export default function GlobalIntelPage() {
  return (
    <main className="terminal-layout bg-[#0a0e17] text-slate-200 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-[64px] border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Globe2 size={20} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-[14px] font-black tracking-[0.15em] text-slate-100 uppercase" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                Global Intelligence Terminal
              </h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mt-0.5">Geopolitical Risk &amp; Macro Analysis</p>
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

        <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-gradient-to-b from-slate-900/20 to-transparent">
          <div className="flex-[2] relative min-h-[400px] border-r border-slate-800/40 bg-slate-900/10">
            <div className="w-full h-full">
              <GlobeVisualization />
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-[320px] bg-slate-900/30 backdrop-blur-sm border-l border-slate-800/40 overflow-hidden">
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
                  { label: 'Energy Security', val: 'Stable', color: 'text-green-500' },
                ].map(item => (
                  <div key={item.label} className="bg-slate-800/40 border border-slate-700/30 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-[11px] text-slate-400 font-medium">{item.label}</span>
                    <span className={`text-[11px] font-bold ${item.color}`}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

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
                  { time: '09:15', text: 'Institutional Gold flows hit YTD high', type: 'Flow' },
                ].map((log, i) => (
                  <div key={i} className="flex gap-3 text-[11px] leading-relaxed border-b border-slate-800/20 pb-2 last:border-0">
                    <span className="text-slate-600 font-mono shrink-0">{log.time}</span>
                    <div>
                      <span className="text-blue-400 font-bold uppercase tracking-tighter mr-2">[{log.type}]</span>
                      <span className="text-slate-300">{log.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
