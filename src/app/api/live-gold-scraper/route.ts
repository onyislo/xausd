/**
 * 🥇 LIVE Gold Price Scraper - NO HARDCODED PRICES
 * Scrapes actual live gold prices from multiple sources
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    let goldPrice = null;
    let source = '';

    // Method 1: Alpha Vantage (Your local API key)
    try {
      const response = await fetch(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`);
      const data = await response.json();
      
      if (data['Realtime Currency Exchange Rate']) {
        goldPrice = parseFloat(data['Realtime Currency Exchange Rate']['5. Exchange Rate']);
        source = 'Alpha Vantage';
      }
    } catch (e) {
      console.log('Alpha Vantage failed');
    }

    // Method 2: Yahoo Finance (Free backup)
    if (!goldPrice) {
      try {
        const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/XAUUSD=X');
        const data = await response.json();
        
        if (data.chart?.result?.[0]?.meta?.regularMarketPrice) {
          goldPrice = data.chart.result[0].meta.regularMarketPrice;
          source = 'Yahoo Finance';
        }
      } catch (e) {
        console.log('Yahoo Finance failed');
      }
    }

    if (!goldPrice) {
      throw new Error('All real price sources failed');
    }

    return NextResponse.json({
      success: true,
      symbol: 'XAU/USD',
      price: Math.round(goldPrice * 100) / 100,
      bid: Math.round((goldPrice - 0.30) * 100) / 100,
      ask: Math.round((goldPrice + 0.30) * 100) / 100,
      source: source,
      timestamp: Date.now()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Real price fetch failed'
    }, { status: 500 });
  }
}