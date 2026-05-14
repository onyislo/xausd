// AuScope PWA Service Worker — Push Notifications + Offline Support
const CACHE_NAME = 'auscope-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Network-first strategy — we can add caching logic here later
  event.respondWith(fetch(event.request));
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
    // Use PNG icons — SVG is NOT supported for push notifications on mobile
    icon: '/icon-192.png',
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

  // Handle action buttons
  if (event.action === 'dismiss') {
    return;
  }

  const targetPath = event.notification.data?.url || '/comms';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Look for any existing app window
      for (const client of windowClients) {
        // Use URL parsing to compare paths correctly
        // client.url is a full URL like "https://example.com/comms"
        // targetPath is just "/comms"
        try {
          const clientUrl = new URL(client.url);
          if (clientUrl.pathname === targetPath || clientUrl.pathname.startsWith(targetPath)) {
            // Found an existing window — focus it and navigate if needed
            client.focus();
            client.navigate(clientUrl.origin + targetPath);
            return;
          }
        } catch (e) {
          // If URL parsing fails, try simple includes check
          if (client.url.includes(targetPath)) {
            return client.focus();
          }
        }
      }

      // If any window is open at all, focus it and navigate
      if (windowClients.length > 0) {
        const client = windowClients[0];
        client.focus();
        try {
          const clientUrl = new URL(client.url);
          client.navigate(clientUrl.origin + targetPath);
        } catch (e) {
          // fallback
        }
        return;
      }

      // No window open — open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetPath);
      }
    })
  );
});

// ─── NOTIFICATION CLOSE HANDLER (optional analytics) ───
self.addEventListener('notificationclose', (event) => {
  // Could track dismissed notifications here
});
