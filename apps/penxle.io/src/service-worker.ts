/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

const cacheKey = `cache-${version}`;
const assets = [...build, ...files];
const remoteAssets = [
  'https://c.pnxl.net/assets/fonts/Pretendard.woff2',
  'https://c.pnxl.net/assets/fonts/RIDIBatang.woff2',
  'https://c.pnxl.net/assets/fonts/FiraCode.woff2',
];

sw.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(cacheKey);
      await cache.addAll(assets);
      await cache.addAll(remoteAssets);
      await sw.skipWaiting();
    })(),
  );
});

sw.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== cacheKey).map(async (key) => caches.delete(key)));
    })(),
  );
});

sw.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET') {
    return;
  }

  if ((url.origin !== sw.location.origin || !assets.includes(url.pathname)) && !remoteAssets.includes(url.href)) {
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
    })(),
  );
});
