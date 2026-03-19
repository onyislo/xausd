'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  createChart,
  ColorType,
  CandlestickSeries,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  Time,
} from 'lightweight-charts';
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle, Wifi, WifiOff, ShieldOff } from 'lucide-react';

// ─── Config ──────────────────────────────────────────────────────────────────
// Using the provided API key directly as a fallback if process.env is missing
const API_KEY    = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY || '76c9f305de4343028c2fa26b75d63b81';
const SYMBOL     = 'XAU/USD';
const INTERVAL   = '1min';
const OUTPUTSIZE = 90;
const WS_URL     = `wss://ws.twelvedata.com/v1/quotes/price?apikey=${API_KEY}`;

// ─── REST helpers ─────────────────────────────────────────────────────────────
interface RawCandle { datetime: string; open: string; high: string; low: string; close: string; }

async function fetchTimeSeries(): Promise<CandlestickData<Time>[]> {
  console.log(`[GoldChart] Fetching historical for ${SYMBOL}...`);
  const res  = await fetch(
    `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(SYMBOL)}&interval=${INTERVAL}&outputsize=${OUTPUTSIZE}&apikey=${API_KEY}`
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.status === 'error') throw new Error(json.message ?? 'API error');
  const values = (json.values as RawCandle[] ?? []);
  console.log(`[GoldChart] Received ${values.length} candles.`);
  return values
    .slice().reverse()
    .map(v => ({
      time:  (new Date(v.datetime).getTime() / 1000) as Time,
      open:  parseFloat(v.open),
      high:  parseFloat(v.high),
      low:   parseFloat(v.low),
      close: parseFloat(v.close),
    }));
}

async function fetchLatestPrice(): Promise<number> {
  const res  = await fetch(
    `https://api.twelvedata.com/price?symbol=${encodeURIComponent(SYMBOL)}&apikey=${API_KEY}`
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.status === 'error') throw new Error(json.message);
  return parseFloat(json.price);
}

// ─── Component ────────────────────────────────────────────────────────────────
interface GoldChartProps { height?: number; fullscreen?: boolean; }

type WsStatus = 'connecting' | 'live' | 'disconnected';

