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

  // The user requested to hide the intrusive banner. We return null to keep this as a background process.
  return null;
}
