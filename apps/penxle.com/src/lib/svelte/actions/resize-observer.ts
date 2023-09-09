import type { Action } from 'svelte/action';

type Parameter = (entry: ResizeObserverEntry) => void;

export const resizeObserver: Action<HTMLElement, Parameter> = (
  element,
  callback,
) => {
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      callback(entry);
    }
  });

  observer.observe(element);

  return {
    destroy: () => {
      observer.disconnect();
    },
  };
};
