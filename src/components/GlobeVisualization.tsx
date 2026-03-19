'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import react-globe.gl to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

export default function GlobeVisualization() {
  const globeRef = useRef<React.ElementRef<typeof Globe> | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      // Optional: Setup auto-rotation
      // @ts-expect-error globe library types are missing this property
      globeRef.current.controls().autoRotate = true;
      // @ts-expect-error globe library types are missing this property
      globeRef.current.controls().autoRotateSpeed = 0.5;
      // Point to Europe/Africa roughly
      // @ts-expect-error globe library types are missing this property
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2 });
    }
  }, [mounted]);

  // Mock data for nodes (mines/banks)
  const nodes = [
    { lat: 10, lng: 10, size: 20, color: '#f5c451', name: 'Gold Mine Alpha' }, // Africa
    { lat: -25, lng: 135, size: 15, color: '#f5c451', name: 'Aussie Mine' }, // Australia
    { lat: 40, lng: -100, size: 25, color: '#f5c451', name: 'Nevada Operations' }, // US
    { lat: 55, lng: 55, size: 18, color: '#ef4444', name: 'Central Bank Russia' }, // Russia (Threat)
    { lat: 35, lng: 105, size: 22, color: '#3b82f6', name: 'PBOC Vault' }, // China
  ];

  // Mock data for arcs (news/trade flows)
  const arcs = [
    { startLat: 10, startLng: 10, endLat: 55, endLng: 55, color: ['#f5c451', '#ef4444'] },
    { startLat: 35, startLng: 105, endLat: 55, endLng: 55, color: ['#3b82f6', '#ef4444'] },
    { startLat: -25, startLng: 135, endLat: 35, endLng: 105, color: ['#f5c451', '#3b82f6'] },
  ];

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center relative z-0">
        <div className="w-[280px] h-[280px] rounded-full border border-blue-500/20 blur-sm animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative z-0 h-full w-full overflow-hidden">

      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-[280px] h-[280px] bg-blue-900/20 rounded-full blur-[70px]"></div>
      </div>

      {/* Globe Container */}
      <div className="w-full h-full flex items-center justify-center relative z-10 cursor-move">
        <Globe
          ref={globeRef}
          width={280}
          height={280}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"

          // Arcs connecting nodes
          arcsData={arcs}
          arcColor="color"
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={2000}
          arcAltitudeAutoScale={0.2}

          // Points of interest
          pointsData={nodes}
          pointColor="color"
          pointAltitude={0.05}
          pointRadius="size"
          pointsMerge={false}
          pointResolution={32}

          // Custom styling for rings/pulse
          ringsData={nodes}
          ringColor={() => '#3b82f6'}
          ringMaxRadius={5}
          ringPropagationSpeed={2}
          ringRepeatPeriod={1000}
        />
      </div>

      {/* Toolbar floating above globe */}
      <div className="absolute bottom-2 z-20 flex flex-col items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-900/80 border border-blue-500/30 rounded-lg p-1 backdrop-blur">
          <button className="w-6 h-6 flex items-center justify-center text-blue-400 hover:text-white hover:bg-slate-800 rounded">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </button>
          <button className="w-6 h-6 flex items-center justify-center text-blue-400 hover:text-white hover:bg-slate-800 rounded">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          </button>
          <button className="w-6 h-6 flex items-center justify-center text-blue-400 hover:text-white hover:bg-slate-800 rounded">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
          </button>
          <div className="w-px h-4 bg-slate-700 mx-1"></div>
          <button className="w-6 h-6 flex items-center justify-center text-yellow-500 bg-yellow-500/10 border border-yellow-500/50 rounded">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
          </button>
        </div>

        <button className="text-blue-400 text-[8px] font-bold border border-blue-500/40 bg-slate-900/80 px-3 py-1 rounded-full hover:bg-blue-900/50 hover:text-white transition-colors">
          RESET VIEW
        </button>
      </div>
    </div>
  );
}
