// Service Worker for SplitApp PWA
//
// Bumped v1 -> v2: `manifest.json` used to be cached "install" in STATIC_ASSETS
// and then served cache-first forever (see the fetch handler below). The
// manifest's icon files (icon-192.png / icon-512.png) were briefly broken —
// actually SVGs saved with a .png extension — so anyone who visited while
// that was live got the broken manifest+icons wedged into their cache
// permanently. The server was fixed, but `activate` only deletes caches whose
// NAME differs from the current one, so a same-named cache never gets
// refreshed and those visitors kept seeing the broken icons (no Chrome
// "install app" prompt) no matter how many times the site redeployed.
// Changing the name forces every existing visitor's browser to detect this
// as a new service worker, install it fresh, and have `activate` purge the
// stale v1 cache. See also the fetch handler: manifest.json and icon/favicon
// files are no longer cache-first, specifically so this class of bug can't
// wedge itself in again after a future icon change.
const CACHE_NAME = 'splitapp-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// Served network-first (see fetch handler) because a stale cached copy of
// any of these silently breaks PWA installability — not worth the offline
// win a long-lived cache would give.
const NEVER_STALE = new Set(['/manifest.json']);
const isNeverStale = (pathname) =>
  NEVER_STALE.has(pathname) || /^\/(favicon|icon-|apple-touch-icon)/.test(pathname);

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Push - show a system notification (the phone's notification shade) for a
// message sent by the backend's pushService. Payload: { title, body, url }.
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'SplitApp';
  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, {
        body: data.body || '',
        icon: '/icon-192.png',
        data: { url: data.url || '/notifications' },
      }),
      // Let any open tab refresh its bell/unread count straight away instead
      // of waiting for the next 60s poll.
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) =>
        clients.forEach((client) => client.postMessage({ type: 'push-received' }))
      ),
    ])
  );
});

// Notification tap - focus an open SplitApp window on the right page, or open one.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/notifications', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const client = clients.find((c) => new URL(c.url).origin === self.location.origin);
      if (client) {
        return client.focus().then((c) => (c && 'navigate' in c ? c.navigate(target) : c));
      }
      return self.clients.openWindow(target);
    })
  );
});

// Fetch - network first for API, cache first for static
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and API requests (always network)
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  // For navigation requests, serve index.html (SPA routing)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Network first for the manifest and icon/favicon files — these change
  // rarely, but a stale cached copy breaks PWA installability silently (see
  // the comment by CACHE_NAME above), so freshness matters more than an
  // offline fallback here.
  if (isNeverStale(url.pathname)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache first for everything else (hashed /assets/* files — Vite gives
  // each build's output a new filename, so a cached one is never stale).
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
