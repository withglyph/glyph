import { fromBase64, toBase64 } from 'js-base64';
import { onMount } from 'svelte';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onFlutterMessage = (handler: (message: any) => void) => {
  onMount(() => {
    const fn = (event: { data: string }) => {
      handler(JSON.parse(fromBase64(event.data)));
    };

    window.flutter.addEventListener('message', fn);

    postFlutterMessage({ type: 'ready' });

    return () => {
      window.flutter.removeEventListener('message', fn);
    };
  });
};

export const postFlutterMessage = (message: unknown) => {
  window.flutter.postMessage(toBase64(JSON.stringify(message)));
};
