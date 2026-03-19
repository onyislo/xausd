import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { createChart, ColorType, AreaSeries } from 'lightweight-charts';
import { Maximize2, X, ChevronLeft } from 'lucide-react';

interface PriceChartProps {
  isStandalone?: boolean;
}

export default function PriceChart({ isStandalone = false }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#8a9bb2',
        fontSize: isStandalone ? 12 : 10,
        fontFamily: "'Chakra Petch', sans-serif",
      },
      grid: {
        vertLines: { color: 'rgba(42, 52, 65, 0.05)' },
        horzLines: { color: 'rgba(42, 52, 65, 0.05)' },
      },
      width: chartContainerRef.current.clientWidth || 500,
      height: isStandalone ? window.innerHeight - 100 : 200,
      timeScale: {
        borderColor: 'rgba(42, 52, 65, 0.1)',
        visible: true,
      },
    });

    // Handle v5 API compatibility
    // @ts-expect-error – v5 addSeries API
    const series = chart.addSeries(AreaSeries, {
      lineColor: '#f5c451',
      topColor: 'rgba(245, 196, 81, 0.3)',
      bottomColor: 'rgba(245, 196, 81, 0)',
      lineWidth: 2,
    });

    if (!series) {
      chart.remove();
      return;
    }

    // Historical dynamic data starting earlier
    let lastTime = 1684108800;
    let lastPrice = 2341.5;
    const initialData = [
        { time: 1682899200, value: 1980.5 },
        { time: 1682985600, value: 1992.1 },
        { time: 1683072000, value: 1985.3 },
        { time: 1683158400, value: 2008.2 },
        { time: 1683244800, value: 2015.1 },
        { time: 1683331200, value: 2030.5 },
        { time: 1683417600, value: 2025.4 },
        { time: 1683504000, value: 2045.6 },
        { time: 1683590400, value: 2060.2 },
        { time: 1683676800, value: 2055.1 },
        { time: 1683763200, value: 2080.3 },
        { time: 1683849600, value: 2105.7 },
        { time: 1683936000, value: 2150.2 },
        { time: 1684022400, value: 2240.5 },
        { time: lastTime, value: lastPrice },
    ];

    // @ts-expect-error – v5 setData API
    series.setData(initialData);
    chart.timeScale().fitContent();

    // SIMULATED LIVE FEED: Push update every 5 seconds
    const interval = setInterval(() => {
        const change = (Math.random() - 0.5) * 4; // +/- 2.0 price move
        lastPrice = parseFloat((lastPrice + change).toFixed(2));
        lastTime += 60; // Advance time by 1 minute for each update in this simulation
        
        // @ts-expect-error – v5 update API
        series.update({ time: lastTime, value: lastPrice });
    }, 5000);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth,
          height: isStandalone ? window.innerHeight - 100 : 200
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [mounted, isStandalone]);

  return (
    <div className={`panel border-yellow-500/20 bg-slate-900/40 rounded-lg overflow-hidden flex flex-col relative group transition-all duration-300 ${
      isStandalone ? 'fixed inset-0 z-[9999] bg-[#0a0e17] rounded-none border-none' : 'h-full'
    }`}>
      <div className={`px-4 py-2 flex justify-between items-center border-b border-yellow-500/10 bg-slate-800/80 shrink-0 ${
        isStandalone ? 'h-14' : ''
      }`}>
        <div className="flex items-center gap-3">
          {isStandalone && (
            <Link 
              href="/" 
              className="p-1.5 hover:bg-slate-700/50 rounded-full transition-colors text-slate-400 hover:text-yellow-500 mr-1"
              title="Return to Dashboard"
            >
              <ChevronLeft size={20} />
            </Link>
          )}
          <h2 className={`${isStandalone ? 'text-[14px]' : 'text-[10px]'} text-yellow-500 font-bold uppercase tracking-widest leading-none`}>
            XAU/USD Live Analysis
          </h2>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className={`flex gap-3 font-bold text-slate-500 tracking-tighter ${isStandalone ? 'text-[11px]' : 'text-[8px]'}`}>
              <span className="text-yellow-500 font-black cursor-pointer">1D</span>
              <span className="hover:text-slate-300 cursor-pointer transition-colors">1W</span>
              <span className="hover:text-slate-300 cursor-pointer transition-colors">1M</span>
          </div>
          
          {!isStandalone && (
            <Link 
              href="/chart"
              className="text-slate-500 hover:text-yellow-500 transition-colors p-1 flex items-center gap-1"
              title="Expand to Full View"
            >
              <span className="text-[8px] font-bold uppercase tracking-widest hidden group-hover:block">Analyze</span>
              <Maximize2 size={12} />
            </Link>
          )}

          {isStandalone && (
             <Link 
                href="/"
                className="text-slate-500 hover:text-red-400 transition-colors p-1"
                title="Close Analysis"
             >
               <X size={20} />
             </Link>
          )}
        </div>
      </div>
      
      <div className={`flex-1 relative min-h-0 bg-slate-900/20 ${isStandalone ? 'p-4' : 'p-1'}`}>
        <style jsx global>{`
          .tv-lightweight-charts-logo { display: none !important; }
        `}</style>
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>

      {isStandalone && (
        <div className="absolute bottom-4 right-4 text-[10px] text-slate-500/50 tracking-widest pointer-events-none uppercase">
          Geopolitical Gold • Tactical Terminal v2.4.1
        </div>
      )}
    </div>
  );
}
