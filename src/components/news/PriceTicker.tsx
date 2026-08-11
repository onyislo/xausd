'use client';
import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Minus, Wifi, WifiOff } from 'lucide-react';

// ─── Twelve Data config ───────────────────────────────────────────────────────
const API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY || '76c9f305de4343028c2fa26b75d63b81';
const WS_URL  = `wss://ws.twelvedata.com/v1/quotes/price?apikey=${API_KEY}`;

// Symbols to track — Twelve Data symbol format
const SYMBOLS = ['XAU/USD', 'USD/JPY', 'WTI/USD'] as const;
// DXY isn't a tradable pair on Twelve Data free tier, fetch via REST only
const REST_SYMBOLS = ['XAU/USD', 'DX-Y.NYB:NYB', 'USD/JPY', 'CL1!:NYMEX'];

// ─── Display config per instrument ──────────────────────────────────────────
interface InstrumentConfig {
  wsSymbol?: string;   // symbol sent to WebSocket subscription
  restSymbol: string;  // symbol used for REST /price call
  label: string;
  subLabel: string;
  labelColor: string;
  priceColor: string;
  border: string;
  decimals: number;
}

const INSTRUMENTS: InstrumentConfig[] = [
  {
    wsSymbol:  'XAU/USD',
    restSymbol: 'XAU/USD',
    label: 'XAU/USD',
    subLabel: 'Gold',
    labelColor: 'text-yellow-400',
    priceColor: 'text-yellow-200',
    border: 'border-yellow-500/20',
    decimals: 2,
  },
  {
    wsSymbol:  undefined,            // DXY not on WS free tier
    restSymbol: 'DX-Y.NYB',         // Twelve Data REST supports this
    label: 'DXY',
    subLabel: 'USD Index',
    labelColor: 'text-emerald-400',
    priceColor: 'text-emerald-200',
    border: 'border-emerald-500/20',
    decimals: 3,
  },
  {
    wsSymbol:  'USD/JPY',
    restSymbol: 'USD/JPY',
    label: 'USD/JPY',
    subLabel: 'Yen',
    labelColor: 'text-sky-400',
    priceColor: 'text-sky-200',
    border: 'border-sky-500/20',
    decimals: 3,
  },
  {
    wsSymbol:  'WTI/USD',
    restSymbol: 'WTI/USD',
    label: 'WTI OIL',
    subLabel: 'Crude',
    labelColor: 'text-orange-400',
    priceColor: 'text-orange-200',
    border: 'border-orange-500/20',
    decimals: 2,
  },
];

interface PriceState {
  price: number | null;
  prevPrice: number | null;
  change: number | null;
  changePercent: number | null;
  flash: 'up' | 'down' | null;
}

type PricesMap = Record<string, PriceState>;

const emptyState = (): PriceState => ({
  price: null, prevPrice: null, change: null, changePercent: null, flash: null,
});

