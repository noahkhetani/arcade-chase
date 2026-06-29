const CACHE_NAME = 'neon-runner-v1';
const STATIC_CACHE = 'neon-runner-static-v1';
const DYNAMIC_CACHE = 'neon-runner-dynamic-v1';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/sounds/background.mp3',
  '/sounds/hit.mp3',
  '/sounds/success.mp3',
  '/textures/asphalt.png',
  '/textures/grass.png',
  '/textures/sand.jpg',
  '/textures/sky.png',
  '/textures/wood.jpg'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .catch((error) => {
        console.warn('Service Worker: Some files failed to cache', error);
        // Continue installation even if some files fail to cache
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve cached files when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and external URLs
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            // Cache dynamic content
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return offline fallback for HTML requests
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    // Handle any queued operations here
  }
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  if (!event.data) {
    console.log('No data in push event');
    return;
  }

  try {
    const data = event.data.json();
    console.log('Push data:', data);
    
    const options = {
      body: data.body || 'New notification from NEON RUNNER',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/icon-192x192.png',
      tag: data.tag || 'arcade-collector',
      data: data.data || {},
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      timestamp: Date.now(),
      actions: data.actions || []
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'NEON RUNNER', options)
    );
  } catch (error) {
    console.error('Error processing push notification:', error);
    
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('NEON RUNNER', {
        body: 'You have a new notification!',
        icon: '/icons/icon-192x192.png',
        tag: 'neon-runner-fallback'
      })
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data || {};
  
  let url = '/';
  
  // Handle different notification actions
  switch (action) {
    case 'play':
      url = '/';
      break;
    case 'challenge':
      url = '/?challenge=daily';
      break;
    case 'update':
      url = '/?updated=true';
      break;
    case 'snooze':
      // Schedule another reminder
      self.registration.showNotification('Play Reminder', {
        body: 'Come back and play NEON RUNNER!',
        icon: '/icons/icon-192x192.png',
        tag: 'play-reminder',
        timestamp: Date.now() + (2 * 60 * 60 * 1000) // 2 hours later
      });
      return;
    case 'dismiss':
      return;
    default:
      // Handle data-based routing
      if (data.type === 'challenge') {
        url = '/?challenge=daily';
      } else if (data.type === 'update') {
        url = '/?updated=true';
      }
      break;
  }
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            action: action,
            data: data,
            url: url
          });
          return;
        }
      }
      
      // Open new window if app is not open
      return clients.openWindow(url);
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  // Track notification dismissal for analytics
  const data = event.notification.data || {};
  if (data.trackDismissal) {
    // You can send analytics data here
    console.log('Notification dismissed:', data);
  }
});

// Periodic background sync for notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'notification-sync') {
    console.log('Background sync for notifications triggered');
    
    event.waitUntil(
      // You can fetch new notification data from server here
      fetch('/api/notifications/check')
        .then(response => response.json())
        .then(data => {
          if (data.notifications && data.notifications.length > 0) {
            return Promise.all(
              data.notifications.map(notification =>
                self.registration.showNotification(notification.title, {
                  body: notification.body,
                  icon: '/icons/icon-192x192.png',
                  tag: notification.tag || 'background-sync',
                  data: notification.data || {}
                })
              )
            );
          }
        })
        .catch(error => {
          console.error('Background sync failed:', error);
        })
    );
  }
});