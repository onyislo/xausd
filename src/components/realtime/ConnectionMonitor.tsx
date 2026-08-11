/**
 * 🔌 Connection Monitor - WebSocket health display
 * Shows real-time connection status for all data sources
 */

import React, { useState, useEffect } from 'react';
import { 
  Wifi, WifiOff, RefreshCw, Zap, AlertTriangle, 
  Check, X, Clock, Activity, Globe 
} from 'lucide-react';

interface ConnectionInfo {
  name: string;
  status: 'connected' | 'connecting' | 'error' | 'disconnected';
  lastPing?: number;
  latency?: number;
  errorCount?: number;
  instrument: string;
  uptime?: number;
}

interface ConnectionMonitorProps {
  connections: ConnectionInfo[];
  totalSources: number;
  connectedSources: number;
  onReconnect?: (sourceName: string) => void;
  className?: string;
}

export default function ConnectionMonitor({
  connections,
  totalSources,
  connectedSources,
  onReconnect,
  className = '',
}: ConnectionMonitorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Update timer
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Overall health status
  const healthStatus = connectedSources === totalSources 
    ? 'excellent' 
    : connectedSources >= totalSources * 0.7
      ? 'good'
      : connectedSources > 0
        ? 'degraded'
        : 'critical';

  const getHealthStyle = (status: string) => {
    switch (status) {
      case 'excellent':
        return {
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
          text: 'text-green-400',
          icon: Check,
        };
      case 'good':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          text: 'text-yellow-400',
          icon: AlertTriangle,
        };
      case 'degraded':
        return {
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/30',
          text: 'text-orange-400',
          icon: AlertTriangle,
        };
      case 'critical':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          text: 'text-red-400',
          icon: X,
        };
      default:
        return {
          bg: 'bg-slate-500/10',
          border: 'border-slate-500/30',
          text: 'text-slate-400',
          icon: Activity,
        };
    }
  };

  const getConnectionStyle = (status: string) => {
    switch (status) {
      case 'connected':
        return {
          dot: 'bg-green-500 animate-pulse',
          text: 'text-green-400',
          bg: 'bg-green-500/5',
        };
      case 'connecting':
        return {
          dot: 'bg-yellow-500 animate-spin',
          text: 'text-yellow-400',
          bg: 'bg-yellow-500/5',
        };
      case 'error':
        return {
          dot: 'bg-red-500',
          text: 'text-red-400',
          bg: 'bg-red-500/5',
        };
      default:
        return {
          dot: 'bg-slate-500',
          text: 'text-slate-500',
          bg: 'bg-slate-500/5',
        };
    }
  };

  const healthStyle = getHealthStyle(healthStatus);
  const HealthIcon = healthStyle.icon;

  return (
    <div className={`rounded-lg border border-slate-800/50 bg-slate-900/30 backdrop-blur-sm ${className}`}>
      
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-slate-800/30 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg ${healthStyle.bg} border ${healthStyle.border}`}>
            <HealthIcon size={14} className={healthStyle.text} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Connection Health
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span className={healthStyle.text}>
                {connectedSources}/{totalSources} Sources Active
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-500">
                {healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Status Dots */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {connections.slice(0, 4).map((conn, i) => {
              const style = getConnectionStyle(conn.status);
              return (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${style.dot}`}
                  title={`${conn.name}: ${conn.status}`}
                />
              );
            })}
            {connections.length > 4 && (
              <span className="text-xs text-slate-600 ml-1">+{connections.length - 4}</span>
            )}
          </div>
          
          <RefreshCw 
            size={12} 
            className={`text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          />
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-slate-800/40 bg-slate-950/20">
          
          {/* Connection List */}
          <div className="p-3 space-y-2">
            {connections.map((conn, index) => {
              const style = getConnectionStyle(conn.status);
              const timeSincePing = conn.lastPing 
                ? Math.floor((lastUpdate - conn.lastPing) / 1000)
                : null;

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-2 rounded-lg border border-slate-800/40 ${style.bg}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${style.dot}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-200">
                          {conn.name}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800/50 text-slate-400">
                          {conn.instrument}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        <span className={style.text}>
                          {conn.status.toUpperCase()}
                        </span>
                        {conn.latency && (
                          <>
                            <span>•</span>
                            <span>{conn.latency}ms</span>
                          </>
                        )}
                        {conn.errorCount !== undefined && conn.errorCount > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-red-400">{conn.errorCount} errors</span>
                          </>
                        )}
                        {timeSincePing !== null && (
                          <>
                            <span>•</span>
                            <span>{timeSincePing}s ago</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  {conn.status === 'error' && onReconnect && (
                    <button
                      onClick={() => onReconnect(conn.name)}
                      className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-700/50 transition-all"
                      title="Reconnect"
                    >
                      <RefreshCw size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Stats Footer */}
          <div className="px-3 py-2 border-t border-slate-800/30 bg-slate-900/20">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Uptime</div>
                <div className="text-sm font-mono text-slate-300">
                  {((connectedSources / totalSources) * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Avg Latency</div>
                <div className="text-sm font-mono text-slate-300">
                  {connections.length > 0 
                    ? Math.round(
                        connections
                          .filter(c => c.latency)
                          .reduce((sum, c) => sum + (c.latency || 0), 0) / 
                        connections.filter(c => c.latency).length
                      ) || 0
                    : 0
                  }ms
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Last Check</div>
                <div className="text-sm font-mono text-slate-300">
                  {Math.floor((lastUpdate - Math.max(...connections.map(c => c.lastPing || 0))) / 1000)}s
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}