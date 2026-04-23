const CACHE_NAME = 'fittrack-static-v3';
const urlsToCache = [
  'index.html',
  'style.css',
  'assets/fonts/Poppins-Regular.woff2',
  'script.js',
  'index.js',
  'theme.js',
  'user-name.js',
  'router.js',
  'steps.html',
  'steps.js',
  'water.html',
  'water.js',
  'distance.html',
  'distance.js',
  'weekly.html',
  'weekly.js',
  'progress.html',
  'progress.js',
  'quotes.html',
  'quotes.js',
  'settings.html',
  'settings.js',
  'profile.html',
  'profile.js',
  'performance.html',
  'benchmark.js',
  'about.html',
  'nutrition.html',
  'app.html'
];
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {

            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});


self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseCopy));
          return response;
        })
        .catch(() => caches.match('index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        return response;
      });
    })
  );
});
