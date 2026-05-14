// AuScope PWA Service Worker — Push Notifications + Offline Support
const CACHE_NAME = 'auscope-v2';
const APP_SHELL = [
  '/',
  '/comms',
  '/login',
  '/icon-192.png',
  '/icon-512.png',
  '/badge-96.png',
  '/logo.svg',
  '/manifest.json'
];

// ─── INSTALL: Pre-cache the app shell ───
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache what we can, don't fail if some aren't available yet
      return Promise.allSettled(
        APP_SHELL.map(url => cache.add(url).catch(() => {}))
      );
    })
  );
  self.skipWaiting();
});

// ─── ACTIVATE: Clean old caches ───
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => clients.claim())
  );
});

// ─── FETCH: Network-first with offline fallback ───
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests (API calls, form submissions)
  if (event.request.method !== 'GET') return;

  // Skip Supabase API calls — they should never be cached
  if (url.hostname.includes('supabase')) return;

  // For navigation requests (HTML pages) — network first, cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the latest version
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          // Offline — serve from cache
          return caches.match(event.request).then(cached => {
            return cached || caches.match('/comms') || new Response(
              '<html><body style="background:#0a0e17;color:#f5c451;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif"><div style="text-align:center"><h1>Offline</h1><p style="color:#8a9bb2">Reconnecting...</p></div></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          });
        })
    );
    return;
  }

  // For static assets — stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        // Only cache successful responses
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});

// ─── PUSH NOTIFICATION HANDLER ───
// This fires even when the app is closed/in background
self.addEventListener('push', (event) => {
  let data = {};

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (err) {
    // If the push data is a plain string instead of JSON
    try {
      data = { title: 'AuScope', body: event.data ? event.data.text() : 'New secure transmission' };
    } catch (e) {
      data = { title: 'AuScope', body: 'New secure transmission' };
    }
  }

  const title = data.title || 'AuScope';
  const options = {
    body: data.body || 'You have a new message',
    // Use the dynamic sender icon (profile pic or initials) if provided, otherwise fallback to app icon
    icon: data.icon || '/icon-192.png',
    badge: '/badge-96.png',
    vibrate: [200, 100, 200, 100, 200],
    // Tag ensures notifications from the same conversation stack/replace instead of flooding
    tag: data.tag || 'auscope-message',
    // renotify: vibrate/sound again even when replacing a notification with the same tag
    renotify: true,
    // Keep the notification visible until the user interacts with it
    requireInteraction: false,
    // Action buttons
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    data: {
      dateOfArrival: Date.now(),
      url: data.url || '/comms'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ─── NOTIFICATION CLICK HANDLER ───
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetPath = event.notification.data?.url || '/comms';
  // Build the full URL from the service worker's origin
  const origin = new URL(self.registration.scope).origin;
  const fullUrl = origin + targetPath;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 1. Try to find and focus an existing PWA window
      for (const client of windowClients) {
        if ('focus' in client) {
          return client.focus().then((focused) => {
            if (focused && 'navigate' in focused) {
              return focused.navigate(fullUrl);
            }
          });
        }
      }

      // 2. No existing window — open new one (Android will open in PWA if installed)
      return clients.openWindow(fullUrl);
    })
  );
});

// ─── NOTIFICATION CLOSE HANDLER ───
self.addEventListener('notificationclose', (event) => {
  // Could track dismissed notifications here
});
