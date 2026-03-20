'use client';
import { useEffect, useState } from 'react';

const API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY || '76c9f305de4343028c2fa26b75d63b81';

interface Ticker {
  symbol: string;
  label: string;
  price: string | null;
  prev: string | null;
}

const SYMBOLS = [
  { symbol: 'XAU/USD', label: 'XAU/USD' },
  { symbol: 'DX-Y.NYB', label: 'DXY' },
  { symbol: 'US10Y',    label: 'US10Y' },
];

export default function LiveTicker() {
  const [tickers, setTickers] = useState<Ticker[]>(
    SYMBOLS.map(s => ({ ...s, price: null, prev: null }))
  );

  useEffect(() => {
    let dead = false;

    // Fetch all prices via REST on mount
    async function fetchAll() {
      await Promise.all(SYMBOLS.map(async ({ symbol, label }) => {
        try {
          const res = await fetch(
            `https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbol)}&apikey=${API_KEY}`
          );
          const data = await res.json();
          if (!dead && data.price) {
            setTickers(prev => prev.map(t =>
              t.symbol === symbol ? { ...t, prev: t.price, price: parseFloat(data.price).toFixed(2) } : t
            ));
          }
        } catch { /* silently ignore */ }
      }));
    }

    fetchAll();

    // WebSocket for live XAU/USD
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

    // Poll DXY + US10Y every 30s (no WS stream on free tier)
    const poll = setInterval(fetchAll, 30_000);

    return () => {
      dead = true;
      clearInterval(poll);
      if (ws) ws.close();
    };
  }, []);

  return (
    <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', marginTop: '64px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
      {tickers.map(({ symbol, label, price, prev }) => {
        const isUp = price && prev ? parseFloat(price) >= parseFloat(prev) : true;
        const chg = price && prev
          ? (((parseFloat(price) - parseFloat(prev)) / parseFloat(prev)) * 100).toFixed(2)
          : null;

        return (
          <div key={symbol} style={{ textAlign: 'left', minWidth: '90px' }}>
            <div style={{ fontSize: '10px', color: '#4a5568', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: '#e0e6ed', fontFamily: "'Chakra Petch',sans-serif", letterSpacing: '-0.01em', transition: 'color 0.3s' }}>
              {price
                ? (symbol === 'XAU/USD' ? `$${parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : price)
                : <span style={{ opacity: 0.3, fontSize: '13px' }}>Loading…</span>}
            </div>
            <div style={{ fontSize: '11px', fontWeight: 500, color: isUp ? '#22c55e' : '#ef4444', marginTop: '2px' }}>
              {chg ? `${isUp ? '+' : ''}${chg}%` : <span style={{ opacity: 0.3 }}>—</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
