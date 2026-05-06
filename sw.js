const CACHE = "bugandayari-v5";
const PRECACHE = [
  "./",
  "./index.html",
  "./admin.html",
  "./styles/admin.css",
  "./styles/index.css",
  "./scripts/shared.js",
  "./manifest.json",
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,900&family=DM+Sans:wght@300;400;500;600&display=swap",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  // Only handle GET
  if (e.request.method !== "GET") return;

  // Never cache Supabase API calls — always go to network
  if (e.request.url.includes("supabase.co")) {
    return; // let the browser handle it normally
  }

  // For Google Fonts — network first, fallback to cache
  if (
    e.request.url.includes("fonts.gstatic.com") ||
    e.request.url.includes("fonts.googleapis.com")
  ) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request)),
    );
    return;
  }

  // For everything else — network first, then cache
  // This ensures users always get the latest app files
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request).then((cached) => {
          if (cached) return cached;
          // For navigation fallback, return index
          if (e.request.mode === "navigate")
            return caches.match("./index.html");
        }),
      ),
  );
});
