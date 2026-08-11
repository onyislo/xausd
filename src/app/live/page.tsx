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
        <header className="h-[64px] border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-md flex items-center justify-between pl-14 pr-4 md:px-6 shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 bg-red-500/10 rounded-lg border border-red-500/20">
              <PlayCircle size={18} className="text-red-500" />
            </div>
            <div>
              <h1 className="text-[11px] md:text-[14px] font-black tracking-[0.1em] md:tracking-[0.15em] text-slate-100 uppercase" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                Tactical Video Feeds
              </h1>
              <p className="hidden xs:block text-[8px] md:text-[10px] text-slate-500 font-bold tracking-wider uppercase mt-0.5">Surveillance Intel</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="px-2 md:px-3 py-1 bg-red-500/10 border border-red-500/20 rounded text-[8px] md:text-[10px] text-red-500 font-bold tracking-widest uppercase flex items-center gap-1.5 md:gap-2">
              <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>
              <span className="hidden sm:inline">Live Feeds Active</span>
              <span className="sm:hidden">LIVE</span>
            </div>
          )}
        </header>

        <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar bg-gradient-to-b from-slate-900/20 to-transparent">
          <div className="max-w-7xl mx-auto">
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