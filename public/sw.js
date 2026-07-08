const CACHE_NAME = 'lumora-pwa-cache-v17';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
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

  // Pass all API requests directly to the network.
  // API endpoints are dynamic database routes and are handled fully by our custom fetch interceptor in fetchInterceptor.ts.
  if (url.pathname.includes('/api/')) {
    return;
  }

  // Only handle GET requests for other assets. Pass POST, PUT, DELETE, etc. directly to the network.
  if (e.request.method !== 'GET') {
    return;
  }
  
  if (e.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    // Crucial: Network-First strategy for HTML index & navigations to guarantee instant updates on deploy!
    e.respondWith(
      fetch(e.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(e.request).then((cachedResponse) => {
            return cachedResponse || caches.match('/index.html') || caches.match('/');
          });
        })
    );
  } else {
    // Static assets (CSS, JS, images) - Cache-First, fallback to Network with dynamic caching
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
          // Fallback if offline
          return caches.match('/index.html') || caches.match('/');
        });
      })
    );
  }
});
