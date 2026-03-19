'use client';

import React, { useState } from 'react';
import GoldChart from './GoldChart';
import GlobeVisualization from './GlobeVisualization';
import { AreaChart, Globe } from 'lucide-react';

export default function CenterIntelToggle() {
  const [activeView, setActiveView] = useState<'chart' | 'map'>('map');

  return (
    <div className="flex flex-col gap-3 flex-grow pt-1">
      {/* Toggle Controls */}
      <div className="flex justify-center relative z-30">
        <div className="flex bg-slate-900/80 border border-slate-700/50 rounded-full p-1 backdrop-blur shadow-xl">
          <button
            onClick={() => setActiveView('chart')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${
              activeView === 'chart' 
                ? 'bg-yellow-500 text-slate-900' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AreaChart size={12} />
            Market Analysis
          </button>
          <button
            onClick={() => setActiveView('map')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${
              activeView === 'map' 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe size={12} />
            Global Intel
          </button>
        </div>
      </div>

      {/* Display Area */}
      <div className="flex-grow flex flex-col min-h-[300px] animate-in fade-in duration-500">
        {activeView === 'chart' ? <GoldChart height={340} /> : <GlobeVisualization />}
      </div>
    </div>
  );
}
