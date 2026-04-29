const MAWORKS_CACHE = 'maworks-shell-v5';
const MAWORKS_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/home-metrics.js',
  './js/main.js',
  './js/search-intelligence.js',
  './js/shared-header.js',
  './js/zimbabwe-locations.js',
  './images/logo/joblinks.avif',
  './images/pwa/maworks-icon-192.png',
  './images/pwa/maworks-icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(MAWORKS_CACHE).then((cache) => cache.addAll(MAWORKS_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key !== MAWORKS_CACHE)
        .map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

function isNetworkFirstAsset(request, url) {
  if (request.mode === 'navigate') return true;
  return /\.(?:html|css|js)$/i.test(url.pathname || '');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isNetworkFirstAsset(request, url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') return response;
          const responseClone = response.clone();
          caches.open(MAWORKS_CACHE).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => {
          if (cached) return cached;
          return request.mode === 'navigate' ? caches.match('./index.html') : null;
        }))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const responseClone = response.clone();
        caches.open(MAWORKS_CACHE).then((cache) => cache.put(request, responseClone));
        return response;
      });
    })
  );
});
