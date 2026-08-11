'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import EconomicCalendar from '@/components/news/EconomicCalendar';
import PriceTicker from '@/components/news/PriceTicker';
import {
  RefreshCw, ExternalLink, Clock, Zap, X,
  Search, AlertTriangle, Newspaper, ChevronRight,
  ArrowUpRight, Activity, CircleDot, Layers,
  Shield, CalendarDays, LayoutList, TrendingUp
} from 'lucide-react';

interface Article {
  id: string; title: string; summary: string; source: string;
  icon: string; url: string; publishedAt: string; category: string; isBreaking: boolean;
}

const INSTRUMENTS = [
  { key: 'ALL',  short: 'ALL', label: 'All Markets',     accent: '#94a3b8', activeBg: 'bg-slate-500/10',   activeText: 'text-slate-200',  border: 'border-slate-500/40',   dot: 'bg-slate-400',   cats: [] as string[] },
  { key: 'GOLD', short: 'XAU', label: 'Gold · XAU/USD',  accent: '#f5c451', activeBg: 'bg-yellow-500/10',  activeText: 'text-yellow-400', border: 'border-yellow-500/40',  dot: 'bg-yellow-400',  cats: ['GOLD'] },
  { key: 'USD',  short: 'DXY', label: 'US Dollar · DXY', accent: '#34d399', activeBg: 'bg-emerald-500/10', activeText: 'text-emerald-400',border: 'border-emerald-500/40', dot: 'bg-emerald-400', cats: ['USD','FED/RATES'] },
  { key: 'JPY',  short: 'JPY', label: 'Yen · USD/JPY',   accent: '#38bdf8', activeBg: 'bg-sky-500/10',     activeText: 'text-sky-400',    border: 'border-sky-500/40',     dot: 'bg-sky-400',     cats: ['JPY'] },
  { key: 'OIL',  short: 'OIL', label: 'Crude Oil · WTI', accent: '#fb923c', activeBg: 'bg-orange-500/10',  activeText: 'text-orange-400', border: 'border-orange-500/40',  dot: 'bg-orange-400',  cats: ['OIL'] },
] as const;
type InstrKey = typeof INSTRUMENTS[number]['key'];

const CAT_BADGE: Record<string,string> = {
  GOLD:'text-yellow-400 bg-yellow-500/10 border-yellow-500/25', USD:'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
  JPY:'text-sky-400 bg-sky-500/10 border-sky-500/25', OIL:'text-orange-400 bg-orange-500/10 border-orange-500/25',
  FOREX:'text-cyan-400 bg-cyan-500/10 border-cyan-500/25', 'FED/RATES':'text-red-400 bg-red-500/10 border-red-500/25',
  METALS:'text-amber-400 bg-amber-500/10 border-amber-500/25', EQUITIES:'text-blue-400 bg-blue-500/10 border-blue-500/25',
  CRYPTO:'text-purple-400 bg-purple-500/10 border-purple-500/25', MARKET:'text-slate-400 bg-slate-500/10 border-slate-500/25',
};
const IMPACT = {
  HIGH:{ text:'text-red-400',    bar:'bg-red-500',    bg:'rgba(239,68,68,0.04)'  },
  MED: { text:'text-yellow-400', bar:'bg-yellow-500', bg:'rgba(234,179,8,0.03)'  },
  LOW: { text:'text-slate-500',  bar:'bg-slate-700',  bg:'transparent'           },
};
function timeAgo(d:string){const m=Math.floor((Date.now()-new Date(d).getTime())/60000);if(m<1)return'just now';if(m<60)return`${m}m`;if(m<1440)return`${Math.floor(m/60)}h`;return`${Math.floor(m/1440)}d`;}
function impact(a:Article):'HIGH'|'MED'|'LOW'{if(a.isBreaking)return'HIGH';if(['GOLD','FED/RATES','OIL'].includes(a.category))return'HIGH';if(['USD','JPY','FOREX','METALS'].includes(a.category))return'MED';return'LOW';}