// ─── Component ────────────────────────────────────────────────────────────────
export default function PriceTicker() {
  const [prices, setPrices] = useState<PricesMap>(() =>
    Object.fromEntries(INSTRUMENTS.map(i => [i.label, emptyState()]))
  );
  const [wsStatus, setWsStatus] = useState<'connecting' | 'live' | 'offline'>('connecting');
  const wsRef   = useRef<WebSocket | null>(null);
  const deadRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── helpers ──
  const labelForSymbol = (sym: string): string | null => {
    const inst = INSTRUMENTS.find(i => i.wsSymbol === sym || i.restSymbol === sym);
    return inst?.label ?? null;
  };

  const updatePrice = (label: string, newPrice: number) => {
    setPrices(prev => {
      const old = prev[label] ?? emptyState();
      const prevPrice = old.price;
      const change = prevPrice != null ? newPrice - prevPrice : null;
      const changePct = prevPrice != null && prevPrice > 0 ? (newPrice - prevPrice) / prevPrice * 100 : null;
      const flash = change != null ? (change > 0 ? 'up' : change < 0 ? 'down' : null) : null;
      const next = { ...prev, [label]: { price: newPrice, prevPrice, change, changePercent: changePct, flash } };
      // Clear flash after 600ms
      if (flash) setTimeout(() => setPrices(p => ({ ...p, [label]: { ...p[label], flash: null } })), 600);
      return next;
    });
  };

  // ── Initial REST fetch for all symbols (immediate prices) ──────────────────
  useEffect(() => {
    const fetchRest = async () => {
      // Twelve Data /price supports comma-separated symbols
      const syms = INSTRUMENTS.map(i => i.restSymbol).join(',');
      try {
        const res  = await fetch(`https://api.twelvedata.com/price?symbol=${encodeURIComponent(syms)}&apikey=${API_KEY}`);
        const data = await res.json();

        INSTRUMENTS.forEach(inst => {
          // Response is { "XAU/USD": { price: "..." }, ... } when multiple symbols
          const entry = data[inst.restSymbol] ?? data;
          const p = parseFloat(entry?.price ?? entry);
          if (!isNaN(p) && p > 0) {
            setPrices(prev => ({
              ...prev,
              [inst.label]: {
                ...(prev[inst.label] ?? emptyState()),
                price: p,
              },
            }));
          }
        });
      } catch (e) {
        console.error('Twelve Data REST error:', e);
      }
    };

    fetchRest();
    // Also fetch previous close for % change via /quote
    const fetchQuotes = async () => {
      const syms = INSTRUMENTS.map(i => i.restSymbol).join(',');
      try {
        const res  = await fetch(`https://api.twelvedata.com/quote?symbol=${encodeURIComponent(syms)}&apikey=${API_KEY}`);
        const data = await res.json();

        INSTRUMENTS.forEach(inst => {
          const entry = data[inst.restSymbol] ?? data;
          const close     = parseFloat(entry?.close ?? entry?.price ?? 0);
          const prevClose = parseFloat(entry?.previous_close ?? entry?.open ?? 0);
          if (close > 0) {
            const change    = prevClose > 0 ? close - prevClose : null;
            const changePct = prevClose > 0 ? (close - prevClose) / prevClose * 100 : null;
            setPrices(prev => ({
              ...prev,
              [inst.label]: {
                ...(prev[inst.label] ?? emptyState()),
                price:         close,
                prevPrice:     prevClose > 0 ? prevClose : null,
                change,
                changePercent: changePct,
                flash:         null,
              },
            }));
          }
        });
      } catch (e) {
        console.error('Twelve Data quote error:', e);
      }
    };
    fetchQuotes();

    // REST refresh every 30s as fallback when WS ticks slow
    const restInterval = setInterval(fetchQuotes, 30000);
    return () => clearInterval(restInterval);
  }, []);

  // ── WebSocket for live ticks ───────────────────────────────────────────────
  useEffect(() => {
    deadRef.current = false;

    const wsSymbols = INSTRUMENTS.filter(i => i.wsSymbol).map(i => i.wsSymbol!);

    function connect() {
      if (deadRef.current) return;
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      setWsStatus('connecting');

      ws.onopen = () => {
        ws.send(JSON.stringify({
          action: 'subscribe',
          params: { symbols: wsSymbols.join(',') },
        }));
        setWsStatus('live');
      };

      ws.onmessage = ev => {
        try {
          const msg = JSON.parse(ev.data);
          // Twelve Data sends { event: "price", symbol: "XAU/USD", price: "3285.60", ... }
          if (msg.event === 'price' && msg.symbol && msg.price) {
            const label = labelForSymbol(msg.symbol);
            if (label) updatePrice(label, parseFloat(msg.price));
          }
        } catch { /* ignore parse errors */ }
      };

      ws.onerror = () => setWsStatus('offline');

      ws.onclose = () => {
        setWsStatus('offline');
        if (!deadRef.current) {
          timerRef.current = setTimeout(connect, 5000);
        }
      };
    }

    connect();

    return () => {
      deadRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      wsRef.current?.close();
    };
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="shrink-0 border-b border-slate-800/70 flex items-stretch overflow-x-auto"
      style={{ background: 'linear-gradient(180deg,rgba(10,14,22,0.99) 0%,rgba(8,12,18,0.99) 100%)', height: '56px' }}
    >
      {/* Live label */}
      <div className="shrink-0 h-full px-4 flex flex-col justify-center gap-0.5 border-r border-slate-800/60"
        style={{ background: 'rgba(245,196,81,0.02)', minWidth: '80px' }}>
        <div className="flex items-center gap-1.5">
          {wsStatus === 'live'
            ? <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            : wsStatus === 'connecting'
            ? <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
            : <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          }
          <span className="text-[8px] font-black text-slate-400 tracking-[0.2em] uppercase">
            {wsStatus === 'live' ? 'Live' : wsStatus === 'connecting' ? 'Conn.' : 'Retry'}
          </span>
        </div>
        <span className="text-[7px] text-slate-600 font-bold uppercase tracking-wider">Twelve Data</span>
      </div>

      {/* Instrument cards */}
      {INSTRUMENTS.map(inst => {
        const ps = prices[inst.label] ?? emptyState();
        const isUp   = (ps.change ?? 0) > 0;
        const isDown = (ps.change ?? 0) < 0;
        const flashUp   = ps.flash === 'up';
        const flashDown = ps.flash === 'down';

        let bgFlash = '';
        if (flashUp)   bgFlash = 'bg-green-500/8';
        else if (flashDown) bgFlash = 'bg-red-500/8';

        const fmtPrice = ps.price != null
          ? inst.label === 'XAU/USD'
            ? ps.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : ps.price.toFixed(inst.decimals)
          : '—';

        const fmtChange = ps.changePercent != null
          ? `${ps.changePercent >= 0 ? '+' : ''}${ps.changePercent.toFixed(2)}%`
          : null;

        const fmtPts = ps.change != null
          ? `(${ps.change >= 0 ? '+' : ''}${ps.change.toFixed(inst.decimals === 3 ? 3 : 2)})`
          : null;

        return (
          <div
            key={inst.label}
            className={`shrink-0 h-full flex items-center gap-3 px-4 border-r border-slate-800/40 transition-colors duration-300 ${bgFlash || 'hover:bg-slate-800/20'}`}
            style={{ minWidth: '152px' }}
          >
            {/* Directional side bar */}
            <div className={`w-[2px] h-8 rounded-full shrink-0 transition-colors duration-300 ${
              isUp   ? 'bg-green-500' :
              isDown ? 'bg-red-500'   :
                       'bg-slate-700'
            } opacity-80`} />

            <div className="min-w-0">
              {/* Symbol row */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`text-[9px] font-black tracking-widest uppercase leading-none ${inst.labelColor}`}>
                  {inst.label}
                </span>
                <span className="text-[7px] text-slate-600 uppercase tracking-wider">{inst.subLabel}</span>
              </div>

              {/* Price — big, bold, live */}
              <div className={`font-black font-mono leading-none transition-colors duration-200 ${
                flashUp   ? 'text-green-300' :
                flashDown ? 'text-red-300'   :
                            inst.priceColor
              }`}
                style={{ fontSize: '15px', letterSpacing: '-0.02em' }}>
                {ps.price == null
                  ? <span className="text-slate-700 animate-pulse">———</span>
                  : fmtPrice
                }
              </div>

              {/* Change row */}
              {fmtChange && (
                <div className="flex items-center gap-1 mt-0.5">
                  {isUp   ? <TrendingUp  size={9} className="text-green-400 shrink-0" /> :
                   isDown ? <TrendingDown size={9} className="text-red-400   shrink-0" /> :
                            <Minus       size={9} className="text-slate-600  shrink-0" />}
                  <span className={`text-[9px] font-bold font-mono ${
                    isUp ? 'text-green-400' : isDown ? 'text-red-400' : 'text-slate-500'
                  }`}>{fmtChange}</span>
                  {fmtPts && (
                    <span className={`text-[8px] font-mono ${
                      isUp ? 'text-green-700' : isDown ? 'text-red-700' : 'text-slate-700'
                    }`}>{fmtPts}</span>
                  )}
                </div>
              )}
              {!fmtChange && ps.price != null && (
                <div className="text-[8px] text-slate-600 mt-0.5 font-mono">loading Δ...</div>
              )}
            </div>
          </div>
        );
      })}

      {/* Right spacer with ws indicator */}
      <div className="ml-auto shrink-0 px-4 flex items-center gap-1.5">
        {wsStatus === 'live'
          ? <Wifi size={10} className="text-emerald-700" />
          : <WifiOff size={10} className="text-slate-700" />}
        <span className="text-[8px] text-slate-700 font-mono whitespace-nowrap hidden md:inline">
          {wsStatus === 'live' ? 'WebSocket' : '30s poll'}
        </span>
      </div>
    </div>
  );
}
