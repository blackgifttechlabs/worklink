const SERVICELOOP_CACHE = 'serviceloop-shell-v10';
const SERVICELOOP_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './js/home-metrics.js',
  './js/main.js',
  './js/search-intelligence.js',
  './js/shared-header.js',
  './js/providers-ui.js',
  './js/jobs-ui.js',
  './js/zimbabwe-locations.js',
  './images/logo/slicon.avif',
  './images/pwa/sl-icon-180.png',
  './images/pwa/sl-icon-192.png',
  './images/pwa/sl-icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SERVICELOOP_CACHE).then((cache) => cache.addAll(SERVICELOOP_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== SERVICELOOP_CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      .then((clients) => {
        clients.forEach((client) => client.postMessage({ type: 'serviceloop-sw-activated' }));
      })
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'serviceloop-skip-waiting') {
    self.skipWaiting();
  }
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
          caches.open(SERVICELOOP_CACHE).then((cache) => cache.put(request, responseClone));
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
        caches.open(SERVICELOOP_CACHE).then((cache) => cache.put(request, responseClone));
        return response;
      });
    })
  );
});
