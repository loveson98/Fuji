/* =========================================
   FUJI LEARN - SERVICE WORKER (WITH AUTO-UPDATE)
   ========================================= */

const CACHE_NAME = 'fuji-learn-v7'; // Bumped to v7 to force a clean cache for new AI & Kanji fixes

// Use relative paths (./) so it works perfectly in GitHub Pages subdirectories
const CORE_ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './service-worker.js'
];

// 1. INSTALL EVENT: Cache the core app shell
self.addEventListener('install', (event) => {
    console.log('[Fuji Learn SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Fuji Learn SW] Caching core assets');
                return cache.addAll(CORE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// 2. ACTIVATE EVENT: Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Fuji Learn SW] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Fuji Learn SW] Clearing old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. FETCH EVENT: Cache-first strategy
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                return fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                }).catch(() => {
                    if (event.request.destination === 'document') {
                        return caches.match('./index.html');
                    }
                });
            })
    );
});

// 4. MESSAGE HANDLER: Listen for skipWaiting command
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[Fuji Learn SW] Skipping waiting, activating new version...');
        self.skipWaiting();
    }
});