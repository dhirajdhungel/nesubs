const CACHE_NAME = 'nesubs-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/search',
  '/account',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg'
];

const isLocalhost = self.location.hostname === 'localhost' || 
                    self.location.hostname === '127.0.0.1' || 
                    self.location.hostname === '[::1]';

if (isLocalhost) {
  // Clear any existing cache and unregister service worker on localhost to prevent caching issues/React hook errors
  self.addEventListener('install', (event) => {
    self.skipWaiting();
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map(k => caches.delete(k))))
        .then(() => self.registration.unregister())
        .then(() => self.clients.claim())
    );
  });

  self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
  });
} else {
  // Install event - cache assets
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('Opened cache');
          return cache.addAll(ASSETS_TO_CACHE);
        })
        .catch((err) => {
          console.log('Cache failed:', err);
        })
    );
    self.skipWaiting();
  });

  // Activate event - clean up old caches
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
    self.clients.claim();
  });

  // Fetch event - serve from cache, fallback to network
  self.addEventListener('fetch', (event) => {
    // Bypass cache for API calls
    if (event.request.url.includes('/api/')) {
      event.respondWith(fetch(event.request));
      return;
    }

    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Cache hit - return response
          if (response) {
            return response;
          }

          // Clone the request
          const fetchRequest = event.request.clone();

          return fetch(fetchRequest).then((response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
        })
    );
  });
}
