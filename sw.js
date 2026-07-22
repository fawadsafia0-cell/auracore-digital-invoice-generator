
const CACHE_NAME = 'aura-core-invoice-v2';
const FILES_TO_CACHE = [
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Network-first: always try to fetch the latest version first.
// Only fall back to the cached copy if the network request fails (offline).
// This means every update you push reaches the phone on the very next
// visit, instead of being stuck behind an old cached copy.
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                return response;
            })
            .catch(() => {
                return caches.match(event.request).then((cached) => {
                    return cached || (event.request.mode === 'navigate' ? caches.match('./index.html') : undefined);
                });
            })
    );
});