export default function NewsPage() {
  const [articles, setArticles]   = useState<Article[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [instr,    setInstr]      = useState<InstrKey>('ALL');
  const [search,   setSearch]     = useState('');
  const [selected, setSelected]   = useState<Article|null>(null);
  const [lastUp,   setLastUp]     = useState<Date|null>(null);
  // mobile tab: 'news' | 'calendar'
  const [mobileTab, setMobileTab] = useState<'news'|'calendar'>('news');
  // desktop calendar panel
  const [showCal,  setShowCal]    = useState(true);
  const feedRef  = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const fetch_ = useCallback(async()=>{
    setLoading(true);
    try{const r=await fetch('/api/news/articles?limit=100');const d=await r.json();
      if(d.success&&d.articles?.length){setArticles(d.articles);setLastUp(new Date());}}catch(e){console.error(e);}
    setLoading(false);
  },[]);

  useEffect(()=>{fetch_();timerRef.current=setInterval(fetch_,90000);return()=>{if(timerRef.current)clearInterval(timerRef.current);};},[fetch_]);

  const activeI = INSTRUMENTS.find(i=>i.key===instr)!;
  const counts  = Object.fromEntries(INSTRUMENTS.map(i=>[i.key,i.key==='ALL'?articles.length:articles.filter(a=>i.cats.includes(a.category)).length]));
  const filtered = articles.filter(a=>{
    const m1 = instr==='ALL'||activeI.cats.includes(a.category);
    const m2 = !search||a.title.toLowerCase().includes(search.toLowerCase())||a.source.toLowerCase().includes(search.toLowerCase());
    return m1&&m2;
  });
  const breaking   = articles.filter(a=>a.isBreaking);
  const srcCount   = new Set(articles.map(a=>a.source)).size;

  // ── SHARED: instrument pill bar (used on both mobile & desktop) ─────────────
  const InstrBar = ()=>(
    <div className="flex items-center gap-1.5 overflow-x-auto px-4 py-2.5 border-b border-slate-800/50 shrink-0" style={{background:'rgba(8,12,20,0.9)',scrollbarWidth:'none'}}>
      {INSTRUMENTS.map(i=>{const on=instr===i.key;return(
        <button key={i.key} onClick={()=>{setInstr(i.key);setSearch('');feedRef.current?.scrollTo({top:0,behavior:'smooth'});}}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${on?`${i.activeBg} ${i.border} ${i.activeText}`:'bg-slate-800/40 border-slate-700/40 text-slate-500 hover:text-slate-300'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${i.dot} ${on?'':'opacity-40'}`}/>
          {i.short}
          <span className={`text-[9px] font-mono ${on?i.activeText:'text-slate-700'}`}>{counts[i.key]||0}</span>
        </button>
      );})}
    </div>
  );

  // ── SHARED: article feed list ────────────────────────────────────────────────
  const Feed = ()=>(
    <div ref={feedRef} className="flex-1 overflow-y-auto custom-scrollbar">
      {loading&&articles.length===0&&(
        <div className="p-4 space-y-2">{[...Array(8)].map((_,i)=>(
          <div key={i} className="animate-pulse flex gap-2 p-3 rounded-xl border border-slate-800/30 bg-slate-900/20">
            <div className="w-1 rounded-full bg-slate-800 self-stretch"/><div className="flex-1 space-y-2">
              <div className="h-2 bg-slate-800 rounded w-16"/><div className="h-3 bg-slate-800 rounded w-5/6"/><div className="h-2 bg-slate-800 rounded w-2/3"/>
            </div>
          </div>))}</div>
      )}
      <div className="p-3 space-y-2">
        {filtered.map((a,idx)=>{const imp=impact(a);const IS=IMPACT[imp];const badge=CAT_BADGE[a.category]??CAT_BADGE.MARKET;return(
          <article key={a.id+idx} onClick={()=>setSelected(a)}
            className="group flex rounded-xl border border-slate-800/50 overflow-hidden cursor-pointer transition-all hover:border-slate-700"
            style={{background:a.isBreaking?'rgba(239,68,68,0.04)':IS.bg}}>
            <div className={`w-[3px] shrink-0 ${IS.bar} opacity-70`}/>
            <div className="flex-1 px-3 py-3 min-w-0">
              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <span className={`px-1.5 py-0.5 rounded border text-[8px] font-bold uppercase tracking-wide ${badge}`}>{a.category}</span>
                <span className={`text-[8px] font-black uppercase ${IS.text}`}>{imp}</span>
                {a.isBreaking&&<span className="text-[8px] text-red-400 font-black animate-pulse flex items-center gap-0.5"><Zap size={7}/>BREAKING</span>}
                <span className="ml-auto text-[8px] text-slate-600 font-mono">{timeAgo(a.publishedAt)}</span>
              </div>
              <h2 className="text-[12px] font-bold text-slate-200 leading-snug line-clamp-2 mb-1 group-hover:text-white transition-colors" style={{fontFamily:"'Chakra Petch',sans-serif"}}>{a.title}</h2>
              {a.summary&&<p className="text-[10px] text-slate-500 line-clamp-2 mb-1.5 leading-relaxed">{a.summary}</p>}
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wide">{a.source}</span>
                <span className="flex items-center gap-0.5 text-[9px] text-slate-700 group-hover:text-yellow-500 transition-colors font-bold uppercase">Read<ArrowUpRight size={9}/></span>
              </div>
            </div>
          </article>);})}
        {!loading&&filtered.length===0&&articles.length>0&&(
          <div className="flex flex-col items-center py-20 gap-3">
            <Newspaper size={20} className="text-slate-700"/>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">No articles match</p>
            <button onClick={()=>{setInstr('ALL');setSearch('');}} className="px-4 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-bold uppercase hover:text-white transition-all">Clear Filters</button>
          </div>
        )}
      </div>
      <footer className="px-4 py-3 border-t border-slate-800/30 flex justify-between text-[8px] text-slate-700 font-bold uppercase tracking-widest">
        <span>AuScope Intelligence Wire</span><span>{srcCount} sources · 90s</span>
      </footer>
    </div>
  );

  return (
    <main className="terminal-layout bg-[#0a0e17] text-slate-200 font-sans flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 pt-16 md:p-12 relative">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:justify-between md:items-center border-b border-slate-800 pb-6 gap-4">
          <div>
            <Link href="/dashboard" className="text-yellow-500 hover:text-yellow-400 text-[10px] md:text-sm font-bold tracking-widest uppercase flex items-center gap-2 mb-2 transition-colors">
              <span>←</span> BACK TO TERMINAL
            </Link>
            <h1 className="text-xl md:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 uppercase">
              Global Intelligence Feed
            </h1>
            <p className="text-slate-500 text-[10px] md:text-sm tracking-widest uppercase mt-1">Real-time Geopolitical & Market Analysis</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-start md:items-end">
              <span className="text-[10px] text-slate-500 tracking-widest uppercase">Encryption Status</span>
              <span className="text-green-500 font-mono text-[10px] md:text-xs font-bold">AES-256 SECURE</span>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
            {/* Calendar toggle — desktop only */}
            <button onClick={()=>setShowCal(s=>!s)}
              className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[8px] font-black uppercase tracking-wider transition-all ${showCal?'bg-yellow-500/10 border-yellow-500/30 text-yellow-400':'bg-slate-800/60 border-slate-700/50 text-slate-500 hover:text-yellow-400'}`}>
              <CalendarDays size={12}/><span className="hidden lg:inline">Calendar</span>
            </button>
            <button onClick={fetch_} disabled={loading}
              className="p-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-500 hover:text-yellow-400 transition-all disabled:opacity-40">
              <RefreshCw size={13} className={loading?'animate-spin':''}/>
            </button>
          </div>
        </header>

        {/* Filters/Stats Bar */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-1.5 md:px-4 md:py-2 flex items-center gap-2 md:gap-3">
            <span className="text-[9px] md:text-[10px] text-slate-500 uppercase font-bold">Articles</span>
            <span className="text-yellow-500 font-mono font-bold text-xs md:text-base">{newsData.length}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-1.5 md:px-4 md:py-2 flex items-center gap-2 md:gap-3">
             <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500"></div>
             <span className="text-[9px] md:text-[10px] text-slate-500 uppercase font-bold">High Impact</span>
             <span className="text-red-500 font-mono font-bold text-xs md:text-base">{newsData.filter(n => n.impact === 'HIGH').length}</span>
          </div>
          <Feed/>
        </div>

        {/* ── MOBILE: CALENDAR TAB ────────────────────────────────────────── */}
        <div className={`md:hidden flex-1 flex flex-col min-h-0 overflow-hidden ${mobileTab==='calendar'?'flex':'hidden'}`}>
          <EconomicCalendar/>
        </div>

        {/* ── DESKTOP LAYOUT ──────────────────────────────────────────────── */}
        <div className="hidden md:flex flex-1 min-h-0 overflow-hidden">

          {/* Left instrument sidebar */}
          <aside className="shrink-0 w-[180px] border-r border-slate-800/60 flex flex-col" style={{background:'rgba(8,12,20,0.8)'}}>
            <div className="px-3 pt-3 pb-2 border-b border-slate-800/40">
              <p className="text-[8px] text-slate-600 font-black tracking-[0.25em] uppercase">Filter by Asset</p>
            </div>
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto custom-scrollbar">
              {INSTRUMENTS.map(i=>{const on=instr===i.key;return(
                <button key={i.key} onClick={()=>{setInstr(i.key);setSearch('');feedRef.current?.scrollTo({top:0,behavior:'smooth'});}}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${on?`${i.activeBg} border ${i.border}`:'border border-transparent hover:bg-slate-800/40 hover:border-slate-800'}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${i.dot} ${on?'':'opacity-40'}`}/>
                    <div className="text-left">
                      <div className={`text-[11px] font-black ${on?i.activeText:'text-slate-400 group-hover:text-slate-200'} transition-colors`}>{i.short}</div>
                      {i.key!=='ALL'&&<div className="text-[7px] text-slate-600 mt-0.5">{i.label.split('·')[1]?.trim()}</div>}
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${on?i.activeText:'text-slate-700'}`}>{counts[i.key]||0}</span>
                </button>);})}
            </nav>
            <div className="p-3 border-t border-slate-800/40 space-y-1.5">
              <div className="flex items-center gap-1.5"><Shield size={8} className="text-emerald-500"/><span className="text-[7px] text-slate-600 font-bold uppercase tracking-widest">AES-256 Secure</span></div>
              <div className="flex items-center gap-1.5"><CircleDot size={8} className="text-yellow-500"/><span className="text-[7px] text-slate-600 font-bold uppercase tracking-widest">Auto-refresh 90s</span></div>
            </div>
          </aside>

          {/* Centre feed */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Toolbar */}
            <div className="shrink-0 px-4 py-2.5 border-b border-slate-800/40 flex items-center gap-3" style={{background:'rgba(10,14,22,0.6)'}}>
              <div className={`w-2 h-2 rounded-full ${activeI.dot}`}/>
              <span className={`text-[11px] font-black uppercase ${activeI.activeText}`}>{activeI.key==='ALL'?'All Markets':activeI.label}</span>
              <span className="text-[9px] text-slate-600 font-mono">{filtered.length}</span>
              <div className="relative flex-1 max-w-xs ml-2">
                <Search size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600"/>
                <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search headlines..."
                  className="w-full bg-slate-900/60 border border-slate-800 text-slate-300 text-[11px] placeholder:text-slate-700 rounded-lg pl-7 pr-3 py-1.5 focus:outline-none focus:border-slate-600 transition-all"/>
                {search&&<button onClick={()=>setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600"><X size={10}/></button>}
              </div>
            </div>
            <Feed/>
          </div>

          {/* Right calendar */}
          {showCal&&(
            <aside className="shrink-0 w-[300px] xl:w-[340px] border-l border-slate-800/60 flex flex-col overflow-hidden">
              <EconomicCalendar/>
            </aside>
          )}
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
            <div className="px-4 py-3 md:px-6 md:py-4 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                Intelligence Briefing / {selectedNews.id}
              </span>
              <button 
                onClick={() => setSelectedNews(null)}
                className="text-slate-500 hover:text-white transition-colors p-1"
              >
                ✕
              </button>
            </div>
            <div className="p-5 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${
                  selectedNews.impact === 'HIGH' ? 'bg-red-500/10 text-red-500 border border-red-500/30' : 
                  selectedNews.impact === 'MED' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' : 
                  'bg-green-500/10 text-green-500 border border-green-500/30'
                }`}>
                  {selectedNews.impact} IMPACT
                </span>
                <span className="text-[9px] md:text-[10px] text-slate-500 font-mono">{selectedNews.timestamp}</span>
              </div>
              <h2 className="text-lg md:text-2xl font-black text-slate-100 mb-4 md:mb-6 leading-tight uppercase">
                {selectedNews.title}
              </h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6 md:mb-8">
                {selectedNews.content}
              </p>
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800">
                <div>
                  <span className="block text-[9px] md:text-[10px] text-slate-600 uppercase font-bold tracking-widest mb-1">Source Analysis</span>
                  <span className="text-slate-200 font-bold text-xs md:text-sm">{selectedNews.source}</span>
                </div>
                <div>
                  <span className="block text-[9px] md:text-[10px] text-slate-600 uppercase font-bold tracking-widest mb-1">Category</span>
                  <span className="text-slate-200 font-bold text-xs md:text-sm">{selectedNews.category}</span>
                </div>
              </div>
              <button onClick={()=>setSelected(null)} className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-red-500/15 text-slate-500 hover:text-red-400 border border-slate-700 transition-all"><X size={14}/></button>
            </div>
            <div className="px-5 py-4 overflow-y-auto">
              <div className="flex items-center gap-2 text-[9px] text-slate-600 font-mono mb-3">
                <Clock size={9}/>{timeAgo(selected.publishedAt)} · {new Date(selected.publishedAt).toUTCString().replace(' GMT',' UTC')}
              </div>
              <h2 className="text-[15px] font-black text-white leading-tight uppercase mb-3" style={{fontFamily:"'Chakra Petch',sans-serif"}}>{selected.title}</h2>
              {selected.summary&&<p className="text-slate-400 text-[12px] leading-relaxed mb-4 border-l-2 border-slate-700 pl-3">{selected.summary}</p>}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div><span className="block text-[7px] text-slate-600 uppercase font-bold tracking-widest mb-0.5">Source</span><span className="text-slate-200 font-bold text-[12px]">{selected.source}</span></div>
                <div><span className="block text-[7px] text-slate-600 uppercase font-bold tracking-widest mb-0.5">Category</span><span className={`text-[12px] font-bold ${IMPACT[impact(selected)].text}`}>{selected.category}</span></div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-800/50 flex justify-end">
              <button 
                onClick={() => setSelectedNews(null)}
                className="w-full md:w-auto px-6 py-2 bg-slate-100 hover:bg-white text-slate-900 rounded font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
