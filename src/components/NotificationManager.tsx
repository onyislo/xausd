'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export default function NotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isMobile, setIsMobile] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  // Helper to convert VAPID key
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Subscribe to push notifications and save to Supabase
  const subscribeToPush = useCallback(async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications not supported');
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) {
          console.error('VAPID public key missing');
          return;
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey)
        });
      }

      // Save subscription to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user && subscription) {
        const subJson = subscription.toJSON();

        // Delete old subscriptions for this user first to avoid stale ones
        // Then insert the new/current one
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id);

        const { error } = await supabase
          .from('push_subscriptions')
          .insert({
            user_id: user.id,
            subscription: subJson
          });

        if (error) {
          console.error('Failed to save push subscription:', error);
        } else {
          setSubscribed(true);
          console.log('Push subscription saved successfully');
        }
      }
    } catch (err) {
      console.error('Push subscription error:', err);
    }
  }, []);

  useEffect(() => {
    // Mobile Detection
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isSmallScreen = window.innerWidth < 768;
    setIsMobile(isMobileDevice || isSmallScreen);

    if ('Notification' in window) {
      setPermission(Notification.permission);

      // If permission is already granted, auto-subscribe silently
      // This ensures the subscription stays fresh even after SW updates
      if (Notification.permission === 'granted') {
        subscribeToPush();
      }
    }
  }, [subscribeToPush]);

  const requestPermission = async () => {
    if (!('Notification' in window)) return;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        await subscribeToPush();
      }
    } catch (err) {
      console.error("Notification permission error:", err);
    }
  };

  // Only show on mobile and if permission not already granted
  if (!isMobile || permission === 'granted') return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-[9998] animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="relative overflow-hidden bg-slate-900/90 border border-yellow-500/20 backdrop-blur-xl p-4 rounded-2xl shadow-2xl">
        <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500" />
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f5c451" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-[11px] font-black text-yellow-500 uppercase tracking-[0.2em]">Live Alerts</h4>
            <p className="text-[10px] text-slate-300 leading-tight mt-1">Enable to get instant alerts and terminal notifications.</p>
          </div>
          <button 
            onClick={requestPermission}
            className="bg-yellow-500 text-[#0a0e17] text-[10px] font-black px-4 py-2 rounded-lg hover:bg-yellow-400 transition-all uppercase tracking-widest shadow-lg shadow-yellow-500/10 active:scale-95"
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  );
}
