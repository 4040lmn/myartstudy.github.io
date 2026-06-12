const CACHE_NAME = "myartstudy-shell-v1";
const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./myartstudy-icon.svg",
  "./icon-new-note.svg",
  "./icon-save.svg",
  "./icon-delete.svg",
  "./study-note-manifest.webmanifest"
];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  // Google / 外部API はネットワーク優先、失敗したらそのままエラーにする
  const isExternal =
    url.hostname !== self.location.hostname ||
    url.pathname.startsWith("/gsi/");
  if (isExternal) {
    event.respondWith(fetch(request));
    return;
  }

  // シェルアセット: キャッシュ優先、失敗時はネットワーク
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
