const CACHE_NAME = 'fuji-learn-v10';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/aarav.html',
  '/style.css?v=42.0',
  '/manifest.json',
  '/icon.png'
];

// Install Event: Cache critical static assets
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force waiting service worker to become active immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate Event: Delete old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting legacy cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Immediately control open PWA/WebAPK clients
    })
  );
});

// Fetch Event: Network-first strategy for HTML pages, Stale-While-Revalidate for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests or API calls
  if (event.request.method !== 'GET' || url.origin !== location.origin) {
    return;
  }

  // Network-First for HTML navigation requests (bypasses stale PWA shell)
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request) || caches.match('/aarav.html'))
    );
    return;
  }

  // Stale-While-Revalidate for CSS, JS, and Assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// Listen for direct SKIP_WAITING signal from client page
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

