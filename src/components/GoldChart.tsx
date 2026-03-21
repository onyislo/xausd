/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  createChart, ColorType,
  CandlestickSeries, HistogramSeries, LineSeries,
  IChartApi, ISeriesApi, CandlestickData, HistogramData, LineData, Time,
} from 'lightweight-charts';
import { ChevronDown, Crown, Maximize2 } from 'lucide-react';

const API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY || '76c9f305de4343028c2fa26b75d63b81';
const SYMBOL = 'XAU/USD';
const WS_URL = `wss://ws.twelvedata.com/v1/quotes/price?apikey=${API_KEY}`;

const TIMEFRAMES = [
  { label: '1m', interval: '1min' },
  { label: '5m', interval: '5min' },
  { label: '15m', interval: '15min' },
  { label: '30m', interval: '30min' },
  { label: '1h', interval: '1h' },
  { label: '4h', interval: '4h' },
  { label: '1D', interval: '1day' },
  { label: '1W', interval: '1week' },
];

interface RawCandle { datetime: string; open: string; high: string; low: string; close: string; volume?: string; }

function calcMA(candles: CandlestickData<Time>[], period: number): LineData<Time>[] {
  return candles.slice(period - 1).map((_, i) => ({
    time: candles[i + period - 1].time,
    value: candles.slice(i, i + period).reduce((s, c) => s + c.close, 0) / period,
  }));
}

async function fetchCandles(interval: string): Promise<{ candles: CandlestickData<Time>[]; volumes: HistogramData<Time>[] }> {
  try {
    const res = await fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(SYMBOL)}&interval=${interval}&outputsize=90&apikey=${API_KEY}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.status === 'error') throw new Error(json.message ?? 'API error');
    const vals = (json.values as RawCandle[] ?? []).slice().reverse();
    const candles: CandlestickData<Time>[] = vals.map(v => ({
      time: (new Date(v.datetime).getTime() / 1000) as Time,
      open: parseFloat(v.open), high: parseFloat(v.high),
      low: parseFloat(v.low), close: parseFloat(v.close),
    }));
    const volumes: HistogramData<Time>[] = vals.map((v, i) => ({
      time: candles[i].time,
      value: parseFloat(v.volume ?? '0') || Math.abs(parseFloat(v.close) - parseFloat(v.open)) * 500 + 30,
      color: parseFloat(v.close) >= parseFloat(v.open) ? 'rgba(38,166,154,0.55)' : 'rgba(239,83,80,0.55)',
    }));
    return { candles, volumes };
  } catch (err) {
    console.error(err);
    return { candles: [], volumes: [] };
  }
}

