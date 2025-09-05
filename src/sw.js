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

// install イベント
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const url of URLS_TO_CACHE) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn('キャッシュ失敗:', url, err);
        }
      }
    })
  );
});

// activate イベント
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
});

// fetch イベント
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});