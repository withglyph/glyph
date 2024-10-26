import { fromBase64, toBase64 } from 'js-base64';
import { onMount } from 'svelte';
import { get } from 'svelte/store';
import { page } from '$app/stores';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onFlutterMessage = (handler: (message: any) => void) => {
  onMount(() => {
    if (!window.flutter) {
      return;
    }

    const fn = (event: { data: string }) => {
      handler(JSON.parse(fromBase64(event.data)));
    };

    window.flutter.addEventListener('message', fn);

    return () => {
      window.flutter.removeEventListener('message', fn);
    };
  });
};

export const postFlutterMessage = (message: unknown) => {
  if (!window.flutter) {
    return;
  }

  window.flutter.postMessage(toBase64(JSON.stringify(message)));
};

export const isWebView = () => {
  const p = get(page);
  return !!p.data.__isWebView || p.url.searchParams.has('__wb');
};
