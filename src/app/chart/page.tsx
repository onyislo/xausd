'use client';

import React from 'react';
import GoldChart from '@/components/GoldChart';

export default function ChartPage() {
  return (
    <main className="min-h-screen bg-[#0a0e17] overflow-hidden">
      <GoldChart fullscreen />
    </main>
  );
}
