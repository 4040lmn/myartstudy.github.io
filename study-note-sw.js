const CACHE_NAME = "myartstudy-assets-v3";
const ASSETS = [
  "./myartstudy-icon.svg",
  "./icon-new-note.svg",
  "./icon-save.svg",
  "./icon-delete.svg",
  "./study-note-manifest.webmanifest"
];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    ).then(() => caches.open(CACHE_NAME))
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);
  const isExternal =
    url.hostname !== self.location.hostname ||
    url.pathname.startsWith("/gsi/");
  const isHtml =
    request.mode === "navigate" ||
    url.pathname.endsWith("/") ||
    url.pathname.endsWith("/index.html") ||
    request.headers.get("accept")?.includes("text/html");

  if (isExternal || isHtml) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok && request.method === "GET") {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
      }
      return response;
    }))
  );
});
