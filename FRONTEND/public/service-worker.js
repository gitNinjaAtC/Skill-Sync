/* eslint-disable no-restricted-globals */

const CACHE_NAME = "sistec-alumni-v1";

// Assets to pre-cache on install
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/SISTec_Logo.png",
  "/manifest.json",
];

// Install: cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip cross-origin API requests — let them go directly to network
  if (
    url.hostname.includes("onrender.com") ||
    url.hostname.includes("cloudinary.com") ||
    url.hostname.includes("mongodb.net")
  ) {
    return;
  }

  // For same-origin requests: stale-while-revalidate for shell, network-first for API
  if (url.pathname.startsWith("/API_B")) {
    // Network-first for API routes
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Stale-while-revalidate for everything else (app shell, static files)
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      })
    )
  );
});

// Handle push notifications (future use)
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || "SISTec Alumni", {
      body: data.body || "",
      icon: "/SISTec_Logo.png",
      badge: "/SISTec_Logo.png",
    })
  );
});
