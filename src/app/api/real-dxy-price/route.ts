/**
 * 💵 REAL DXY Price from Twelve Data + other sources
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    let dxyPrice = null;
    let source = '';

    // Method 1: Yahoo Finance DXY (Original way)
    try {
      const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/DX-Y.NYB');
      const data = await response.json();
      
      if (data.chart?.result?.[0]?.meta?.regularMarketPrice) {
        dxyPrice = data.chart.result[0].meta.regularMarketPrice;
        source = 'Yahoo Finance';
      }
    } catch (e) {
      console.log('Yahoo DXY failed');
    }

    // Method 2: Yahoo Finance DXY
    if (!dxyPrice) {
      try {
        const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/DX-Y.NYB');
        const data = await response.json();
        
        if (data.chart?.result?.[0]?.meta?.regularMarketPrice) {
          dxyPrice = data.chart.result[0].meta.regularMarketPrice;
          source = 'Yahoo Finance';
        }
      } catch (e) {
        console.log('Yahoo DXY failed');
      }
    }

    if (!dxyPrice) {
      throw new Error('All DXY sources failed');
    }

    return NextResponse.json({
      success: true,
      symbol: 'DXY',
      price: Math.round(dxyPrice * 1000) / 1000,
      source: source,
      timestamp: Date.now()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'DXY price fetch failed'
    }, { status: 500 });
  }
}