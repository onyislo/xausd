import React from 'react';
import Link from 'next/link';


export default function NewsAggregator() {
  return (
    <div className="panel flex-1 bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden flex flex-col min-h-0">
       <div className="panel-header bg-slate-800/80 px-4 py-2 border-b border-yellow-500/10 flex justify-between items-center">
        <h2 className="title-font text-slate-300 text-sm font-bold tracking-widest">
          AI-DRIVEN NEWS AGGREGATOR
        </h2>
        <Link href="/news" className="text-[10px] text-yellow-500 hover:text-yellow-400 font-bold tracking-widest uppercase transition-colors">
          SEE ALL ↗
        </Link>
      </div>
      
      <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto">
          {/* Threat Levels */}
          <div className="flex flex-col gap-1 mb-2">
              <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-green-500 font-bold">LOW THREAT (GREEN)</span>
                  <span className="text-slate-400">- 12</span>
              </div>
               <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-yellow-500 font-bold">MEDIUM THREAT (AMBER)</span>
                  <span className="text-slate-400">- 8</span>
              </div>
               <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-red-500 font-bold">HIGH THREAT (RED)</span>
                  <span className="text-slate-400">- 3 CRITICAL ITEMS</span>
              </div>
          </div>

          {/* AI Signal Card */}
          <div className="bg-red-500/10 rounded border border-red-500/50 p-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              <div className="flex justify-between items-center text-[10px] text-red-400 mb-1 font-bold">
                  <span className="flex items-center gap-1"><span className="animate-pulse w-2 h-2 bg-red-500 rounded-full inline-block"></span> SYSTEM ALERT: AI SELL SIGNAL</span>
                  <span>LIVE</span>
              </div>
              <h3 className="text-red-100 text-sm font-black leading-tight mb-2 uppercase">
                  Hormuz Blockade: Institutional Liquidity Sell-Off
              </h3>
              <div className="text-xs text-slate-300 leading-snug mb-3">
                  <span className="font-bold text-red-400">AI Analysis:</span> Escalation in Arabian Sea (US Navy seized M/V Touska). While war typically drives gold up, our AI detects threat levels hitting peak, triggering <strong>big institutions to sell gold for cash (USD) liquidity</strong>.
              </div>
              <div className="bg-black/50 p-2 rounded border border-red-500/30 flex justify-between items-center mb-2">
                 <div className="text-[10px] text-slate-400 font-mono">
                   <div className="mb-0.5">TARGET ZONE:</div>
                   <div className="text-red-400 font-bold text-xs">4750.00 → 4723.00</div>
                 </div>
                 <div className="text-[10px] text-slate-400 font-mono text-right">
                   <div className="mb-0.5">ACTION:</div>
                   <div className="text-red-500 font-black text-xs animate-pulse">STRONG SELL</div>
                 </div>
              </div>
              <div className="text-[9px] text-slate-500 flex justify-between uppercase">
                  <span>Source: AI MARKET SENTIMENT</span>
                  <span>IMPACT: CRITICAL</span>
              </div>
          </div>
          
           {/* News Card 3 */}
          <div className="bg-slate-800/50 rounded border border-green-500/30 p-3 flex-1 flex flex-col">
              <div className="flex justify-between items-center text-[10px] text-green-500 mb-1">
                  <span>GREEN RATED (LOW)</span>
                  <span>14:31:05 UTC</span>
              </div>
              <h3 className="text-slate-200 text-sm font-bold leading-tight mb-2">
                  Gold Demand Update: India Imports Rise
              </h3>
              <div className="text-[10px] text-slate-500 flex justify-between border-b border-slate-700/50 pb-2 mb-2">
                  <span>Source: MINING.COM</span>
                  <span>IMPACT: LOW</span>
              </div>
              <div className="text-xs text-slate-400 leading-snug flex-1">
                 <span className="font-bold text-slate-300">News Feed:</span> Naval confrontation in South China Sea. This has increased demand for safe haven assets as a new geopolitical conflict has triggered a secure asset run mainly by institutions. Gold (XAUUSD) is expected to see significant flow report.
              </div>
          </div>
      </div>
    </div>
  );
}