async function fetchPrice(): Promise<number> {
  const res = await fetch(`https://api.twelvedata.com/price?symbol=${encodeURIComponent(SYMBOL)}&apikey=${API_KEY}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return parseFloat(json.price);
}

interface GoldChartProps { height?: number; fullscreen?: boolean; }

export default function GoldChart({ height = 420, fullscreen = false }: GoldChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const maFastRef = useRef<ISeriesApi<'Line'> | null>(null);
  const maSlowRef = useRef<ISeriesApi<'Line'> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const liveCandle = useRef<CandlestickData<Time> | null>(null);
  const lastTickMs = useRef(0);
  const allCandles = useRef<CandlestickData<Time>[]>([]);

  const [tfIdx, setTfIdx] = useState(0); // default 1m
  const [livePrice, setLivePrice] = useState<number | null>(null);

  /* ── apply a new price tick ── */
  const applyTick = useCallback((price: number) => {
    if (!candleRef.current) return;
    const minTs = (Math.floor(Date.now() / 60_000) * 60) as Time;
    const prev = liveCandle.current;
    const ts = prev && (prev.time as number) > (minTs as number) ? prev.time : minTs;
    const c: CandlestickData<Time> =
      !prev || prev.time !== ts
        ? { time: ts, open: price, high: price, low: price, close: price }
        : { ...prev, high: Math.max(prev.high, price), low: Math.min(prev.low, price), close: price };
    liveCandle.current = c;
    lastTickMs.current = Date.now();
    try { candleRef.current.update(c); } catch { /* ignore */ }
    try { volRef.current?.update({ time: c.time, value: Math.abs(c.close - c.open) * 200 + 20, color: c.close >= c.open ? 'rgba(38,166,154,0.55)' : 'rgba(239,83,80,0.55)' }); } catch { /* ignore */ }
    const cs = [...allCandles.current];
    const i = cs.findIndex(x => x.time === c.time);
    if (i >= 0) cs[i] = c; else cs.push(c);
    allCandles.current = cs;
    try { const f = calcMA(cs, 9); if (f.length) maFastRef.current?.update(f[f.length - 1]); } catch { /* ignore */ }
    try { const s = calcMA(cs, 21); if (s.length) maSlowRef.current?.update(s[s.length - 1]); } catch { /* ignore */ }
    setLivePrice(price);
  }, []);

  /* ── load data for selected timeframe ── */
  useEffect(() => {
    if (!containerRef.current) return;
    let dead = false;
    let wsTimer: ReturnType<typeof setTimeout>;

    const interval = TIMEFRAMES[tfIdx].interval;
    liveCandle.current = null;
    allCandles.current = [];

    // Build / rebuild chart
    chartRef.current?.remove();
    chartRef.current = null;

    const w = containerRef.current.clientWidth || 600;
    const h = fullscreen ? window.innerHeight - 80 : (containerRef.current.clientHeight || height);

    const chart = createChart(containerRef.current, {
      width: w, height: h,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#8a9bb2', fontSize: 11,
        fontFamily: "'Chakra Petch','Inter',sans-serif",
      },
      grid: {
        vertLines: { color: 'rgba(255,196,0,0.03)' },
        horzLines: { color: 'rgba(255,196,0,0.03)' },
      },
      crosshair: {
        vertLine: { color: 'rgba(245,196,81,0.3)', width: 1, style: 3 },
        horzLine: { color: 'rgba(245,196,81,0.3)', width: 1, style: 3 },
      },
      rightPriceScale: { borderColor: 'rgba(245,196,81,0.15)', scaleMargins: { top: 0.15, bottom: 0.22 } },
      timeScale: { borderColor: 'rgba(245,196,81,0.15)', timeVisible: true, secondsVisible: false },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { mouseWheel: true, pinch: true },
    });

    const cSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a', downColor: '#ef5350',
      borderUpColor: '#26a69a', borderDownColor: '#ef5350',
      wickUpColor: '#26a69a', wickDownColor: '#ef5350',
    });
    const vSeries = chart.addSeries(HistogramSeries, {
      color: 'rgba(38,166,154,0.4)', priceFormat: { type: 'volume' }, priceScaleId: 'vol',
    });
    chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });

    const faS = chart.addSeries(LineSeries, { color: '#f5c451', lineWidth: 2, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });
    const slS = chart.addSeries(LineSeries, { color: '#2196f3', lineWidth: 2, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });

    chartRef.current = chart;
    candleRef.current = cSeries;
    volRef.current = vSeries;
    maFastRef.current = faS;
    maSlowRef.current = slS;

    const ro = new ResizeObserver(e => { 
      const rw = e[0]?.contentRect.width; 
      const rh = e[0]?.contentRect.height;
      if (rw && rh) chart.applyOptions({ width: rw, height: rh });
      else if (rw) chart.applyOptions({ width: rw });
    });
    if (containerRef.current) ro.observe(containerRef.current);

    // Load historical
    fetchCandles(interval).then(({ candles, volumes }) => {
      if (dead) return;
      allCandles.current = candles;
      cSeries.setData(candles);
      vSeries.setData(volumes);
      faS.setData(calcMA(candles, 9));
      slS.setData(calcMA(candles, 21));
      chart.timeScale().fitContent();

      if (candles.length) {
        const last = candles[candles.length - 1];
        liveCandle.current = { ...last };
        setLivePrice(last.close);
      }
    });

    // WebSocket (resubscribes on tf change, though strictly TWELVE data just sends price)
    function connectWs() {
      if (dead) return;
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      ws.onopen = () => { ws.send(JSON.stringify({ action: 'subscribe', params: { symbols: SYMBOL } })); };
      ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.event === 'price' && m.price) applyTick(m.price); };
      ws.onclose = () => { if (!dead) wsTimer = setTimeout(connectWs, 5000); };
    }
    connectWs();

    // REST fallback
    const restTimer = setInterval(async () => {
      if (dead) return;
      if ((Date.now() - lastTickMs.current) / 1000 < 12) return;
      try { applyTick(await fetchPrice()); } catch { /* ignore */ }
    }, 10000);

    return () => {
      dead = true;
      ro.disconnect();
      clearTimeout(wsTimer);
      clearInterval(restTimer);
      wsRef.current?.close();
      chart.remove();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tfIdx]);

  const fmtPrice = livePrice?.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) ?? '—';

  return (
    <div className={`flex gap-4 ${fullscreen ? 'fixed inset-0 z-[9999] p-4 bg-[#0a0e17]' : 'h-full w-full'}`}>

      {/* ── PANEL 1: FTF Selection ── */}
      <div className="w-[190px] flex flex-col bg-[#0f1420] border border-yellow-500/20 rounded-xl overflow-hidden shrink-0 shadow-lg">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-yellow-500/10">
          <span className="text-[14px] text-slate-200 tracking-wider">FTF selection</span>
          <ChevronDown size={14} className="text-slate-500" />
        </div>

        {/* Body */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-center text-[10px] text-slate-500 tracking-[0.15em] font-bold uppercase mb-4">
            <span>FTF Frames</span>
            <span>F/F</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-auto">
            {TIMEFRAMES.map((tf, i) => (
              <button
                key={tf.label}
                onClick={() => setTfIdx(i)}
                className={`py-3 flex items-center justify-center text-[15px] font-bold rounded-lg transition-all border
                  ${i === tfIdx
                    ? 'bg-slate-800 border-yellow-500/40 text-slate-200 shadow-[inset_0_0_15px_rgba(245,196,81,0.05)]'
                    : 'bg-[#181f2d] border-transparent text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <div className="flex justify-center pt-8 pb-2">
            <Crown size={14} className="text-yellow-500/80" />
          </div>
        </div>
      </div>

      {/* ── PANEL 2: Chart Area ── */}
      <div className="flex-1 flex flex-col bg-[#0f1420] border border-yellow-500/20 rounded-xl overflow-hidden min-w-0 shadow-lg">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-yellow-500/10 shrink-0">
          <div className="flex items-center">
            {/* Empty to maintain layout, #TradingView text removed */}
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 text-[11px] font-bold">
              {['1m', '5m', '15m', '30m', '4h', '1D', '1W'].map(lbl => {
                const isActive = TIMEFRAMES[tfIdx].label === lbl;
                return (
                  <span
                    key={lbl}
                    onClick={() => {
                      const idx = TIMEFRAMES.findIndex(t => t.label === lbl);
                      if (idx >= 0) setTfIdx(idx);
                    }}
                    className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors
                      ${isActive ? 'bg-[#1a2130] text-slate-200' : 'text-slate-500 hover:text-slate-300 hover:bg-[#1a2130]/50'}`}
                  >
                    {lbl}
                  </span>
                )
              })}
            </div>

            <button className="text-slate-500 hover:text-white transition-colors">
              <Maximize2 size={14} />
            </button>
          </div>
        </div>

        <div className="relative flex-1 min-h-0 bg-[#0c1117]">

          <style jsx global>{`
            #chart-watermark-wrapper a, #chart-watermark-wrapper svg {
              display: none !important;
              opacity: 0 !important;
              visibility: hidden !important;
              pointer-events: none !important;
            }
          `}</style>

          {/* Big Yellow Price Overlay exactly like screenshot */}
          {livePrice !== null && (
            <div className="absolute top-5 left-6 z-10 pointer-events-none select-none">
              <h2 className="text-[12px] font-bold text-yellow-500 uppercase tracking-widest mb-1 drop-shadow-md">
                XAU/USD GOLD SPOT
              </h2>
              <div className="font-black text-[24px] tabular-nums tracking-tight text-yellow-500" style={{ textShadow: '0 4px 12px rgba(234,179,8,0.2)' }}>
                ${fmtPrice}
              </div>
            </div>
          )}

          {/* Chart Canvas */}
          <div id="chart-watermark-wrapper" ref={containerRef} className="w-full h-full" />
        </div>
      </div>

    </div>
  );
}
