/**
 * 🔗 Correlation Card - Gold vs USD relationship display
 * Shows real-time correlation strength and direction
 */

import React from 'react';
import { TrendingUp, TrendingDown, RotateCcw, Zap, Activity } from 'lucide-react';

interface CorrelationCardProps {
  goldPrice: number;
  usdIndex: number;
  correlation: number;
  strength: 'strong_positive' | 'weak_positive' | 'neutral' | 'weak_negative' | 'strong_negative';
  timestamp: number;
}

export default function CorrelationCard({
  goldPrice,
  usdIndex,
  correlation,
  strength,
  timestamp,
}: CorrelationCardProps) {
  
  // Get correlation display properties
  const getCorrelationStyle = () => {
    switch (strength) {
      case 'strong_positive':
        return {
          color: 'text-green-400',
          bg: 'bg-green-500/10',
          border: 'border-green-500/20',
          label: 'STRONG POSITIVE',
          icon: TrendingUp,
          description: 'Gold and USD moving together',
        };
      case 'weak_positive':
        return {
          color: 'text-green-400/70',
          bg: 'bg-green-500/5',
          border: 'border-green-500/10',
          label: 'WEAK POSITIVE',
          icon: TrendingUp,
          description: 'Slight positive correlation',
        };
      case 'strong_negative':
        return {
          color: 'text-red-400',
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          label: 'STRONG NEGATIVE',
          icon: TrendingDown,
          description: 'Gold and USD moving opposite',
        };
      case 'weak_negative':
        return {
          color: 'text-red-400/70',
          bg: 'bg-red-500/5',
          border: 'border-red-500/10',
          label: 'WEAK NEGATIVE',
          icon: TrendingDown,
          description: 'Slight negative correlation',
        };
      default:
        return {
          color: 'text-slate-400',
          bg: 'bg-slate-500/5',
          border: 'border-slate-500/10',
          label: 'NEUTRAL',
          icon: RotateCcw,
          description: 'No clear correlation',
        };
    }
  };

  const style = getCorrelationStyle();
  const Icon = style.icon;
  const timeSinceUpdate = Math.floor((Date.now() - timestamp) / 1000);

  // Format correlation as percentage
  const correlationPercent = (correlation * 100).toFixed(1);
  
  // Get correlation bar width (absolute value)
  const barWidth = Math.abs(correlation) * 100;

  return (
    <div className="relative rounded-xl border border-slate-800/50 bg-gradient-to-br from-slate-900/30 to-slate-950/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-slate-700/70 shadow-[0_0_20px_rgba(0,0,0,0.1)]">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider">
            Gold-USD Correlation
          </h3>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_4px_rgba(59,130,246,0.6)]" />
          <span className="text-[8px] text-blue-400 font-bold tracking-wider uppercase">LIVE</span>
        </div>
      </div>

      {/* Main Correlation Display */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-3">
          {/* Correlation Value */}
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold font-mono ${style.color}`}>
              {correlation >= 0 ? '+' : ''}{correlationPercent}%
            </span>
            <Icon size={20} className={style.color} />
          </div>
          
          {/* Strength Label */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${style.bg} ${style.border} ${style.color} border`}>
            <span>{style.label}</span>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-xs text-slate-500 mt-1">{style.description}</p>
      </div>

      {/* Correlation Bar Visualization */}
      <div className="px-4 pb-3">
        <div className="relative h-2 bg-slate-800/50 rounded-full overflow-hidden">
          {/* Center line */}
          <div className="absolute left-1/2 top-0 w-[1px] h-full bg-slate-600 transform -translate-x-0.5" />
          
          {/* Correlation bar */}
          <div 
            className={`absolute top-0 h-full transition-all duration-500 ${
              correlation >= 0 
                ? `${style.bg.replace('/10', '/30')} left-1/2` 
                : `${style.bg.replace('/10', '/30')} right-1/2`
            }`}
            style={{ width: `${barWidth / 2}%` }}
          />
        </div>
        
        {/* Scale labels */}
        <div className="flex justify-between text-[8px] text-slate-600 font-mono mt-1">
          <span>-100%</span>
          <span>0%</span>
          <span>+100%</span>
        </div>
      </div>

      {/* Current Prices Display */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Gold Price */}
          <div className="text-center p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
            <div className="text-[8px] text-yellow-500/80 font-bold uppercase tracking-wider mb-1">
              XAU/USD
            </div>
            <div className="text-yellow-400 font-mono font-bold">
              ${goldPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          
          {/* USD Index */}
          <div className="text-center p-2 rounded-lg bg-green-500/5 border border-green-500/10">
            <div className="text-[8px] text-green-500/80 font-bold uppercase tracking-wider mb-1">
              DXY
            </div>
            <div className="text-green-400 font-mono font-bold">
              {usdIndex.toFixed(3)}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 border-t border-slate-800/40 bg-slate-900/30">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Activity size={10} className="text-slate-500" />
              <span className="text-slate-500 font-bold">CORRELATION:</span>
              <span className="text-slate-300 font-mono">Real-time</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap size={10} className="text-slate-500" />
              <span className="text-slate-500 font-bold">WINDOW:</span>
              <span className="text-slate-300 font-mono">100 ticks</span>
            </div>
          </div>
          
          <div className="text-slate-600 font-mono">
            {timeSinceUpdate < 60 ? `${timeSinceUpdate}s` : `${Math.floor(timeSinceUpdate / 60)}m`} ago
          </div>
        </div>
      </div>

      {/* Live Update Animation */}
      <div className="absolute inset-0 rounded-xl border border-white/5 animate-pulse opacity-30" />
    </div>
  );
}