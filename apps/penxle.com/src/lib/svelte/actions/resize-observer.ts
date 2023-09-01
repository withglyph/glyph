import type { Action } from 'svelte/action';

type Attributes = {
  'on:resizeObserved': (event: CustomEvent<ResizeObserverEntry>) => void;
};

export const resizeObserver: Action<HTMLElement, void, Attributes> = (
  element,
) => {
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      element.dispatchEvent(
        new CustomEvent('resizeObserved', { detail: entry }),
      );
    }
  });

  observer.observe(element);

  return {
    destroy: () => {
      observer.disconnect();
    },
  };
};
