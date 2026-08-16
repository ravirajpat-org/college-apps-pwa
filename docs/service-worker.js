// Service worker for the College Apps PWA.
//
// All content is static (baked into index.html, no live data source), so
// this is a plain cache-first app shell — no data-file special-casing
// needed like school-tracker-pwa's encrypted-data cache-then-network path.

const CACHE_NAME = "college-apps-v1";

const APP_SHELL = [
  "./index.html",
  "./styles.css",
  "./manifest.json",
  "./js/app.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
