'use client';

import React, { useEffect, useState } from 'react';

export default function InstallPWA() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Robust Mobile Detection (User Agent + Screen Width)
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isSmallScreen = window.innerWidth < 768;
    
    // If it's NOT a mobile device OR NOT a small screen, stop everything
    if (!isMobileDevice && !isSmallScreen) return;

    // 2. Detect if already in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone;

    if (isStandalone) return;

    // 3. Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // 4. Cooldown logic (10 minutes)
    const lastDismissed = localStorage.getItem('pwaDismissedAt');
    if (lastDismissed) {
      const now = Date.now();
      const tenMinutes = 10 * 60 * 1000;
      if (now - parseInt(lastDismissed) < tenMinutes) return;
    }

    // 5. Listen for Android's install prompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // 6. For iOS, show after a delay
    if (ios) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const closePrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('pwaDismissedAt', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 z-[9999] md:left-auto md:right-6 md:w-96 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/90 p-5 text-white shadow-2xl border border-yellow-500/30 backdrop-blur-xl">
        {/* Progress Bar Accent */}
        <div className="absolute top-0 left-0 h-1 bg-gradient-to-right from-yellow-500 to-yellow-200 w-full opacity-50" />
        
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f5c451" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          
          <div className="flex-1 pr-6">
            <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-wider">Install AuScope</h3>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              {isIOS 
                ? "Tap the Share button and select 'Add to Home Screen' for a faster, full-screen experience."
                : "Install our secure terminal as an app for real-time market alerts and better performance."
              }
            </p>
          </div>

          <button 
            onClick={closePrompt}
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {!isIOS && (
          <button
            onClick={handleInstallClick}
            className="mt-4 w-full rounded-lg bg-yellow-500 py-2.5 text-xs font-black uppercase tracking-widest text-black hover:bg-yellow-400 transition-all active:scale-[0.98] shadow-lg shadow-yellow-500/20"
          >
            Install Now
          </button>
        )}
        
        {isIOS && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-white/5 py-2 text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
            <span>Share</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            <span>+ Add to Home Screen</span>
          </div>
        )}
      </div>
    </div>
  );
}