export default function GoldChart({ height = 480, fullscreen = false }: GoldChartProps) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const chartRef       = useRef<IChartApi | null>(null);
  // @ts-expect-error – generic param accepted at runtime
  const seriesRef      = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const wsRef          = useRef<WebSocket | null>(null);
  const currentCandle  = useRef<CandlestickData<Time> | null>(null);
  const lastTickMs     = useRef<number>(0);

  const [livePrice,     setLivePrice]     = useState<number | null>(null);
  const [prevPrice,     setPrevPrice]     = useState<number | null>(null);
  const [lastUpdated,   setLastUpdated]   = useState<Date | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [candlesLoaded, setCandlesLoaded] = useState(0);
  const [wsStatus,      setWsStatus]      = useState<WsStatus>('disconnected');

  // ── Manual forcing of data ────────────────────────────────────────────────
  const forceRefresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const price = await fetchLatestPrice();
      console.log(`[GoldChart] Forced refresh price: ${price}`);
      applyTick(price);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [livePrice]);

  const applyTick = (price: number) => {
    if (!seriesRef.current) return;
    
    // 1. Calculate the preferred minute timestamp
    // We anchor it to the current system minute.
    const localMinuteTs = (Math.floor(Date.now() / 60_000) * 60) as Time;
    
    // 2. Safety: never go backward in time compared to the last loaded candle
    const lastExistingTs = currentCandle.current?.time ?? 0;
    const finalTs = (localMinuteTs as number) >= (lastExistingTs as number)
      ? localMinuteTs
      : lastExistingTs;

    const prev = currentCandle.current;
    
    // Create new candle or update current one
    const candle: CandlestickData<Time> =
      !prev || prev.time !== finalTs
        ? { time: finalTs as Time, open: price, high: price, low: price, close: price }
        : { ...prev, high: Math.max(prev.high, price), low: Math.min(prev.low, price), close: price };

    currentCandle.current = candle;
    lastTickMs.current    = Date.now();
    
      try {
      // @ts-expect-error – v5 update API
      seriesRef.current.update(candle);
    } catch (e) {
      console.warn('[GoldChart] Update rejected:', e);
    }
    
    setPrevPrice(p => (p === null ? price : livePrice ?? p));
    setLivePrice(price);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    if (!containerRef.current) return;

    let unmounted  = false;
    let wsReconnectTimer: ReturnType<typeof setTimeout>;
    let restFallbackTimer: ReturnType<typeof setInterval>;

    function initChart(width: number, chartHeight: number) {
      if (unmounted || !containerRef.current) return;

      const chart = createChart(containerRef.current, {
        width,
        height: chartHeight,
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor:  '#8a9bb2',
          fontSize:   11,
          fontFamily: "'Chakra Petch','Inter',sans-serif",
        },
        grid: {
          vertLines: { color: 'rgba(255,196,0,0.04)' },
          horzLines: { color: 'rgba(255,196,0,0.04)' },
        },
        handleScroll: { mouseWheel: true, pressedMouseMove: true },
        handleScale:  { mouseWheel: true, pinch: true },
        rightPriceScale: { 
          borderColor: 'rgba(245,196,81,0.15)', 
          scaleMargins: { top: 0.1, bottom: 0.1 },
          autoScale: true 
        },
        timeScale: { 
          borderColor: 'rgba(245,196,81,0.15)', 
          timeVisible: true, 
          secondsVisible: true 
        },
      });

      // @ts-expect-error – v5 addSeries API
      const series = chart.addSeries(CandlestickSeries, {
        upColor: '#26a69a', downColor: '#ef5350',
        borderUpColor: '#26a69a', borderDownColor: '#ef5350',
        wickUpColor:   '#26a69a', wickDownColor:   '#ef5350',
      });

      chartRef.current  = chart;
      seriesRef.current = series;

      const ro = new ResizeObserver(entries => {
        const entry = entries[0];
        if (!entry || !chartRef.current) return;
        const w = entry.contentRect.width;
        if (w > 0) chartRef.current.applyOptions({ width: w });
      });
      ro.observe(containerRef.current);

      // Historical Load
      fetchTimeSeries()
        .then(candles => {
          if (unmounted || !seriesRef.current) return;
          // @ts-expect-error – v5 setData API
          seriesRef.current.setData(candles);
          chartRef.current?.timeScale().fitContent();
          setCandlesLoaded(candles.length);
          if (candles.length) {
            const last = candles[candles.length - 1];
            currentCandle.current = { ...last };
            setLivePrice(last.close);
            setLastUpdated(new Date());
          }
        })
        .catch(err => { if (!unmounted) setError(err.message); })
        .finally(()  => { if (!unmounted) setLoading(false); });

      // WebSocket Connection
      function connectWs() {
        if (unmounted) return;
        console.log(`[GoldChart] Connecting to ${WS_URL}...`);
        setWsStatus('connecting');
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log(`[GoldChart] WS Connected. Subscribing to ${SYMBOL}...`);
          ws.send(JSON.stringify({ action: 'subscribe', params: { symbols: SYMBOL } }));
          setWsStatus('live');
        };

        ws.onmessage = (ev) => {
          const msg = JSON.parse(ev.data);
          if (msg.event === 'price' && msg.price) {
            applyTick(msg.price);
          }
        };

        ws.onerror = (err) => {
          console.error(`[GoldChart] WS Error:`, err);
          setWsStatus('disconnected');
        };

        ws.onclose = () => {
          console.warn(`[GoldChart] WS Closed.`);
          setWsStatus('disconnected');
          if (!unmounted) wsReconnectTimer = setTimeout(connectWs, 5000);
        };
      }
      connectWs();

      // REST Fallback (every 10s)
      restFallbackTimer = setInterval(async () => {
        if (unmounted || !seriesRef.current) return;
        const silentSecs = (Date.now() - lastTickMs.current) / 1000;
        if (silentSecs < 12) return; 
        try {
          const price = await fetchLatestPrice();
          applyTick(price);
        } catch { /* ignore */ }
      }, 10000);

      return () => {
        ro.disconnect();
        chart.remove();
        wsRef.current?.close();
      };
    }

    // Delay init until container has width
    const sizeObserver = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width ?? 0;
      if (w > 0) {
        sizeObserver.disconnect();
        initChart(w, fullscreen ? window.innerHeight - 80 : height);
      }
    });
    sizeObserver.observe(containerRef.current);

    return () => {
      unmounted = true;
      sizeObserver.disconnect();
      clearTimeout(wsReconnectTimer);
      clearInterval(restFallbackTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const priceUp = prevPrice !== null && livePrice !== null && livePrice >= prevPrice;
  const priceDelta = prevPrice !== null && livePrice !== null ? (livePrice - prevPrice).toFixed(2) : null;
  const formattedPrice = livePrice?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '—';

  return (
    <div className={`flex flex-col bg-slate-900/60 border border-yellow-500/20 rounded-xl overflow-hidden backdrop-blur-sm ${fullscreen ? 'fixed inset-0 z-[9999]' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-yellow-500/10 bg-slate-800/60 shrink-0">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            {wsStatus === 'live' ? <><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" /></> : <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500/40 animate-pulse" />}
          </span>
          <h2 className="text-[11px] font-bold text-yellow-500 uppercase tracking-widest">{SYMBOL} Gold Spot</h2>
          <button onClick={forceRefresh} className="p-1 hover:bg-white/10 rounded transition-colors" title="Force Refresh">
            <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          {livePrice !== null && (
            <div className="flex items-end gap-2">
              <span className={`text-[18px] font-black tabular-nums transition-colors duration-300 ${priceUp ? 'text-emerald-400' : 'text-red-400'}`}>${formattedPrice}</span>
              {priceDelta !== '0.00' && priceDelta !== null && (
                <span className={`text-[10px] font-bold mb-0.5 flex items-center gap-0.5 ${priceUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  {priceUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {Number(priceDelta) > 0 ? '+' : ''}{priceDelta}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Connection Info */}
      <div className="flex items-center justify-between px-5 py-1.5 bg-slate-950/40 border-b border-yellow-500/05 text-[8px] uppercase tracking-widest text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
             {wsStatus === 'live' ? <><Wifi size={8} className="text-emerald-500" /> Live Stream</> : <><WifiOff size={8} className="text-red-500" /> Offline</>}
          </span>
          <span>Twelve Data API</span>
          <span>{candlesLoaded} Candles</span>
        </div>
        {error && <span className="text-red-500 flex items-center gap-1 font-bold animate-pulse"><AlertCircle size={8} /> ERROR: {error}</span>}
      </div>

      {/* Chart Area */}
      <div id="gold-chart-container" className="relative flex-1 min-h-0 bg-slate-900/10 p-1">
        {loading && !candlesLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-slate-900/40">
             <RefreshCw size={24} className="text-yellow-500 animate-spin" />
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* Footer */}
      <div className="px-5 py-2 flex items-center justify-between text-[7px] text-slate-600 uppercase tracking-widest border-t border-yellow-500/05">
        <div className="flex items-center gap-2">
          <ShieldOff size={8} /> No Logo Target Active
        </div>
        <span>Last Update: {lastUpdated?.toLocaleTimeString() ?? 'Pending'}</span>
      </div>
    </div>
  );
}
