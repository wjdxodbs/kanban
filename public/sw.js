const CACHE_NAME = "kanban-pwa-v2";
const STATIC_CACHE = "kanban-static-v2";
const PAGE_CACHE = "kanban-pages-v2";
const OFFLINE_URL = "/offline";
const PRECACHE_URLS = [
  "/",
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-512-maskable.png",
  "/screenshots/kanban-desktop.svg",
  "/screenshots/kanban-mobile.svg",
];

function isCacheableResponse(response) {
  return response && (response.status === 200 || response.type === "opaque");
}

function isStaticAsset(pathname) {
  if (pathname.startsWith("/_next/static/")) return true;
  return /\.(?:js|css|png|jpg|jpeg|svg|webp|ico|woff|woff2|ttf|otf)$/i.test(pathname);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
      caches.open(STATIC_CACHE),
      caches.open(PAGE_CACHE),
    ])
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const keep = new Set([CACHE_NAME, STATIC_CACHE, PAGE_CACHE]);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => (keep.has(key) ? Promise.resolve() : caches.delete(key)))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  // Cross-origin requests are left to the browser/network stack.
  if (url.origin !== self.location.origin) return;

  // HTML navigation: network-first, then cached page/offline fallback.
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request);
          if (isCacheableResponse(response)) {
            const cache = await caches.open(PAGE_CACHE);
            cache.put(event.request, response.clone());
          }
          return response;
        } catch {
          const pageCache = await caches.open(PAGE_CACHE);
          const cachedPage = await pageCache.match(event.request);
          if (cachedPage) return cachedPage;
          const precache = await caches.open(CACHE_NAME);
          const offline = await precache.match(OFFLINE_URL);
          return offline || Response.error();
        }
      })()
    );
    return;
  }

  // Static assets: cache-first with network fallback.
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(event.request);
        if (cached) return cached;
        try {
          const response = await fetch(event.request);
          if (isCacheableResponse(response)) {
            cache.put(event.request, response.clone());
          }
          return response;
        } catch {
          return Response.error();
        }
      })()
    );
    return;
  }

  // Default for same-origin GET: network-first, then any cached fallback.
  event.respondWith(
    (async () => {
      try {
        return await fetch(event.request);
      } catch {
        return (
          (await caches.match(event.request)) ||
          (await caches.open(CACHE_NAME)).match(OFFLINE_URL) ||
          Response.error()
        );
      }
    })()
  );
});
