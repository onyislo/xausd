'use client';

import React, { useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line
} from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Mock data for gold reserves/tension
const markers = [
  { name: "Nevada Operations", coordinates: [-100, 40], value: 25, color: "#f5c451" },
  { name: "Gold Mine Alpha", coordinates: [10, 10], value: 20, color: "#f5c451" },
  { name: "Aussie Mine", coordinates: [135, -25], value: 15, color: "#f5c451" },
  { name: "Central Bank Russia", coordinates: [55, 55], value: 18, color: "#ef4444" },
  { name: "PBOC Vault", coordinates: [105, 35], value: 22, color: "#3b82f6" },
  { name: "Reserve Bank of India", coordinates: [77, 20], value: 19, color: "#3b82f6" },
  { name: "South Africa Mining Hub", coordinates: [24, -28], value: 21, color: "#f5c451" },
];

const corridors = [
  { from: [-100, 40], to: [105, 35] }, // USA to China
  { from: [-100, 40], to: [10, 10] },  // USA to Africa
  { from: [105, 35], to: [55, 55] },   // China to Russia
  { from: [135, -25], to: [105, 35] }, // Australia to China
];

const popScale = scaleLinear()
  .domain([10, 30])
  .range([2, 12]);

export default function FlatMapVisualization() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative z-0 h-full w-full overflow-hidden bg-black/40 rounded-xl border border-gold/10">
      
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-[80%] h-[60%] bg-gold/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Map Container */}
      <div className="w-full h-full flex items-center justify-center relative z-10 p-4">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 100,
            center: [0, 20]
          }}
          width={800}
          height={400}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }: { geographies: any[] }) =>
              (geographies || []).map((geo: any) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#0a0e17"
                  stroke="#f5c451"
                  strokeWidth={0.3}
                  strokeOpacity={0.2}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#161b22", outline: "none", strokeOpacity: 0.5 },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Gold Corridors */}
          {corridors.map((link, i) => (
            <Line
              key={i}
              from={link.from as [number, number]}
              to={link.to as [number, number]}
              stroke="#f5c451"
              strokeWidth={1}
              strokeDasharray="4 2"
              strokeOpacity={0.3}
            />
          ))}

          {/* Markers */}
          {markers.map(({ name, coordinates, value, color }) => (
            <Marker key={name} coordinates={coordinates as [number, number]}>
              <circle
                r={popScale(value)}
                fill={color}
                fillOpacity={0.6}
                stroke={color}
                strokeWidth={1}
                className="animate-pulse"
              />
              <text
                textAnchor="middle"
                y={-popScale(value) - 5}
                className="text-[8px] fill-gray-400 font-medium pointer-events-none"
                style={{ fontSize: "8px" }}
              >
                {name}
              </text>
            </Marker>
          ))}
        </ComposableMap>
      </div>

      {/* UI Elements Overlay */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-black/60 backdrop-blur-md border border-gold/30 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gold animate-pulse"></div>
            <span className="text-[10px] text-gold font-bold tracking-widest uppercase">Global Gold Intel</span>
          </div>
          <div className="text-[8px] text-gray-500 max-w-[150px]">
            Real-time monitoring of central bank reserves and mining output.
          </div>
        </div>
      </div>

      {/* News Sidebar Overlay */}
      <div className="absolute top-4 right-4 bottom-4 w-48 z-20 flex flex-col gap-2 overflow-hidden">
        <div className="bg-black/60 backdrop-blur-md border border-gold/30 rounded-lg p-2 flex-1 overflow-y-auto no-scrollbar">
          <div className="text-[10px] text-gold font-bold border-b border-gold/20 pb-1 mb-2">LIVE INTEL</div>
          <div className="space-y-3">
            {[
              { time: "2m ago", msg: "PBOC adds 5 tons to gold reserves", type: "bull" },
              { time: "15m ago", msg: "Mining strike in South Africa reported", type: "alert" },
              { time: "45m ago", msg: "Russian central bank movements detected", type: "warning" },
              { time: "1h ago", msg: "Gold-backed ETF inflows surge 12%", type: "bull" },
            ].map((news, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[7px]">
                  <span className="text-gray-500 uppercase">{news.time}</span>
                  <span className={`${
                    news.type === 'bull' ? 'text-green-500' : 
                    news.type === 'alert' ? 'text-yellow-500' : 'text-red-500'
                  } font-bold`}>{news.type.toUpperCase()}</span>
                </div>
                <div className="text-[9px] text-gray-300 leading-tight">{news.msg}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
