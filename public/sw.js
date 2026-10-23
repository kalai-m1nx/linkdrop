// LinkDrop Service Worker for PWA Installation and Caching
const CACHE_NAME = 'linkdrop-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/favicon.svg',
        '/icon-192.png',
        '/icon-512.png'
      ]).catch(() => {
        // Cache failures during dev/build won't block install
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
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

self.addEventListener('fetch', (event) => {
  // Pass through all API / Supabase / video requests directly
  if (
    event.request.url.includes('supabase.co') ||
    event.request.method !== 'GET' ||
    event.request.url.includes('/storage/v1/')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
