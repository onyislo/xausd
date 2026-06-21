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
import PriceCard from '@/components/realtime/PriceCard';
import CorrelationCard from '@/components/realtime/CorrelationCard';
import { usePriceStore } from '@/hooks/usePriceStore';

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

export default function LiveStreamsPage() {
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [videoFeeds, setVideoFeeds] = useState<VideoStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');
  const [ticker, setTicker] = useState<TickerItem[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // 📊 Real-time Price Data
  const { 
    prices, 
    correlation, 
    connectionStatus: priceConnectionStatus, 
    goldPrice, 
    usdIndex,
    eurUsd,
    getFormattedChange 
  } = usePriceStore();

  // Fetch video feeds
  const fetchFeeds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/news/sync');
      const result = await res.json();
      if (result.success && result.data && result.data.length > 0) {
        setVideoFeeds(result.data);
        setConnectionStatus('connected');
        setLastSync(new Date());
        setTicker(result.data.slice(0, 20).map((d: any) => ({
          title: d.title,
          source: d.source,
          isBreaking: d.is_live,
        })));
      } else {
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
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFeeds();
    const channel = supabase.channel('public:video_feeds_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'video_feeds' }, () => fetchFeeds())
      .subscribe();
    const interval = setInterval(fetchFeeds, 180000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchFeeds]);

  const categories = ['ALL', ...Array.from(new Set(videoFeeds.map(v => v.category)))];
  const filteredFeeds = selectedCategory === 'ALL' ? videoFeeds : videoFeeds.filter(v => v.category === selectedCategory);
  const liveCount = videoFeeds.filter(v => v.is_live).length;
  const sourceCount = new Set(videoFeeds.map(v => v.source)).size;

  return (
    <main className="terminal-layout bg-[#060a12] text-slate-200 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="shrink-0 border-b border-slate-800/50" style={{ background: 'linear-gradient(180deg, rgba(15,20,32,0.95) 0%, rgba(8,12,20,0.95) 100%)' }}>
          <div className="h-[56px] flex items-center justify-between px-5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/20 flex items-center justify-center">
                  <Radio size={20} className="text-red-500" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-[#060a12] animate-pulse" />
              </div>
              <div>
                <h1 className="text-[15px] font-black tracking-[0.12em] text-slate-100 uppercase">
                  Live Command Center
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Wifi size={9} className="text-emerald-500" />
                  <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-emerald-500/80">
                    {sourceCount} Sources Connected
                  </span>
                </div>
              </div>
            </div>

            {/* Real-time Price Ticker */}
            <div className="flex items-center gap-2">
              {goldPrice && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                  <span className="text-xs font-bold text-yellow-400">XAU/USD</span>
                  <span className="text-sm font-mono text-yellow-300">${goldPrice.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  <span className={`text-xs ${goldPrice.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {goldPrice.change >= 0 ? '+' : ''}{goldPrice.changePercent.toFixed(2)}%
                  </span>
                </div>
              )}

              {usdIndex && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold text-green-400">DXY</span>
                  <span className="text-sm font-mono text-green-300">{usdIndex.price.toFixed(3)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Breaking News Ticker */}
          {ticker.length > 0 && (
            <div className="h-[28px] border-t border-slate-800/40 bg-slate-900/30 flex items-center overflow-hidden relative">
              <div className="shrink-0 px-3 flex items-center gap-1.5 bg-red-600/90 h-full z-10">
                <Zap size={10} className="text-white" />
                <span className="text-[9px] font-black text-white tracking-widest uppercase">LIVE</span>
              </div>
              <div className="flex-1 overflow-hidden relative">
                <div className="flex items-center gap-6 animate-scroll-left whitespace-nowrap px-4">
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

        {/* MAIN CONTENT */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0 bg-slate-950/20">
            
            {/* Filter Bar */}
            <div className="shrink-0 px-5 py-3 border-b border-slate-800/30 bg-slate-900/20 flex items-center gap-3 overflow-x-auto">
              <Filter size={12} className="text-slate-600 shrink-0" />
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 px-3 py-1 rounded-md text-[9px] font-bold tracking-wider uppercase border transition-all ${
                    selectedCategory === cat
                      ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400'
                      : 'bg-slate-800/30 border-slate-800/50 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Video Feed Grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredFeeds.map((v) => (
                    <div key={v.id} className="group flex flex-col rounded-xl overflow-hidden border border-slate-800/50 bg-slate-900/30">
                      <div className="px-3 py-1.5 border-b border-slate-800/40 flex justify-between items-center">
                        <span className="text-[8px] text-slate-500 font-black uppercase">[{v.source}]</span>
                        {v.is_live && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[7px] text-red-400 font-black uppercase">LIVE</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="w-full aspect-video relative overflow-hidden bg-gradient-to-br from-slate-600/30 to-slate-800/20">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PlayCircle size={22} className="text-white/40" />
                        </div>
                      </div>
                      
                      <div className="p-3">
                        <h3 className="text-[11px] font-bold text-slate-300 line-clamp-2 uppercase">
                          {v.title}
                        </h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[8px] text-slate-600 font-mono">ID: {v.id?.substring(0, 8)}</span>
                          <button className="text-[9px] font-black text-yellow-500 bg-yellow-500/5 px-3 py-1 rounded border border-yellow-500/20 uppercase">
                            WATCH
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {!loading && filteredFeeds.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Radio size={28} className="text-slate-600" />
                    <p className="text-slate-500 text-sm font-bold uppercase">No feeds found</p>
                    <button
                      onClick={fetchFeeds}
                      className="px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold uppercase"
                    >
                      Refresh Feeds
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side News Panel */}
          <div className="hidden lg:block w-[380px] xl:w-[440px] shrink-0 border-l border-slate-800/60 relative">
            <LiveNewsPanel isOpen={true} onClose={() => {}} embedded={true} />
          </div>
          
          <div className="lg:hidden">
            <LiveNewsPanel isOpen={isNewsOpen} onClose={() => setIsNewsOpen(false)} embedded={false} />
          </div>
        </div>
      </div>
    </main>
  );
}