'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X, RefreshCw, Newspaper, ExternalLink, Clock, Zap,
  TrendingUp, Filter, ChevronDown, Radio, AlertTriangle, Wifi
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  summary: string;
  source: string;
  icon: string;
  url: string;
  publishedAt: string;
  category: string;
  isBreaking: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

const CATEGORIES = ['ALL', 'GOLD', 'USD', 'FOREX', 'FED/RATES', 'ENERGY', 'METALS', 'EQUITIES', 'CRYPTO', 'MARKET'];

const CATEGORY_COLORS: Record<string, string> = {
  'GOLD': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25',
  'USD': 'text-green-400 bg-green-500/10 border-green-500/25',
  'FOREX': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25',
  'FED/RATES': 'text-red-400 bg-red-500/10 border-red-500/25',
  'ENERGY': 'text-orange-400 bg-orange-500/10 border-orange-500/25',
  'METALS': 'text-amber-400 bg-amber-500/10 border-amber-500/25',
  'EQUITIES': 'text-blue-400 bg-blue-500/10 border-blue-500/25',
  'CRYPTO': 'text-purple-400 bg-purple-500/10 border-purple-500/25',
  'MARKET': 'text-slate-400 bg-slate-500/10 border-slate-500/25',
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function LiveNewsPanel({ isOpen, onClose, embedded = false }: Props) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [viewingArticle, setViewingArticle] = useState<Article | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const url = selectedCategory === 'ALL'
        ? '/api/news/articles?limit=80'
        : `/api/news/articles?category=${selectedCategory}&limit=80`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.articles) {
        setArticles(data.articles);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch articles:', err);
    }
    setLoading(false);
  }, [selectedCategory]);

  useEffect(() => {
    if (isOpen || embedded) {
      fetchArticles();
    }
  }, [isOpen, embedded, fetchArticles]);

  // Auto-refresh every 90 seconds
  useEffect(() => {
    if ((isOpen || embedded) && autoRefresh) {
      intervalRef.current = setInterval(fetchArticles, 90000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen, embedded, autoRefresh, fetchArticles]);

  const filteredArticles = selectedCategory === 'ALL'
    ? articles
    : articles.filter(a => a.category === selectedCategory);

  const breakingCount = articles.filter(a => a.isBreaking).length;

  if (!isOpen && !embedded) return null;

  return (
    <>
      {/* Backdrop (only if not embedded) */}
      {!embedded && isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Internal Viewer Modal */}
      {viewingArticle && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-lg flex flex-col">
          {/* Header */}
          <div className="h-14 bg-slate-900 border-b border-yellow-500/20 flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                <span className="text-yellow-500 font-bold" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Au</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>AuScope Intel Viewer</h3>
                <p className="text-[10px] text-yellow-500/70 font-mono tracking-widest uppercase">Secure Sandbox Environment</p>
              </div>
            </div>
            <button 
              onClick={() => setViewingArticle(null)}
              className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-all border border-slate-700 hover:border-red-500/30"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Iframe Content */}
          <div className="flex-1 w-full bg-white relative">
            <iframe 
              src={viewingArticle.url} 
              className="w-full h-full border-none"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              title={viewingArticle.title}
            />
            {/* Fallback overlay in case iframe fails to load due to X-Frame-Options */}
            <div className="absolute bottom-4 right-4 max-w-sm bg-slate-900/90 backdrop-blur-md border border-yellow-500/20 p-4 rounded-xl shadow-2xl z-10 pointer-events-none">
              <h4 className="text-xs font-bold text-yellow-500 mb-1 uppercase tracking-wider">Source Information</h4>
              <p className="text-[10px] text-slate-400 leading-snug">
                You are viewing content from <strong>{viewingArticle.source}</strong> via AuScope's secure viewer. If the page refuses to load, they may have blocked external viewers.
              </p>
              <a 
                href={viewingArticle.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 hover:text-blue-300 pointer-events-auto"
              >
                Open in external browser <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Panel */}
      <div 
        className={`${embedded ? 'relative w-full h-full border-l border-slate-800/60' : `fixed top-0 right-0 h-full w-[440px] max-w-[100vw] z-50 transform transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} flex flex-col`}
        style={embedded ? {
          background: 'rgba(8,12,21,0.6)',
        } : {
          background: 'linear-gradient(180deg, rgba(8,12,21,0.98) 0%, rgba(10,14,23,0.99) 100%)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(245,196,81,0.08)',
          boxShadow: isOpen ? '-20px 0 60px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        {/* ═══ HEADER ═══ */}
        <div className="shrink-0 border-b border-slate-800/60" style={{ background: 'linear-gradient(135deg, rgba(245,196,81,0.04) 0%, transparent 50%)' }}>
          {/* Top bar */}
          <div className="h-[56px] flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-yellow-500/20 flex items-center justify-center">
                  <Newspaper size={16} className="text-yellow-500" />
                </div>
                {/* Live pulse dot */}
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#080c15] animate-pulse" />
              </div>
              <div>
                <h2 className="text-[13px] font-black tracking-[0.12em] text-slate-100 uppercase" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                  AuScope Wire
                </h2>
                <div className="flex items-center gap-1.5">
                  <Wifi size={8} className="text-emerald-500" />
                  <p className="text-[9px] text-emerald-500/80 font-bold tracking-[0.15em] uppercase">
                    Streaming {articles.length} sources
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-1.5 rounded-lg border transition-all text-[10px] font-bold ${autoRefresh
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-slate-800/50 border-slate-700 text-slate-500'
                  }`}
                title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              >
                <Radio size={14} />
              </button>
              <button
                onClick={fetchArticles}
                disabled={loading}
                className="p-1.5 rounded-lg border border-slate-700/60 bg-slate-800/40 text-slate-400 hover:text-white hover:border-slate-600 transition-all disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
              {!embedded && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg border border-slate-700/60 bg-slate-800/40 text-slate-400 hover:text-white hover:border-red-500/40 hover:bg-red-500/10 transition-all"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Stats bar */}
          <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
            {breakingCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/25 rounded text-[9px] font-bold text-red-400 tracking-wider uppercase animate-pulse">
                <AlertTriangle size={10} /> {breakingCount} Breaking
              </div>
            )}
            <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-800/60 border border-slate-700/40 rounded text-[9px] font-mono text-slate-500">
              <Clock size={9} />
              {lastUpdated ? `Updated ${timeAgo(lastUpdated.toISOString())}` : 'Loading...'}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-bold tracking-wider uppercase transition-all ${showFilters
                  ? 'bg-yellow-500/10 border-yellow-500/25 text-yellow-500'
                  : 'bg-slate-800/60 border-slate-700/40 text-slate-500 hover:text-slate-300'
                }`}
            >
              <Filter size={9} /> Filter <ChevronDown size={8} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Category filter chips */}
          {showFilters && (
            <div className="px-4 pb-3 flex flex-wrap gap-1.5 animate-in slide-in-from-top-2 duration-200">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wider uppercase border transition-all ${selectedCategory === cat
                      ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400 shadow-[0_0_8px_rgba(245,196,81,0.1)]'
                      : 'bg-slate-800/40 border-slate-700/30 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ═══ ARTICLE FEED ═══ */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Loading skeleton */}
          {loading && articles.length === 0 && (
            <div className="p-4 flex flex-col gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-slate-800/30 rounded-lg p-4 border border-slate-800/40">
                  <div className="h-2 bg-slate-700/50 rounded w-16 mb-3" />
                  <div className="h-3 bg-slate-700/50 rounded w-full mb-2" />
                  <div className="h-3 bg-slate-700/50 rounded w-3/4 mb-3" />
                  <div className="h-2 bg-slate-700/50 rounded w-full mb-1" />
                  <div className="h-2 bg-slate-700/50 rounded w-2/3" />
                </div>
              ))}
            </div>
          )}

          {/* Articles */}
          <div className="p-3 flex flex-col gap-2">
            {filteredArticles.map((article, idx) => {
              const catColor = CATEGORY_COLORS[article.category] || CATEGORY_COLORS['MARKET'];
              return (
                <button
                  key={article.id + idx}
                  onClick={() => setViewingArticle(article)}
                  className="group block w-full text-left rounded-lg border border-slate-800/60 hover:border-slate-700/80 transition-all duration-200 overflow-hidden"
                  style={{
                    background: article.isBreaking
                      ? 'linear-gradient(135deg, rgba(239,68,68,0.04) 0%, rgba(10,14,23,0.8) 40%)'
                      : 'rgba(15,19,28,0.6)',
                  }}
                >
                  {/* Breaking banner */}
                  {article.isBreaking && (
                    <div className="h-[2px] w-full bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />
                  )}

                  <div className="p-3.5">
                    {/* Meta row */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase border ${catColor}`}>
                          {article.category}
                        </span>
                        {article.isBreaking && (
                          <span className="flex items-center gap-0.5 text-[8px] text-red-400 font-black tracking-widest uppercase animate-pulse">
                            <Zap size={8} /> BREAKING
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-600 font-mono flex items-center gap-1">
                        <Clock size={8} /> {timeAgo(article.publishedAt)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-[13px] font-bold text-slate-200 leading-snug mb-1.5 group-hover:text-yellow-400 transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    {/* Summary */}
                    {article.summary && (
                      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mb-2.5">
                        {article.summary}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/40">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{article.icon}</span>
                        <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                          {article.source}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-[9px] font-bold text-slate-600 group-hover:text-yellow-500 transition-colors tracking-wider uppercase">
                        Read <ExternalLink size={9} />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Empty state */}
            {!loading && filteredArticles.length === 0 && (
              <div className="text-center py-16 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center">
                  <Newspaper size={20} className="text-slate-600" />
                </div>
                <p className="text-slate-500 text-xs font-bold tracking-wider uppercase">No articles found</p>
                <p className="text-slate-600 text-[10px]">Try a different category filter</p>
              </div>
            )}
          </div>
        </div>

        {/* ═══ FOOTER ═══ */}
        <div className="shrink-0 px-4 py-2.5 border-t border-slate-800/50 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-[9px] text-slate-600 font-bold tracking-wider uppercase">
              {autoRefresh ? 'Auto-refresh: 90s' : 'Paused'}
            </span>
          </div>
          <span className="text-[9px] text-slate-700 font-mono">
            {filteredArticles.length} articles
          </span>
        </div>
      </div>
    </>
  );
}
