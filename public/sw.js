// Service worker sederhana: cache aset statis, halaman network-first dengan cadangan cache.
// Hanya untuk melihat data terakhir saat offline; pencatatan tetap butuh server aktif.
const CACHE = "uangku-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || url.pathname.startsWith("/api/")) return;

  const isStatic = url.pathname.startsWith("/_next/static/") || /\.(png|svg|ico|webmanifest)$/.test(url.pathname);
  if (isStatic) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }))
    );
    return;
  }
  e.respondWith(
    fetch(req).then((res) => {
      if (res.ok && req.mode === "navigate") { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then((hit) => hit || new Response("Sedang offline.", { status: 503 })))
  );
});
