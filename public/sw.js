/*
 * TOMBSTONE SERVICE WORKER — self-destruct, do NOT cache anything.
 *
 * A previous build registered a cache-first service worker (CACHE_NAME
 * "conscious-cafe-v2") that cached "/" and the JS/CSS bundles and served them
 * before ever hitting the network. Browsers that installed it kept rendering a
 * stale, months-old bundle (old checkout, missing menu options) no matter how
 * many times the user refreshed — a normal reload does not bypass a cache-first
 * SW. Commenting out the registration in src/index.js did NOT help already-
 * affected browsers, because the installed worker lives on independently.
 *
 * The browser re-fetches this file on navigation (bypassing the old SW's
 * cache), sees it changed, and installs this version. On activation it deletes
 * every cache, unregisters itself, and reloads open tabs so they fetch fresh
 * from the network. After one visit, the affected browser is clean and this
 * worker is gone. Keep this tombstone in place until you're confident no stale
 * clients remain; do not reintroduce caching here without versioned, network-
 * first invalidation.
 */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.navigate(client.url));
    } catch (err) {
      // Best-effort cleanup; nothing actionable if it fails.
    }
  })());
});

// Never intercept/serve from cache — always go straight to the network.
self.addEventListener('fetch', () => {});
