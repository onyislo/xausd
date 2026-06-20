'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  PlayCircle, Users, Activity, RefreshCw, Radio, Wifi, WifiOff,
  ExternalLink, Newspaper, TrendingUp, Zap, Clock, Filter,
  ChevronDown, Volume2, Eye, Globe, AlertTriangle, BarChart3
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import LiveNewsPanel from '@/components/live/LiveNewsPanel';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface VideoStream {
  id: string;
  title: string;
  category: string;
  is_live: boolean;
  viewers: string;
  source: string;
  video_url?: string;
  thumbnail_color: string;
}

interface TickerItem {
  title: string;
  source: string;
  isBreaking: boolean;
}

const CATEGORY_BADGE: Record<string, string> = {
  'GOLD/USD': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  'USD/DXY': 'text-green-400 bg-green-500/10 border-green-500/20',
  'FOREX': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  'MARKET': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'ENERGY': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  'CENTRAL BANK': 'text-red-400 bg-red-500/10 border-red-500/20',
  'METALS': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'EQUITIES': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  'CRYPTO': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

const SOURCE_COLORS: Record<string, string> = {
  'KITCO NEWS': 'from-yellow-600/30 to-amber-800/20',
  'CNBC TV': 'from-blue-600/30 to-blue-900/20',
  'BLOOMBERG TV': 'from-indigo-600/30 to-indigo-900/20',
  'STANSBERRY': 'from-amber-600/30 to-amber-900/20',
  'PETER SCHIFF': 'from-yellow-600/30 to-yellow-900/20',
  'FOREX SIGNALS': 'from-emerald-600/30 to-emerald-900/20',
  'CNBC': 'from-blue-500/30 to-blue-800/20',
  'YAHOO FINANCE': 'from-purple-500/30 to-purple-800/20',
  'INVESTING.COM': 'from-orange-500/30 to-orange-800/20',
  'FX EMPIRE': 'from-teal-500/30 to-teal-800/20',
  'KITCO': 'from-yellow-500/30 to-yellow-800/20',
  'REUTERS': 'from-sky-500/30 to-sky-800/20',
  'MARKETWATCH': 'from-green-500/30 to-green-800/20',
  'DAILYFX': 'from-rose-500/30 to-rose-800/20',
};

function formatViewers(v: string): string {
  const n = parseInt(v);
  if (isNaN(n)) return v;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
}

export default function LiveStreamsPage() {
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [videoFeeds, setVideoFeeds] = useState<VideoStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');
  const [ticker, setTicker] = useState<TickerItem[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [viewingVideo, setViewingVideo] = useState<VideoStream | null>(null);
  const [isPipMode, setIsPipMode] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Fetch video feeds from sync API
  const fetchFeeds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/news/sync');
      const result = await res.json();
      if (result.success && result.data && result.data.length > 0) {
        setVideoFeeds(result.data);
        setConnectionStatus('connected');
        setLastSync(new Date());
        // Extract for ticker
        setTicker(result.data.slice(0, 20).map((d: any) => ({
          title: d.title,
          source: d.source,
          isBreaking: d.is_live,
        })));
      } else {
        // Fallback: load from Supabase
        const { data } = await supabase
          .from('video_feeds')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(60);
        if (data && data.length > 0) {
          setVideoFeeds(data);
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('error');
        }
      }
    } catch (err) {
      console.error('Feed fetch error:', err);
      setConnectionStatus('error');
      // Try Supabase fallback
      const { data } = await supabase.from('video_feeds').select('*').order('created_at', { ascending: false }).limit(60);
      if (data) setVideoFeeds(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFeeds();
    // Realtime subscription
    const channel = supabase.channel('public:video_feeds_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'video_feeds' }, () => fetchFeeds())
      .subscribe();
    // Auto-refresh every 3 minutes
    const interval = setInterval(fetchFeeds, 180000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchFeeds]);

  const categories = ['ALL', ...Array.from(new Set(videoFeeds.map(v => v.category)))];

  const filteredFeeds = selectedCategory === 'ALL'
    ? videoFeeds
    : videoFeeds.filter(v => v.category === selectedCategory);

  const liveCount = videoFeeds.filter(v => v.is_live).length;
  const sourceCount = new Set(videoFeeds.map(v => v.source)).size;

  return (
    <main className="terminal-layout bg-[#060a12] text-slate-200 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        {/* ═══════════════════════════════════════════════ */}
        {/* HEADER                                         */}
        {/* ═══════════════════════════════════════════════ */}
        <header className="shrink-0 border-b border-slate-800/50" style={{ background: 'linear-gradient(180deg, rgba(15,20,32,0.95) 0%, rgba(8,12,20,0.95) 100%)' }}>
          {/* Top bar */}
          <div className="h-[56px] flex items-center justify-between px-5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                  <Radio size={20} className="text-red-500" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-[#060a12] animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
              </div>
              <div>
                <h1 className="text-[15px] font-black tracking-[0.12em] text-slate-100 uppercase" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                  Live Command Center
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-1">
                    {connectionStatus === 'connected' ? (
                      <Wifi size={9} className="text-emerald-500" />
                    ) : connectionStatus === 'connecting' ? (
                      <RefreshCw size={9} className="text-yellow-500 animate-spin" />
                    ) : (
                      <WifiOff size={9} className="text-red-500" />
                    )}
                    <span className={`text-[9px] font-bold tracking-[0.15em] uppercase ${
                      connectionStatus === 'connected' ? 'text-emerald-500/80' : connectionStatus === 'connecting' ? 'text-yellow-500/80' : 'text-red-500/80'
                    }`}>
                      {connectionStatus === 'connected' ? `${sourceCount} Sources Connected` : connectionStatus === 'connecting' ? 'Connecting...' : 'Reconnecting...'}
                    </span>
                  </div>
                  <span className="text-slate-800">•</span>
                  <span className="text-[9px] text-slate-600 font-mono">
                    {lastSync ? `${Math.floor((Date.now() - lastSync.getTime()) / 1000)}s ago` : '...'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-2.5">
              {/* Live counter badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-500/15 bg-red-500/5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                <span className="text-[10px] font-black tracking-widest text-red-400 uppercase">{liveCount} Live</span>
              </div>

              {/* Sync button */}
              <button
                onClick={fetchFeeds}
                disabled={loading}
                className="p-2 rounded-lg border border-slate-700/50 bg-slate-800/30 text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-700/30 transition-all disabled:opacity-50"
                title="Refresh feeds"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>

              {/* News panel trigger (Mobile only) */}
              <button
                onClick={() => setIsNewsOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg border border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-amber-500/5 hover:from-yellow-500/20 hover:to-amber-500/10 hover:border-yellow-500/40 transition-all group"
              >
                <Newspaper size={14} className="text-yellow-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black tracking-widest text-yellow-500 uppercase">News Wire</span>
                <Activity size={11} className="text-yellow-500/60 animate-pulse" />
              </button>
            </div>
          </div>

          {/* ═══ BREAKING NEWS TICKER ═══ */}
          {ticker.length > 0 && (
            <div className="h-[28px] border-t border-slate-800/40 bg-slate-900/30 flex items-center overflow-hidden relative">
              <div className="shrink-0 px-3 flex items-center gap-1.5 bg-red-600/90 h-full z-10">
                <Zap size={10} className="text-white" />
                <span className="text-[9px] font-black text-white tracking-widest uppercase">LIVE</span>
              </div>
              <div className="flex-1 overflow-hidden relative">
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-900/80 to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-900/80 to-transparent z-10" />
                <div ref={tickerRef} className="flex items-center gap-6 animate-scroll-left whitespace-nowrap px-4">
                  {ticker.concat(ticker).map((item, i) => (
                    <span key={i} className="flex items-center gap-2 text-[10px]">
                      <span className="text-yellow-500/60 font-bold uppercase tracking-wider">{item.source}</span>
                      <span className="text-slate-400 font-medium">{item.title}</span>
                      <span className="text-slate-700">│</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </header>

        {/* ═══════════════════════════════════════════════ */}
        {/* MAIN LAYOUT (Feeds + Embedded News)            */}
        {/* ═══════════════════════════════════════════════ */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Side: Video Feeds */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-950/20">
            {/* FILTER BAR */}
            <div className="shrink-0 px-5 py-3 border-b border-slate-800/30 bg-slate-900/20 flex items-center gap-3 overflow-x-auto custom-scrollbar">
              <Filter size={12} className="text-slate-600 shrink-0" />
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 px-3 py-1 rounded-md text-[9px] font-bold tracking-wider uppercase border transition-all ${
                    selectedCategory === cat
                      ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400 shadow-[0_0_10px_rgba(245,196,81,0.08)]'
                      : 'bg-slate-800/30 border-slate-800/50 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <div className="ml-auto shrink-0 text-[10px] text-slate-600 font-mono">
                {filteredFeeds.length} feeds
              </div>
            </div>

            {/* STATS BAR */}
            <div className="shrink-0 px-5 py-2.5 border-b border-slate-800/20 bg-slate-900/10 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-800/30 border border-slate-800/40">
                <BarChart3 size={11} className="text-blue-400" />
                <span className="text-[9px] text-slate-500 font-bold tracking-wider uppercase">Total Feeds</span>
                <span className="text-[10px] text-blue-400 font-mono font-bold">{videoFeeds.length}</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-800/30 border border-slate-800/40">
                <Globe size={11} className="text-emerald-400" />
                <span className="text-[9px] text-slate-500 font-bold tracking-wider uppercase">Sources</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">{sourceCount}</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-red-500/5 border border-red-500/15">
                <Radio size={11} className="text-red-400" />
                <span className="text-[9px] text-slate-500 font-bold tracking-wider uppercase">Live Now</span>
                <span className="text-[10px] text-red-400 font-mono font-bold">{liveCount}</span>
              </div>
            </div>

            {/* VIDEO FEED GRID */}
            <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ background: 'radial-gradient(ellipse at top center, rgba(245,196,81,0.015) 0%, transparent 60%)' }}>
              <div className="p-5">
                {/* Loading skeleton */}
                {loading && videoFeeds.length === 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="animate-pulse rounded-xl overflow-hidden border border-slate-800/40">
                        <div className="h-6 bg-slate-800/30" />
                        <div className="aspect-video bg-slate-800/20" />
                        <div className="p-3">
                          <div className="h-2 bg-slate-800/30 rounded w-12 mb-2" />
                          <div className="h-3 bg-slate-800/30 rounded w-full mb-1" />
                          <div className="h-3 bg-slate-800/30 rounded w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredFeeds.map((v) => {
                    const catBadge = CATEGORY_BADGE[v.category] || 'text-slate-400 bg-slate-500/10 border-slate-500/20';
                    const sourceGrad = SOURCE_COLORS[v.source] || 'from-slate-600/30 to-slate-800/20';
                    const isHovered = hoveredCard === v.id;

                    return (
                      <div
                        key={v.id}
                        className="group flex flex-col rounded-xl overflow-hidden border border-slate-800/50 transition-all duration-300 hover:border-slate-700/70 hover:shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
                        style={{
                          background: 'rgba(12,16,26,0.7)',
                        }}
                        onMouseEnter={() => setHoveredCard(v.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        {/* Card Header */}
                        <div className="px-3 py-1.5 border-b border-slate-800/40 flex justify-between items-center bg-slate-900/30">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] text-slate-500 font-black tracking-[0.15em] uppercase">[{v.source}]</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {v.is_live && (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_4px_rgba(239,68,68,0.6)]" />
                                <span className="text-[7px] text-red-400 font-black tracking-wider uppercase">LIVE</span>
                              </div>
                            )}
                            {!v.is_live && (
                              <span className="text-[7px] text-slate-600 font-bold tracking-wider uppercase">VOD</span>
                            )}
                          </div>
                        </div>

                        {/* Video Preview / Thumbnail */}
                        <button 
                          onClick={() => setViewingVideo(v)}
                          className={`w-full aspect-video relative overflow-hidden group-hover:brightness-110 transition-all duration-300 block text-left`}
                        >
                          {/* Gradient background simulating channel identity */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${sourceGrad}`} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                          {/* Scanline effect */}
                          <div className="absolute inset-0 opacity-[0.03]" style={{
                            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
                          }} />

                          {/* Source watermark */}
                          <div className="absolute top-2 left-2 z-10 text-[8px] text-white/20 font-black tracking-widest uppercase">
                            {v.source}
                          </div>

                          {/* Viewers */}
                          <div className="absolute top-2 right-2 z-10 bg-black/50 backdrop-blur-md border border-white/5 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Eye size={8} className="text-blue-400" />
                            <span className="text-[8px] text-slate-300 font-mono font-bold">{formatViewers(v.viewers)}</span>
                          </div>

                          {/* Play button */}
                          <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                              isHovered
                                ? 'bg-yellow-500/90 scale-110 shadow-[0_0_20px_rgba(245,196,81,0.3)]'
                                : 'bg-white/10 backdrop-blur-sm border border-white/10'
                            }`}>
                              <PlayCircle size={22} className={`transition-all duration-300 ${isHovered ? 'text-black' : 'text-white/40'}`} />
                            </div>
                          </div>

                          {/* Bottom info overlay */}
                          <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm border-t border-white/5 px-2.5 py-1.5 flex items-center justify-between">
                            <span className={`px-1.5 py-0.5 rounded text-[7px] font-bold tracking-wider uppercase border ${catBadge}`}>
                              {v.category}
                            </span>
                            {v.is_live && (
                              <span className="text-[8px] text-red-400 font-mono flex items-center gap-1">
                                <Volume2 size={8} className="animate-pulse" /> ON AIR
                              </span>
                            )}
                          </div>
                        </button>

                        {/* Feed Meta */}
                        <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                          <h3 className="text-[11px] font-bold text-slate-300 leading-snug group-hover:text-yellow-400 transition-colors line-clamp-2 uppercase tracking-wide">
                            {v.title}
                          </h3>

                          <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-800/30">
                            <span className="text-[8px] text-slate-600 font-mono uppercase">
                              ID: {v.id ? v.id.substring(0, 8) : 'LIVE-SYNC'}
                            </span>
                            {v.video_url ? (
                              <button
                                onClick={() => setViewingVideo(v)}
                                className="flex items-center gap-1 text-[9px] font-black tracking-widest uppercase transition-all px-3 py-1 rounded border text-yellow-500 bg-yellow-500/5 border-yellow-500/20 hover:bg-yellow-500 hover:text-black hover:border-yellow-500"
                              >
                                WATCH <PlayCircle size={8} />
                              </button>
                            ) : (
                              <button className="text-[9px] font-black tracking-widest text-slate-600 bg-slate-800/50 px-3 py-1 rounded border border-slate-700/50 uppercase cursor-not-allowed">
                                OFFLINE
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Empty state */}
                {!loading && filteredFeeds.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-center">
                      <Radio size={28} className="text-slate-600" />
                    </div>
                    <p className="text-slate-500 text-sm font-bold tracking-wider uppercase">No feeds found</p>
                    <p className="text-slate-600 text-xs">Try selecting a different category or refreshing</p>
                    <button
                      onClick={fetchFeeds}
                      className="mt-2 px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold tracking-wider uppercase hover:bg-yellow-500/20 transition-all"
                    >
                      Refresh Feeds
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* STATUS BAR FOOTER */}
            <footer className="shrink-0 h-[30px] border-t border-slate-800/40 bg-slate-900/50 flex items-center justify-between px-5 text-[9px] text-slate-600 font-mono">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500' : connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
                  {connectionStatus.toUpperCase()}
                </span>
                <span className="text-slate-800">│</span>
                <span>AUTO-SYNC: 3M</span>
                <span className="text-slate-800">│</span>
                <span>FEEDS: {videoFeeds.length}</span>
              </div>
              <div className="flex items-center gap-4">
                <span>PROTOCOL: RSS/ATOM</span>
                <span className="text-slate-800">│</span>
                <span>v3.2.0</span>
              </div>
            </footer>
          </div>

          {/* Right Side: Embedded News Panel */}
          <div className="hidden lg:block w-[380px] xl:w-[440px] shrink-0 border-l border-slate-800/60 relative">
            <LiveNewsPanel isOpen={true} onClose={() => {}} embedded={true} />
          </div>
          
          {/* Mobile Overlay News Panel */}
          <div className="lg:hidden">
            <LiveNewsPanel isOpen={isNewsOpen} onClose={() => setIsNewsOpen(false)} embedded={false} />
          </div>
        </div>
      </div>

      {/* ═══ VIDEO VIEWER MODAL / PIP ═══ */}
      {viewingVideo && (
        <div className={
          isPipMode 
            ? "fixed bottom-6 right-6 z-[9999] w-[360px] aspect-video bg-black rounded-xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col hover:scale-105 transition-all duration-300 group"
            : "fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8"
        }>
          <div className={isPipMode ? "w-full h-full flex flex-col relative" : "w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative flex flex-col"}>
            
            {/* Header / Controls */}
            <div className={`bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3 shrink-0 transition-all ${isPipMode ? 'absolute top-0 left-0 right-0 z-20 h-8 opacity-0 group-hover:opacity-100 bg-black/80 backdrop-blur-md border-none' : 'h-12'}`}>
              <div className="flex items-center gap-2 overflow-hidden pr-2">
                {!isPipMode && (
                  <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center shrink-0">
                    <PlayCircle size={14} className="text-slate-400" />
                  </div>
                )}
                <div className="truncate">
                  <h3 className={`font-bold text-slate-200 uppercase tracking-wider truncate ${isPipMode ? 'text-[9px]' : 'text-xs'}`}>{viewingVideo.title}</h3>
                  {!isPipMode && <p className="text-[9px] text-slate-500 font-mono">{viewingVideo.source}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button 
                  onClick={() => setIsPipMode(!isPipMode)}
                  className={`p-1.5 rounded-lg text-slate-400 hover:text-white transition-all ${isPipMode ? 'bg-transparent hover:bg-slate-700/50' : 'bg-slate-800 border border-slate-700 hover:border-blue-500/30 hover:bg-blue-500/20'}`}
                  title={isPipMode ? "Maximize" : "Picture-in-Picture"}
                >
                  {isPipMode ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
                  )}
                </button>
                <button 
                  onClick={() => setViewingVideo(null)}
                  className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-red-500/20 transition-all ${isPipMode ? 'bg-transparent' : 'bg-slate-800 border border-slate-700 hover:border-red-500/30'}`}
                  title="Close"
                >
                  <svg width={isPipMode ? 14 : 16} height={isPipMode ? 14 : 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
            </div>

            {/* Video iframe */}
            <div className="flex-1 w-full bg-black relative z-10">
              <iframe
                src={viewingVideo.video_url?.includes('youtube.com/watch?v=') ? viewingVideo.video_url.replace('watch?v=', 'embed/') : viewingVideo.video_url}
                className="w-full h-full border-none pointer-events-auto"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Custom animation for ticker */}
      <style jsx global>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-left {
          animation: scroll-left 60s linear infinite;
        }
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }
      `}</style>
    </main>
  );
}
