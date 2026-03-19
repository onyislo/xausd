'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { newsData, NewsItem } from '@/lib/newsData';

export default function NewsPage() {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  return (
    <main className="min-h-screen bg-[#0a0e17] text-slate-200 font-sans p-6 md:p-12 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <Link href="/" className="text-yellow-500 hover:text-yellow-400 text-sm font-bold tracking-widest uppercase flex items-center gap-2 mb-2 transition-colors">
              <span>←</span> BACK TO TERMINAL
            </Link>
            <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 uppercase">
              Global Intelligence Feed
            </h1>
            <p className="text-slate-500 text-sm tracking-widest uppercase mt-1">Real-time Geopolitical & Market Analysis</p>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 tracking-widest uppercase">Encryption Status</span>
              <span className="text-green-500 font-mono text-xs font-bold">AES-256 SECURE</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
          </div>
        </header>

        {/* Filters/Stats Bar */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2 flex items-center gap-3">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Total Articles</span>
            <span className="text-yellow-500 font-mono font-bold">{newsData.length}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-red-500"></div>
             <span className="text-[10px] text-slate-500 uppercase font-bold">High Impact</span>
             <span className="text-red-500 font-mono font-bold">{newsData.filter(n => n.impact === 'HIGH').length}</span>
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {newsData.map((news) => (
            <div 
              key={news.id} 
              className={`group flex flex-col bg-slate-900/40 border transition-all duration-300 hover:shadow-[0_0_15px_rgba(245,196,81,0.1)] rounded-lg overflow-hidden ${
                news.impact === 'HIGH' ? 'border-red-500/30 hover:border-red-500/60' : 
                news.impact === 'MED' ? 'border-yellow-500/30 hover:border-yellow-500/60' : 
                'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div className="px-3 py-2 bg-slate-800/20 border-b border-slate-800/50 flex justify-between items-center">
                <span className={`text-[9px] font-bold tracking-widest uppercase ${
                  news.impact === 'HIGH' ? 'text-red-400' : 
                  news.impact === 'MED' ? 'text-yellow-500' : 
                  'text-green-500'
                }`}>
                  {news.impact}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">{news.timestamp.split(' ')[0]}</span>
              </div>

              {/* Card Content */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="mb-3">
                  <span className="text-[8px] text-slate-600 font-bold tracking-widest uppercase bg-slate-800 px-1.5 py-0.5 rounded mb-2 inline-block">
                    {news.category}
                  </span>
                  <h2 className="text-sm font-bold text-slate-100 leading-tight group-hover:text-yellow-400 transition-colors">
                    {news.title}
                  </h2>
                </div>
                
                <p className="text-[11px] text-slate-400 leading-snug mb-4 flex-1 line-clamp-3">
                  {news.content}
                </p>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-800/50 flex justify-between items-center text-[10px]">
                  <div className="flex flex-col">
                    <span className="text-slate-600 uppercase font-bold tracking-tighter text-[8px]">Source</span>
                    <span className="text-slate-400 font-bold truncate max-w-[80px]">{news.source}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedNews(news)}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded text-[9px] uppercase font-bold tracking-widest transition-all"
                  >
                    DETAILS
                  </button>
                </div>
              </div>
              
              {/* Decorative accent */}
              <div className={`h-0.5 w-full ${
                news.impact === 'HIGH' ? 'bg-red-500/50' : 
                news.impact === 'MED' ? 'bg-yellow-500/50' : 
                'bg-green-500/50'
              }`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Details Modal */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-2xl w-full bg-slate-900 border ${
            selectedNews.impact === 'HIGH' ? 'border-red-500/50' : 
            selectedNews.impact === 'MED' ? 'border-yellow-500/50' : 
            'border-green-500/50'
          } rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`}>
            <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center">
              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                Intelligence Briefing / {selectedNews.id}
              </span>
              <button 
                onClick={() => setSelectedNews(null)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                  selectedNews.impact === 'HIGH' ? 'bg-red-500/10 text-red-500 border border-red-500/30' : 
                  selectedNews.impact === 'MED' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' : 
                  'bg-green-500/10 text-green-500 border border-green-500/30'
                }`}>
                  {selectedNews.impact} IMPACT
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{selectedNews.timestamp}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-100 mb-6 leading-tight uppercase">
                {selectedNews.title}
              </h2>
              <p className="text-slate-300 leading-relaxed mb-8">
                {selectedNews.content}
              </p>
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800">
                <div>
                  <span className="block text-[10px] text-slate-600 uppercase font-bold tracking-widest mb-1">Source Analysis</span>
                  <span className="text-slate-200 font-bold">{selectedNews.source}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-600 uppercase font-bold tracking-widest mb-1">Category</span>
                  <span className="text-slate-200 font-bold">{selectedNews.category}</span>
                </div>
              </div>
            </div>
            <div className="px-8 py-4 bg-slate-800/30 border-t border-slate-800/50 flex justify-end">
              <button 
                onClick={() => setSelectedNews(null)}
                className="px-6 py-2 bg-slate-100 hover:bg-white text-slate-900 rounded font-bold text-xs uppercase tracking-widest transition-all"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer Decoration */}
      <footer className="mt-20 border-t border-slate-800 pt-8 text-center">
        <div className="flex justify-center gap-8 text-[10px] text-slate-600 tracking-[0.2em] uppercase font-bold">
          <span>Terminal v2.4.1</span>
          <span>•</span>
          <span>System Latency: 14ms</span>
          <span>•</span>
          <span>Global Node: HK-4</span>
        </div>
      </footer>
    </main>
  );
}
