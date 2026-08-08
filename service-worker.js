const CACHE_NAME = 'fuji-learn-v8';

// Add the core assets you want available offline
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/aarav.html'
];

// 1. INSTALL: Cache initial assets and immediately skip waiting
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Instantly replaces old SW without waiting for tabs to close
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// 2. ACTIVATE: Sweep old caches and take immediate control of all clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Wipe every cache that isn't fuji-learn-v8
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log('[SW] Deleting stale cache:', cache);
              return caches.delete(cache);
            }
          })
        );
      }),
      // Force all open app windows/tabs to start using this new SW version immediately
      self.clients.claim()
    ])
  );
});

// 3. FETCH: Network-First for HTML pages, Stale-While-Revalidate for other static assets
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // For HTML page requests: Try network first so layout changes load immediately
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => caches.match(request)) // Fallback to offline cache if no network
    );
    return;
  }

  // For all other requests (CSS, JS, Images): Serve from cache, update in background
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse.clone()));
          }
          return networkResponse;
        })
        .catch(() => {/* Ignore network errors for background revalidation */});

      return cachedResponse || fetchPromise;
    })
  );
});
