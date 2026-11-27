const CACHE = "diamond-v4";
const CORE = ["./", "./index.html", "./manifest.json", "./icon-192.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    // Keshdan darhol ochiladi, yangisi orqada yuklanib keyingi ochilishga tayyor bo'ladi
    e.respondWith(
      caches.match(r, { ignoreSearch: true }).then(m => {
        const net = fetch(u.href, { cache: "no-cache" }).then(res => {
          if (res && res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
          return res;
        }).catch(() => null);
        e.waitUntil(net);
        return m || net.then(res => res || caches.match("./index.html"));
      })
    );
  } else if (["www.gstatic.com", "fonts.googleapis.com", "fonts.gstatic.com"].includes(u.hostname)) {
    e.respondWith(
      caches.match(r).then(m => m || fetch(r).then(res => { if (res && res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; }))
    );
  }
});
