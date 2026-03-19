'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Maximize2, Volume2, PlayCircle, ChevronDown } from 'lucide-react';
import { videoStreams } from '@/lib/videoData';

export default function LiveNewsStream() {
  const [selectedChannel, setSelectedChannel] = useState(videoStreams[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="panel border-yellow-500/20 bg-slate-900/60 rounded-lg overflow-hidden flex flex-col h-full animate-pulse">
        <div className="h-6 bg-slate-800/80"></div>
        <div className="flex-1 bg-slate-900/40 m-2 rounded"></div>
      </div>
    );
  }

  return (
    <div className="panel border-yellow-500/20 bg-slate-900/60 rounded-lg overflow-hidden flex flex-col h-full relative">
      <div className="px-3 py-1 flex justify-between items-center border-b border-yellow-500/10 bg-slate-800/80 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-yellow-500 text-[10px] font-bold uppercase tracking-widest leading-none">
            Live Feed
          </h2>
          <div className="h-3 w-px bg-slate-700"></div>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1 text-[9px] text-slate-300 hover:text-white font-bold uppercase tracking-tighter transition-colors"
          >
            {selectedChannel.source} <ChevronDown size={10} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <Link href="/live" className="text-[9px] text-slate-500 hover:text-yellow-500 font-bold tracking-widest uppercase transition-colors">
          ALL FEEDS ↗
        </Link>
      </div>

      {/* Channel Switcher Dropdown */}
      {isDropdownOpen && (
        <div className="absolute top-8 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-yellow-500/10 shadow-2xl">
          <div className="p-2 grid grid-cols-2 gap-1">
            {videoStreams.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setSelectedChannel(v);
                  setIsDropdownOpen(false);
                }}
                className={`text-[9px] font-bold text-left px-2 py-1.5 rounded transition-all flex justify-between items-center ${
                  selectedChannel.id === v.id ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{v.source}</span>
                {v.isLive && <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="panel-content p-2 flex-1 flex flex-col gap-2 relative min-h-0 overflow-hidden">
         {selectedChannel.isLive && (
           <div className="absolute top-4 left-4 z-20 bg-red-600 animate-pulse text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
               <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
               LIVE
           </div>
         )}
         
         {/* Video area */}
         <div className={`flex-1 ${selectedChannel.thumbnailColor} rounded border border-slate-700/50 relative overflow-hidden flex items-center justify-center min-h-0 group`}>
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-0"></div>
             
             {/* Info overlay */}
             <div className="z-10 flex flex-col items-center justify-end h-full pb-2 w-full">
                  <PlayCircle className="absolute inset-0 m-auto text-white/30 group-hover:text-yellow-500/80 w-10 h-10 z-20 cursor-pointer transition-all duration-300 transform group-hover:scale-110" />
                  <div className="w-full bg-blue-900/40 backdrop-blur-md border-t border-white/5 p-1.5 text-left shrink-0">
                      <div className="text-white font-bold text-[9px] tracking-wide flex items-center gap-1 uppercase line-clamp-1">{selectedChannel.title}</div>
                      <div className="text-yellow-500/80 font-black text-[8px] tracking-widest uppercase">{selectedChannel.category} {'//'} TACTICAL_FEED</div>
                  </div>
             </div>
         </div>
         
         <div className="flex justify-between items-center bg-slate-900/80 border border-slate-800 rounded p-1.5 text-slate-500 shrink-0 relative z-10">
             <Volume2 size={12} className="cursor-pointer hover:text-white" />
             <div className="w-1/2 h-0.5 bg-slate-800 rounded-full overflow-hidden">
                 <div className="w-2/3 h-full bg-yellow-500/50"></div>
             </div>
             <div className="flex text-[8px] gap-2 items-center font-bold tracking-widest">
                 <span className="text-slate-600 uppercase">1080p</span>
                 <Maximize2 size={11} className="cursor-pointer hover:text-white" />
             </div>
         </div>
      </div>
    </div>
  );
}
