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

          {/* News Card 1 */}
          <div className="bg-slate-800/50 rounded border border-red-500/30 p-3">
              <div className="flex justify-between items-center text-[10px] text-red-400 mb-1">
                  <span>RED RATED (HIGH)</span>
                  <span>14:38:05 UTC</span>
              </div>
              <h3 className="text-slate-200 text-sm font-bold leading-tight mb-2">
                  Global Tension Spike: Naval Confrontation in South China Sea
              </h3>
              <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>Source: REUTERS & BBC</span>
                  <span>IMPACT: HIGH</span>
              </div>
          </div>

          {/* News Card 2 */}
          <div className="bg-slate-800/50 rounded border border-yellow-500/30 p-3">
              <div className="flex justify-between items-center text-[10px] text-yellow-500 mb-1">
                  <span>AMBER RATED (MED)</span>
                  <span>14:35:05 UTC</span>
              </div>
              <h3 className="text-slate-200 text-sm font-bold leading-tight mb-2">
                  Central Bank Meeting: ECB Hints at Rate Hike
              </h3>
              <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>Source: BLOOMBERG</span>
                  <span>IMPACT: MED</span>
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
