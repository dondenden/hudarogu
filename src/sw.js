const CACHE_NAME = 'hudarogu-cache-v1';
const URLS_TO_CACHE = [
  '/hudarogu/',
  '/hudarogu/index.html',
  '/hudarogu/manifest.json',
  '/hudarogu/css/index.css',
  '/hudarogu/js/index.js',
  '/hudarogu/icons/icon-192.png',
  '/hudarogu/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});