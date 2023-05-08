import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

const cacheKey = `cache-${version}`;
const assets = [...build, ...files];

sw.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(cacheKey);
      await cache.addAll(assets);
      await sw.skipWaiting();
    })()
  );
});

sw.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== cacheKey)
          .map(async (key) => caches.delete(key))
      );
    })()
  );
});

sw.addEventListener('fetch', (event) => {
  if (
    event.request.method !== 'GET' ||
    !assets.includes(new URL(event.request.url).pathname)
  ) {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(cacheKey);
      let response = await cache.match(event.request);

      if (!response) {
        response = await fetch(event.request);
        if (response.status === 200) {
          await cache.put(event.request, response.clone());
        }
      }

      return response;
    })()
  );
});
