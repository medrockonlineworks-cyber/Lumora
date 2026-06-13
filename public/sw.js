const CACHE_NAME = 'lumora-pwa-cache-v13';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/lumora_pwa_icon_v9.png',
  '/lumora_pwa_icon_v9_192.png',
  '/favicon_v8.ico'
];

// Install Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ASSETS.map((asset) => {
          return cache.add(asset).catch((err) => {
            console.warn(`Lumora SW: Failed to cache asset: ${asset}`, err);
          });
        })
      );
    })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Assets
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  
  // Dynamic Network-First fallback to API cache for user dashboard information
  if (url.pathname.includes('/api/') && e.request.method === 'GET') {
    e.respondWith(
      fetch(e.request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open('lumora-api-cache-v1').then((cache) => {
              cache.put(e.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return appropriate empty JSON fallback if completely offline and not in cache
            return new Response(JSON.stringify({ error: 'Offline Mode - No local data' }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
  } else {
    // Static assets - Cache-First, fallback to Network with dynamic caching
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(e.request).then((networkResponse) => {
          // Verify we received a valid, cacheable response
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          // Cache same-origin GET requests for assets dynamically
          if (e.request.method === 'GET' && e.request.url.startsWith(self.location.origin)) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseToCache);
            });
          }

          return networkResponse;
        }).catch(() => {
          // Fallback for offline if navigating html
          if (e.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
    );
  }
});
