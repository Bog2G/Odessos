/* ODESSOS v5 service worker.
   DEPLOY RULE: bump the version string below on EVERY deploy,
   or the installed PWA will keep serving the old build. */
const ODESSOS_CACHE = 'odessos-v5-021';

const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(ODESSOS_CACHE).then((c) => c.addAll(PRECACHE)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== ODESSOS_CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        try {
          const url = new URL(e.request.url);
          const cacheable = url.origin === location.origin ||
            url.hostname.endsWith('gstatic.com') || url.hostname.endsWith('googleapis.com');
          if (cacheable && res && (res.status === 200 || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(ODESSOS_CACHE).then((c) => c.put(e.request, copy));
          }
        } catch (_) {}
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
