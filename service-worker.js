const CACHE_NAME = 'fuji-learn-v9';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/aarav.html'
];

// 1. INSTALL: Cache base assets and skip waiting immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

// 2. ACTIVATE: Purge all old caches and claim clients instantly
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Wiping old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH: Network-First for HTML, Stale-While-Revalidate for static assets
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // NEVER intercept API calls (e.g., /api/aarav POST requests must go straight to server)
  if (request.method !== 'GET') {
    return;
  }

  // A. For HTML pages & site navigation: Always try NETWORK FIRST
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => caches.match(request)) // Fallback to offline cache ONLY if network fails
    );
    return;
  }

  // B. For static assets (CSS, JS, Fonts): Serve from cache, update in background
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse.clone()));
          }
          return networkResponse;
        })
        .catch(() => {/* Ignore network errors for background revalidation */});

      return cachedResponse || fetchPromise;
    })
  );
});
