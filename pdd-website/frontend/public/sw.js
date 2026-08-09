const CACHE_NAME = 'neurosignal-platinum-v4.2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://ravi123sv.github.io/pdd-project/assets/icon/app_icon.svg',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap'
];

// 1. Installation: High-Priority Clinical Asset Caching
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching Clinical Assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activation: Old Cache Purge
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Purging Legacy Cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Smart Fetch: Stale-While-Revalidate Strategy
// Ensures workstation remains responsive in low-signal ICU areas.
self.addEventListener('fetch', (event) => {
  // Skip cross-origin API requests (handled by axios/offlineSync)
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cacheCopy);
          });
        }
        return networkResponse;
      }).catch(() => {
          // Offline Fallback: Return cached asset if network is severed
          console.warn('[SW] Network Handshake Severed. Using Local Cache.');
      });

      return cachedResponse || fetchPromise;
    })
  );
});
