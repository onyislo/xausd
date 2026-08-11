/**
 * 🥇 Real Gold Prices from Yahoo Finance
 * Fetches live XAU/USD and GC=F (Gold Futures) prices
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'GC=F'; // Gold Futures

  try {
    // Yahoo Finance API (free, no key required)
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    
    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result) {
      throw new Error('No data from Yahoo Finance');
    }

    // Extract current price data
    const meta = result.meta;
    const currentPrice = meta.regularMarketPrice || meta.previousClose;
    const change = meta.regularMarketPrice - meta.previousClose;
    const changePercent = (change / meta.previousClose) * 100;

    // Get bid/ask if available
    const quote = result.indicators?.quote?.[0];
    const latestIndex = quote?.close?.length - 1;

    return NextResponse.json({
      success: true,
      symbol: symbol,
      price: currentPrice,
      bid: meta.bid || (currentPrice * 0.999), // Estimate if not available
      ask: meta.ask || (currentPrice * 1.001), // Estimate if not available  
      change: change,
      changePercent: changePercent,
      volume: meta.regularMarketVolume,
      timestamp: Date.now(),
      source: 'Yahoo Finance',
      marketState: meta.marketState,
      currency: meta.currency,
    });

  } catch (error) {
    console.error('Yahoo Finance API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch real gold price',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}