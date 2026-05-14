// Simple Service Worker for PWA installability
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // We can add caching logic here later
  event.respondWith(fetch(event.request));
});

// Listen for incoming push notifications
self.addEventListener('push', (event) => {
  let data = {};
  
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (err) {
    console.error('Push data parsing failed', err);
    data = { title: 'AuScope', body: 'New secure transmission' };
  }
  
  const options = {
    body: data.body || 'You have a new message',
    icon: '/logo.svg', // Fixed icon path
    badge: '/logo.svg', // Fixed badge path
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2',
      url: data.url || '/comms'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'AuScope', options)
  );
});

// Handle clicking on the notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Open the app when the notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // If so, just focus it.
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, then open the target URL in a new window/tab.
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
