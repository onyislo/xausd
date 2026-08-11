/**
 * 💰 Price Card - Real-time price display component
 * Clean, animated price cards for Gold and USD
 */

import React from 'react';
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';

interface PriceCardProps {
  symbol: string;
  title: string;
  price: number;
  change: number;
  changePercent: number;
  bid?: number;
  ask?: number;
  volume?: number;
  isLive: boolean;
  source: string;
  lastUpdate: number;
  className?: string;
}

export default function PriceCard({
  symbol,
  title,
  price,
  change,
  changePercent,
  bid,
  ask,
  volume,
  isLive,
  source,
  lastUpdate,
  className = '',
}: PriceCardProps) {
  const isPositive = change > 0;
  const isNegative = change < 0;
  
  // Format price based on instrument
  const formatPrice = (value: number): string => {
    if (symbol === 'XAU/USD') {
      return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (symbol === 'DXY') {
      return value.toFixed(3);
    }
    return value.toFixed(4);
  };

  // Get card colors based on instrument
  const getCardStyle = () => {
    if (symbol === 'XAU/USD') {
      return {
        gradient: 'from-yellow-500/10 to-amber-600/5',
        border: 'border-yellow-500/20',
        accent: 'text-yellow-400',
        glow: 'shadow-[0_0_20px_rgba(245,196,81,0.1)]',
      };
    }
    if (symbol === 'DXY') {
      return {
        gradient: 'from-green-500/10 to-emerald-600/5',
        border: 'border-green-500/20',
        accent: 'text-green-400',
        glow: 'shadow-[0_0_20px_rgba(34,197,94,0.1)]',
      };
    }
    return {
      gradient: 'from-blue-500/10 to-cyan-600/5',
      border: 'border-blue-500/20',
      accent: 'text-blue-400',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.1)]',
    };
  };

  const cardStyle = getCardStyle();
  const timeSinceUpdate = Math.floor((Date.now() - lastUpdate) / 1000);

  return (
    <div className={`
      relative rounded-xl border bg-gradient-to-br backdrop-blur-sm
      ${cardStyle.border} ${cardStyle.gradient} ${cardStyle.glow}
      transition-all duration-300 hover:scale-[1.02] hover:${cardStyle.border.replace('/20', '/40')}
      ${className}
    `}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider">
            {title}
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {symbol}
          </span>
        </div>
        
        {/* Live Status */}
        <div className="flex items-center gap-1">
          {isLive ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_4px_rgba(239,68,68,0.6)]" />
              <span className="text-[8px] text-red-400 font-bold tracking-wider uppercase">LIVE</span>
            </>
          ) : (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span className="text-[8px] text-slate-500 font-bold tracking-wider uppercase">DELAYED</span>
            </>
          )}
        </div>
      </div>

      {/* Main Price */}
      <div className="px-4 pb-1">
        <div className="flex items-end gap-2">
          <span className={`text-2xl font-bold ${cardStyle.accent} font-mono`}>
            {formatPrice(price)}
          </span>
          
          {/* Price Change */}
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${
            isPositive 
              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
              : isNegative 
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
          }`}>
            {isPositive ? (
              <TrendingUp size={10} />
            ) : isNegative ? (
              <TrendingDown size={10} />
            ) : (
              <Activity size={10} />
            )}
            <span>{change >= 0 ? '+' : ''}{change.toFixed(2)}</span>
            <span>({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)</span>
          </div>
        </div>
      </div>

      {/* Bid/Ask Spread */}
      {bid && ask && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-bold uppercase tracking-wider">BID</span>
              <span className="text-red-400 font-mono">{formatPrice(bid)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-bold uppercase tracking-wider">ASK</span>
              <span className="text-green-400 font-mono">{formatPrice(ask)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-bold uppercase tracking-wider">SPREAD</span>
              <span className="text-slate-300 font-mono">{formatPrice(ask - bid)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Volume & Source Info */}
      <div className="px-4 py-2 border-t border-slate-800/40 bg-slate-900/30">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            {volume && (
              <div className="flex items-center gap-1">
                <Activity size={10} className="text-slate-500" />
                <span className="text-slate-500 font-bold">VOL:</span>
                <span className="text-slate-300 font-mono">{volume.toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Zap size={10} className="text-slate-500" />
              <span className="text-slate-500 font-bold">SRC:</span>
              <span className="text-slate-300 font-mono">{source}</span>
            </div>
          </div>
          
          <div className="text-slate-600 font-mono">
            {timeSinceUpdate < 60 ? `${timeSinceUpdate}s` : `${Math.floor(timeSinceUpdate / 60)}m`} ago
          </div>
        </div>
      </div>

      {/* Pulse Animation for Live Updates */}
      {isLive && (
        <div className="absolute inset-0 rounded-xl border border-white/5 animate-pulse opacity-50" />
      )}
    </div>
  );
}