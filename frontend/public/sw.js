const CACHE_NAME = 'pehchan-v1';
const urlsToCache = [
    '/',
    '/logo.png',
    '/manifest.json'
];

// Skip caching in development
const isDev = self.location.hostname === 'localhost';

// Install event
self.addEventListener('install', (event) => {
    if (isDev) {
        console.log('Pehchan SW: Skipping cache in development');
        self.skipWaiting();
        return;
    }

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Pehchan: Cache opened');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Pehchan: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
    // Skip in development mode
    if (isDev) return;

    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip API requests
    if (event.request.url.includes('/api/')) return;

    // Skip Vite HMR and dev server requests
    if (event.request.url.includes('@vite') ||
        event.request.url.includes('@react-refresh') ||
        event.request.url.includes('node_modules') ||
        event.request.url.includes('.hot-update.')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Only cache valid responses
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                const responseClone = response.clone();

                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });

                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
