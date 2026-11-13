/* Offline app shell only. Applicant data and recruiting activity feeds are never cached. */
const CACHE_NAME = "ghd-recruiting-app-shell-v3";
const SCOPE = self.registration.scope;
const URLS = ["./", "./index.html", "./styles.css", "./install.css", "./app.js", "./install.js", "./logo.png", "./icon-192.png", "./icon-512.png", "./manifest.webmanifest", "./scout.html", "./scout.css", "./scout.js", "./contact.html", "./contact.css", "./privacy.html", "./recruiter.html", "./recruiter.css"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(URLS.map(p => new URL(p, SCOPE).href))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("ghd-recruiting-") && k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(SCOPE) || url.pathname.endsWith("/scout-feed.json")) return;
  const isNavigation = req.mode === "navigate";
  if (isNavigation) {
    event.respondWith(fetch(req).catch(async () => (await caches.match(req)) || caches.match(new URL("./index.html", SCOPE).href)));
  } else {
    event.respondWith(caches.match(req).then(hit => hit || fetch(req)));
  }
});