'use client';
import { useEffect, useState } from 'react';
import { useTheme } from '@/lib/ThemeContext';

const API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY || '76c9f305de4343028c2fa26b75d63b81';

interface Ticker {
  symbol: string;
  label: string;
  prefix: string;
  price: string | null;
  prev: string | null;
}

const SYMBOLS: Ticker[] = [
  { symbol: 'XAU/USD', label: 'XAU/USD', prefix: '$', price: null, prev: null },
  { symbol: 'DXY',     label: 'DXY',     prefix: '',  price: null, prev: null },
  { symbol: 'US10Y',   label: 'US10Y',   prefix: '',  price: null, prev: null },
  { symbol: 'USD/JPY', label: 'USD/JPY', prefix: '',  price: null, prev: null },
];

const BATCH = SYMBOLS.map(s => s.symbol).join(',');

export default function LiveTicker() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [tickers, setTickers] = useState<Ticker[]>(SYMBOLS);

  useEffect(() => {
    let dead = false;

    async function fetchAll() {
      try {
        // Batch fetch — one call for all symbols
        const res = await fetch(
          `https://api.twelvedata.com/price?symbol=${encodeURIComponent(BATCH)}&apikey=${API_KEY}`
        );
        const data = await res.json();

        if (dead) return;

        setTickers(prev => prev.map(t => {
          // Batch response: if multiple symbols, data is keyed by symbol
          // If single symbol, data has .price directly
          const entry = data[t.symbol] ?? data;
          if (entry?.price) {
            return { ...t, prev: t.price, price: parseFloat(entry.price).toFixed(2) };
          }
          return t;
        }));
      } catch { /* ignore */ }
    }

    fetchAll();

    // WebSocket for live XAU/USD ticks
    let ws: WebSocket;
    function connectWs() {
      if (dead) return;
      ws = new WebSocket(`wss://ws.twelvedata.com/v1/quotes/price?apikey=${API_KEY}`);
      ws.onopen = () => ws.send(JSON.stringify({ action: 'subscribe', params: { symbols: 'XAU/USD' } }));
      ws.onmessage = ev => {
        const m = JSON.parse(ev.data);
        if (m.event === 'price' && m.price) {
          setTickers(prev => prev.map(t =>
            t.symbol === 'XAU/USD' ? { ...t, prev: t.price, price: parseFloat(m.price).toFixed(2) } : t
          ));
        }
      };
      ws.onclose = () => { if (!dead) setTimeout(connectWs, 5000); };
    }
    connectWs();

    const poll = setInterval(fetchAll, 30_000);
    return () => {
      dead = true;
      clearInterval(poll);
      if (ws) ws.close();
    };
  }, []);

  const borderColor = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)';
  const labelColor  = dark ? '#4a5568' : '#718096';
  const priceColor  = dark ? '#e0e6ed' : '#0a0e17';

  // Always show all tickers — show skeleton for loading ones
  return (
    <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginTop: '64px', paddingTop: '40px', borderTop: `1px solid ${borderColor}`, flexWrap: 'wrap' }}>
      {tickers.map(({ symbol, label, prefix, price, prev }) => {
        const isUp = price && prev ? parseFloat(price) >= parseFloat(prev) : true;
        const chg  = price && prev
          ? (((parseFloat(price) - parseFloat(prev)) / parseFloat(prev)) * 100).toFixed(2)
          : null;

        return (
          <div key={symbol} style={{ textAlign: 'left', minWidth: '80px' }}>
            <div style={{ fontSize: '10px', color: labelColor, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: priceColor, fontFamily: "'Chakra Petch',sans-serif", letterSpacing: '-0.01em' }}>
              {price
                ? `${prefix}${parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                : <span style={{ opacity: 0.25, fontSize: '13px' }}>—</span>}
            </div>
            <div style={{ fontSize: '11px', fontWeight: 500, color: chg ? (isUp ? '#22c55e' : '#ef4444') : 'transparent', marginTop: '2px' }}>
              {chg ? `${isUp ? '+' : ''}${chg}%` : '—'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
