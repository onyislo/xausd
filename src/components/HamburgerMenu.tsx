'use client';

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import EconomicPulse from './EconomicPulse';
import BuySellGauge from './BuySellGauge';
import LiveChat from './LiveChat';
import TacticalSessions from './TacticalSessions';
import UserMenu from './UserMenu';

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-1.5 rounded bg-slate-800/80 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors text-slate-400 focus:outline-none"
      >
        <Menu size={18} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 left-0 h-screen w-[360px] max-w-[90vw] bg-gradient-to-b from-slate-900 via-[#0a0e17] to-slate-900 border-r border-slate-800/60 shadow-[20px_0_40px_rgba(0,0,0,0.5)] z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60 bg-slate-900/50">
          <h2 className="text-sm font-bold tracking-[0.15em] text-yellow-500 uppercase" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
            Auxiliary Tools
          </h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col gap-4 p-4">
          <div className="flex justify-between items-center bg-slate-800/30 p-3 rounded border border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Profile</span>
            <UserMenu />
          </div>
          
          <div className="border border-slate-800/60 bg-slate-900/30 rounded overflow-hidden">
             <div className="bg-slate-800/50 p-2 border-b border-slate-800/60 text-[10px] text-slate-500 font-bold uppercase tracking-widest shrink-0">Market Sessions</div>
             <div className="p-3">
               <TacticalSessions />
             </div>
          </div>

          <div className="border border-slate-800/60 bg-slate-900/30 rounded overflow-hidden flex flex-col min-h-[300px]">
             <EconomicPulse />
          </div>

          <div className="border border-slate-800/60 bg-slate-900/30 rounded overflow-hidden">
             <BuySellGauge />
          </div>

          <div className="border border-slate-800/60 bg-slate-900/30 rounded overflow-hidden h-[400px]">
             <LiveChat />
          </div>
          
          <div className="h-6 shrink-0"></div>
        </div>
      </div>
    </>
  );
}
