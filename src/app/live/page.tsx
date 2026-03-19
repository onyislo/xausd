import React from 'react';
import Link from 'next/link';
import { videoStreams } from '@/lib/videoData';
import { PlayCircle, Users } from 'lucide-react';

export default function LiveStreamsPage() {
  return (
    <main className="min-h-screen bg-[#0a0e17] text-slate-200 font-sans p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 border-b border-slate-800 pb-6 flex justify-between items-end">
          <div>
            <Link href="/" className="text-yellow-500 hover:text-yellow-400 text-sm font-bold tracking-widest uppercase flex items-center gap-2 mb-2 transition-colors">
              <span>←</span> BACK TO TERMINAL
            </Link>
            <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 uppercase">
              Tactical Video Feeds
            </h1>
            <p className="text-slate-500 text-sm tracking-widest uppercase mt-1">Multi-point Intelligence Surveillance</p>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videoStreams.map((v) => (
            <div key={v.id} className="group flex flex-col bg-slate-900/40 border border-slate-800 rounded-lg overflow-hidden transition-all duration-300 hover:border-yellow-500/40 hover:shadow-[0_0_15px_rgba(245,196,81,0.1)]">
              {/* Tactical Video Header */}
              <div className="px-3 py-1.5 bg-slate-800/30 border-b border-slate-800/50 flex justify-between items-center">
                <span className="text-[9px] text-yellow-500/80 font-bold tracking-widest uppercase">[{v.source}]</span>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${v.isLive ? 'bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'bg-slate-600'}`}></div>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">{v.isLive ? 'LIVE' : 'OFFLINE'}</span>
                </div>
              </div>

              {/* Video Preview */}
              <div className={`aspect-video ${v.thumbnailColor} relative overflow-hidden flex items-center justify-center border-b border-slate-800/50 group-hover:opacity-80 transition-opacity`}>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
                
                {/* Viewers Badge */}
                <div className="absolute top-2 right-2 z-20 bg-black/40 backdrop-blur-md border border-white/5 px-1.5 py-0.5 rounded flex items-center gap-1 text-[8px] text-slate-300 font-mono">
                  <Users size={8} className="text-blue-400" /> {v.viewers}
                </div>

                <PlayCircle className="text-white/20 group-hover:text-yellow-500/80 transition-all duration-300 transform group-hover:scale-110" size={32} />
              </div>

              {/* Feed Meta */}
              <div className="p-3 flex-1 flex flex-col justify-between gap-3">
                <div>
                   <span className="text-[7px] text-slate-600 font-black tracking-[0.2em] uppercase mb-1 block">{v.category}</span>
                   <h3 className="text-xs font-bold text-slate-200 leading-tight group-hover:text-yellow-400 transition-colors line-clamp-2 uppercase tracking-wide">{v.title}</h3>
                </div>

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-800/30">
                  <span className="text-[8px] text-slate-500 font-mono uppercase">ID: {v.id}</span>
                  <button className="text-[9px] font-black tracking-widest text-yellow-500 hover:text-white transition-all bg-yellow-500/5 hover:bg-yellow-500 px-3 py-1 rounded border border-yellow-500/20 hover:border-yellow-500 uppercase">
                    WATCH
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
