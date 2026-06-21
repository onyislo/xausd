/**
 * 📊 Price Store Hook - Real-time price state management
 * Manages live prices, correlations, and UI updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { MultiDataSourceManager, PriceData } from '@/lib/websocket/DataSources';

interface PriceState {
  symbol: string;
  price: number;
  bid?: number;
  ask?: number;
  volume?: number;
  change: number;
  changePercent: number;
  lastUpdate: number;
  source: string;
  isLive: boolean;
}

interface CorrelationData {
  goldPrice: number;
  usdIndex: number;
  correlation: number;
  strength: 'strong_positive' | 'weak_positive' | 'neutral' | 'weak_negative' | 'strong_negative';
  timestamp: number;
}

interface ConnectionStatus {
  status: 'connected' | 'connecting' | 'error';
  connectedSources: number;
  totalSources: number;
  lastUpdate?: Date;
}

export function usePriceStore() {
  // 📊 Price States
  const [prices, setPrices] = useState<Record<string, PriceState>>({});
  const [correlation, setCorrelation] = useState<CorrelationData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'connecting',
    connectedSources: 0,
    totalSources: 0,
  });

  // 🔌 WebSocket Manager
  const dataManager = useRef<MultiDataSourceManager | null>(null);
  const priceHistory = useRef<Record<string, number[]>>({});

  // Initialize data sources
  useEffect(() => {
    dataManager.current = new MultiDataSourceManager();

    // Initialize sources (demo mode for now)
    const apiKeys = {
      finnhub: process.env.NEXT_PUBLIC_FINNHUB_KEY,
      polygon: process.env.NEXT_PUBLIC_POLYGON_KEY,
    };

    dataManager.current.initializeGoldSources(apiKeys);
    dataManager.current.initializeUSDSources(apiKeys);
    dataManager.current.initializeMajorPairs();

    // Set up price data listener
    dataManager.current.onPrice(handlePriceUpdate);
    
    // Set up connection status listener
    dataManager.current.onStatus(handleStatusUpdate);

    // Connect to all sources
    dataManager.current.connectAll();

    // Cleanup on unmount
    return () => {
      if (dataManager.current) {
        dataManager.current.disconnectAll();
      }
    };
  }, []);

  // 📈 Handle incoming price data
  const handlePriceUpdate = useCallback((data: PriceData) => {
    setPrices(prevPrices => {
      const prevPrice = prevPrices[data.symbol];
      const change = prevPrice ? data.price - prevPrice.price : 0;
      const changePercent = prevPrice && prevPrice.price > 0 
        ? (change / prevPrice.price) * 100 
        : 0;

      // Update price history for correlation
      if (!priceHistory.current[data.symbol]) {
        priceHistory.current[data.symbol] = [];
      }
      priceHistory.current[data.symbol].push(data.price);
      
      // Keep only last 100 prices for correlation calculation
      if (priceHistory.current[data.symbol].length > 100) {
        priceHistory.current[data.symbol] = priceHistory.current[data.symbol].slice(-100);
      }

      const newPriceState: PriceState = {
        symbol: data.symbol,
        price: data.price,
        bid: data.bid,
        ask: data.ask,
        volume: data.volume,
        change,
        changePercent,
        lastUpdate: data.timestamp,
        source: data.source,
        isLive: true,
      };

      return {
        ...prevPrices,
        [data.symbol]: newPriceState,
      };
    });

    // Calculate correlation when both Gold and USD data available
    updateCorrelation();
  }, []);

  // 🔗 Calculate Gold-USD correlation
  const updateCorrelation = useCallback(() => {
    const goldHistory = priceHistory.current['XAU/USD'];
    const usdHistory = priceHistory.current['DXY'];

    if (goldHistory && usdHistory && goldHistory.length >= 10 && usdHistory.length >= 10) {
      const correlation = calculateCorrelation(goldHistory, usdHistory);
      const strength = getCorrelationStrength(correlation);
      
      const currentGoldPrice = prices['XAU/USD']?.price || 0;
      const currentUsdIndex = prices['DXY']?.price || 0;

      setCorrelation({
        goldPrice: currentGoldPrice,
        usdIndex: currentUsdIndex,
        correlation,
        strength,
        timestamp: Date.now(),
      });
    }
  }, [prices]);

  // 📊 Connection status updates
  const handleStatusUpdate = useCallback((status: { source: string; status: string }) => {
    if (dataManager.current) {
      const connectedSources = dataManager.current.getConnectedSources().length;
      const totalSources = dataManager.current.getSourceCount();
      
      setConnectionStatus(prev => ({
        ...prev,
        connectedSources,
        totalSources,
        status: connectedSources > 0 ? 'connected' : 'connecting',
        lastUpdate: new Date(),
      }));
    }
  }, []);

  // 🧮 Correlation calculation helper
  const calculateCorrelation = (x: number[], y: number[]): number => {
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;

    const xSlice = x.slice(-n);
    const ySlice = y.slice(-n);

    const xMean = xSlice.reduce((sum, val) => sum + val, 0) / n;
    const yMean = ySlice.reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let xSumSq = 0;
    let ySumSq = 0;

    for (let i = 0; i < n; i++) {
      const xDiff = xSlice[i] - xMean;
      const yDiff = ySlice[i] - yMean;
      
      numerator += xDiff * yDiff;
      xSumSq += xDiff * xDiff;
      ySumSq += yDiff * yDiff;
    }

    const denominator = Math.sqrt(xSumSq * ySumSq);
    return denominator === 0 ? 0 : numerator / denominator;
  };

  // 💪 Get correlation strength label
  const getCorrelationStrength = (correlation: number): CorrelationData['strength'] => {
    const abs = Math.abs(correlation);
    if (abs >= 0.7) return correlation > 0 ? 'strong_positive' : 'strong_negative';
    if (abs >= 0.3) return correlation > 0 ? 'weak_positive' : 'weak_negative';
    return 'neutral';
  };

  // 🎯 Get specific price data
  const getPrice = useCallback((symbol: string): PriceState | null => {
    return prices[symbol] || null;
  }, [prices]);

  // 📊 Get formatted price change
  const getFormattedChange = useCallback((symbol: string): { 
    change: string; 
    changePercent: string; 
    isPositive: boolean;
    isNegative: boolean;
  } => {
    const price = getPrice(symbol);
    if (!price) {
      return { change: '0.00', changePercent: '0.00%', isPositive: false, isNegative: false };
    }

    const isPositive = price.change > 0;
    const isNegative = price.change < 0;

    return {
      change: price.change.toFixed(2),
      changePercent: `${price.changePercent.toFixed(2)}%`,
      isPositive,
      isNegative,
    };
  }, [getPrice]);

  return {
    // 📊 Price Data
    prices,
    correlation,
    
    // 🔌 Connection Status
    connectionStatus,
    
    // 🎯 Helper Methods
    getPrice,
    getFormattedChange,
    
    // 📈 Specific Instruments
    goldPrice: getPrice('XAU/USD'),
    usdIndex: getPrice('DXY'),
    
    // 🌍 Major Pairs
    eurUsd: getPrice('EUR/USD'),
    gbpUsd: getPrice('GBP/USD'),
    usdJpy: getPrice('USD/JPY'),
  };
}