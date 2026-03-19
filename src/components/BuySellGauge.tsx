import React from 'react';

export default function BuySellGauge() {
  return (
    <div className="panel border border-slate-800 bg-slate-900/60 rounded-lg overflow-hidden flex flex-col h-full">
       <div className="p-4 flex justify-between items-center flex-1">
          <div className="flex flex-col h-full justify-between">
              <div className="text-slate-400 text-xs font-bold font-mono tracking-widest">BUY/SELL GAUGE</div>
              <div className="text-white text-xs font-mono font-bold">GOLD (XAU/USD)</div>
              <div className="text-green-500 text-[10px] font-mono mt-1 tracking-widest">CONFIDENCE: 89%</div>
          </div>
          
          <div className="flex flex-col items-center justify-center">
              <div className="text-slate-500 text-[10px] font-mono tracking-widest mb-1">PREDICTION:</div>
              <div className="text-yellow-500 text-3xl font-bold font-mono tracking-widest">BUY</div>
          </div>
       </div>
    </div>
  );
}
