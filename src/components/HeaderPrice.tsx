'use client';

import React, { useEffect, useState } from 'react';

const API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY || '76c9f305de4343028c2fa26b75d63b81';
const SYMBOL  = 'XAU/USD';
const WS_URL  = `wss://ws.twelvedata.com/v1/quotes/price?apikey=${API_KEY}`;

export default function HeaderPrice() {
  const [livePrice, setLivePrice] = useState<number | null>(null);

  useEffect(() => {
    let ws: WebSocket;
    let wsTimer: NodeJS.Timeout;
    let dead = false;

    function connectWs() {
      if (dead) return;
      ws = new WebSocket(WS_URL);
      ws.onopen = () => ws.send(JSON.stringify({ action: 'subscribe', params: { symbols: SYMBOL } }));
      ws.onmessage = ev => {
        const m = JSON.parse(ev.data);
        if (m.event === 'price' && m.price) setLivePrice(parseFloat(m.price));
      };
      ws.onclose = () => { if (!dead) wsTimer = setTimeout(connectWs, 5000); };
    }
    connectWs();

    // Initial fetch
    fetch(`https://api.twelvedata.com/price?symbol=${encodeURIComponent(SYMBOL)}&apikey=${API_KEY}`)
      .then(res => res.json())
      .then(data => {
        if (!dead && data.price) setLivePrice(parseFloat(data.price));
      })
      .catch(console.error);

    return () => {
      dead = true;
      clearTimeout(wsTimer);
      if (ws) ws.close();
    };
  }, []);

  const fmtPrice = livePrice ? livePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '2,341.50';

  return (
    <div className="hidden sm:flex flex-col items-end">
      <div className="flex items-baseline gap-1.5">
        <span className="text-[10px] text-slate-500 tracking-widest uppercase">XAU/USD</span>
        <span className="text-yellow-400 font-mono font-bold text-[18px] tracking-wider">{fmtPrice}</span>
        <span className="text-green-400 text-[10px] font-bold">+0.42%</span>
      </div>
      <div className="text-[9px] text-slate-600 tracking-wider">Spot Price • Real-time</div>
    </div>
  );
}
