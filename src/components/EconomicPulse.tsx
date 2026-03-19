import React from 'react';
import { TrendingUp, Activity } from 'lucide-react';

export default function EconomicPulse() {
  return (
    <div className="panel flex-[1.5] bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden flex flex-col h-full min-h-0">
       <div className="panel-header bg-slate-800/80 px-4 py-2 flex justify-between items-center border-b border-yellow-500/10">
        <h2 className="title-font text-yellow-500 text-sm font-bold flex items-center gap-2">
          ECONOMIC PULSE
        </h2>
      </div>
      
      <div className="p-4 flex flex-col gap-4 flex-1">
          {/* NFP Data */}
          <div>
              <div className="text-slate-400 text-sm mb-1">Real-time NFP</div>
              <div className="flex justify-between items-end">
                  <div>
                      <div className="text-yellow-500 text-3xl font-bold font-mono tracking-tighter">
                          +254K
                      </div>
                      <div className="text-slate-500 text-[10px] mt-1">14:30:05 UTC</div>
                  </div>
                  <div className="flex flex-col items-end">
                      <TrendingUp className="text-green-500 w-6 h-6 mb-1" />
                      <div className="text-green-500 text-xs font-bold">+1.5%</div>
                      <div className="text-slate-500 text-[10px] uppercase">Trend</div>
                  </div>
              </div>
          </div>
          
           {/* CPI Data Spacer */}
          <div className="border-t border-slate-800/60 my-1"></div>

          {/* CPI Data */}
          <div>
              <div className="flex justify-between items-end">
                  <div>
                      <div className="text-yellow-500 text-3xl font-bold font-mono tracking-tighter">
                          3.2% <span className="text-lg">YoY</span>
                      </div>
                      <div className="text-slate-500 text-[10px] mt-1">14:30:05 UTC</div>
                  </div>
                  <div className="flex flex-col items-end">
                      <Activity className="text-blue-500 w-6 h-6 mb-1" />
                      <div className="text-slate-500 text-[10px] uppercase">Inflation</div>
                  </div>
              </div>
          </div>
          
          {/* Mini Sparkline Chart Placeholder */}
          <div className="mt-auto h-16 w-full flex items-end justify-between relative">
             <div className="absolute bottom-0 w-full h-[1px] bg-slate-800"></div>
             {/* Fake line chart */}
             <svg className="absolute w-full h-full" preserveAspectRatio="none">
                <path d="M0,50 L20,45 L40,48 L60,35 L80,38 L100,20 L120,25 L140,15 L160,10 L180,5 L200,20" fill="none" stroke="rgba(234, 179, 8, 0.5)" strokeWidth="2" />
                <path d="M0,50 L20,45 L40,48 L60,35 L80,38 L100,20 L120,25 L140,15 L160,10 L180,5 L200,20 L200,60 L0,60 Z" fill="url(#grad)" />
                <defs>
                   <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(234, 179, 8, 0.2)" />
                      <stop offset="100%" stopColor="rgba(234, 179, 8, 0)" />
                   </linearGradient>
                </defs>
             </svg>
             <div className="w-1 h-1 rounded-full bg-yellow-400 absolute bottom-10 right-[35px] shadow-[0_0_8px_rgba(250,204,21,1)]"></div>
          </div>
          
          <div className="flex justify-between text-[10px] text-slate-600 mt-1">
              <span>Past</span>
              <span>12 Months</span>
          </div>
      </div>
    </div>
  );
}
