'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function ProductionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isProd, setIsProd] = useState(false);

  useEffect(() => {
    setIsProd(process.env.NODE_ENV === 'production');
  }, []);

  // Show normal pages in development
  if (!isProd) {
    return <>{children}</>;
  }

  // Allowed pages in production
  const allowedPaths = ['/comms', '/profile', '/login', '/register', '/'];
  
  const isAllowed = allowedPaths.some(path => 
    pathname === path || pathname?.startsWith(`${path}/`) && path !== '/'
  );

  if (isAllowed) {
    return <>{children}</>;
  }

  // For un-allowed pages in production, blur the content and show COMING SOON
  return (
    <div className="relative min-h-screen w-full bg-[#0a0e17] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none blur-[8px] opacity-40 select-none">
        {children}
      </div>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
        <div className="bg-[#0f1420]/80 p-12 rounded-2xl border border-yellow-500/30 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/40 mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f5c451" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-yellow-500 tracking-[0.2em] uppercase mb-4 drop-shadow-lg">
            Module Locked
          </h1>
          <p className="text-slate-400 font-mono tracking-widest text-sm max-w-md">
            THIS SECTOR IS CURRENTLY IN DEVELOPMENT. NEW INTEL COMING SOON...
          </p>
          
          <button 
            onClick={() => window.history.back()}
            className="mt-8 px-6 py-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/40 rounded-lg text-xs font-bold tracking-widest uppercase transition-all"
          >
            Return to Authorized Hub
          </button>
        </div>
      </div>
    </div>
  );
}
