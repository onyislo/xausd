import React from 'react';

export default function TacticalSessions() {
  return (
    <div className="hidden lg:flex items-center gap-4 px-4 h-8 bg-slate-800/40 border-x border-slate-700/50">
       <div className="flex items-center gap-2">
           <span className="text-slate-500 text-[8px] font-bold tracking-[0.2em] uppercase">TKY</span>
           <span className="text-blue-400 font-mono text-xs font-bold tabular-nums">03:35:33</span>
       </div>
       
       <div className="w-[1px] h-3 bg-slate-700"></div>

       <div className="flex items-center gap-2">
           <span className="text-slate-500 text-[8px] font-bold tracking-[0.2em] uppercase">LDN</span>
           <span className="text-yellow-500 font-mono text-xs font-bold tabular-nums">03:56:35</span>
       </div>
       
       <div className="w-[1px] h-3 bg-slate-700"></div>

       <div className="flex items-center gap-2">
           <span className="text-slate-500 text-[8px] font-bold tracking-[0.2em] uppercase">NYC</span>
           <span className="text-yellow-500 font-mono text-xs font-bold tabular-nums">03:56:60</span>
       </div>
    </div>
  );
}
