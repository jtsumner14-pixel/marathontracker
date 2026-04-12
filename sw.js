const VERSION = 'marathon-v3';
const ASSETS = ['./index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => {
        self.clients.matchAll().then(clients =>
          clients.forEach(c => c.postMessage({ type: 'SW_UPDATED', version: VERSION }))
        );
      })
  );
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('supabase.co')) return;
  e.respondWith(
    caches.match(e.request)
      .then(r => r || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});
