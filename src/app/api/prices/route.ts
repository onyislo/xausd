/**
 * Multi-instrument price feed
 * XAU/USD · DXY · USD/JPY · WTI Crude Oil
 * Source: Yahoo Finance (no API key required)
 */
import { NextResponse } from 'next/server';

interface InstrumentPrice {
  symbol: string;
  label: string;
  price: number;
  change: number;
  changePercent: number;
  prevClose: number;
}

const YAHOO_SYMBOLS: Record<string, { label: string; yahooTicker: string }> = {
  'XAU/USD': { label: 'Gold',    yahooTicker: 'GC=F'      },
  'DXY':     { label: 'USD',     yahooTicker: 'DX-Y.NYB'  },
  'USD/JPY': { label: 'USD/JPY', yahooTicker: 'USDJPY=X'  },
  'WTI':     { label: 'Oil WTI', yahooTicker: 'CL=F'      },
};

async function fetchYahoo(ticker: string): Promise<{ price: number; change: number; changePercent: number; prevClose: number } | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1m&range=1d`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
    next: { revalidate: 15 }, // cache 15s on edge
  });

  if (!res.ok) return null;
  const data = await res.json();
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta?.regularMarketPrice) return null;

  const price      = meta.regularMarketPrice as number;
  const prevClose  = (meta.chartPreviousClose ?? meta.previousClose ?? price) as number;
  const change     = price - prevClose;
  const changePct  = prevClose > 0 ? (change / prevClose) * 100 : 0;

  return {
    price,
    change:        Math.round(change * 1000) / 1000,
    changePercent: Math.round(changePct * 100) / 100,
    prevClose,
  };
}

export async function GET() {
  const results: InstrumentPrice[] = [];
  const errors: string[] = [];

  await Promise.allSettled(
    Object.entries(YAHOO_SYMBOLS).map(async ([symbol, { label, yahooTicker }]) => {
      const data = await fetchYahoo(yahooTicker);
      if (data) {
        results.push({ symbol, label, ...data });
      } else {
        errors.push(symbol);
      }
    })
  );

  // Sort in preferred display order
  const ORDER = ['XAU/USD', 'DXY', 'USD/JPY', 'WTI'];
  results.sort((a, b) => ORDER.indexOf(a.symbol) - ORDER.indexOf(b.symbol));

  return NextResponse.json({
    success: true,
    prices: results,
    errors,
    fetchedAt: new Date().toISOString(),
  });
}
