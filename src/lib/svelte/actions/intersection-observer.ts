import type { Action } from 'svelte/action';
import type { Writable } from 'svelte/store';

type Parameter = {
  store: Writable<boolean>;

  once?: boolean;

  root?: HTMLElement;
  rootMargin?: string;
  threshold?: number;
};

export const intersectionObserver: Action<HTMLElement, Parameter> = (
  element,
  param
) => {
  const { store, once } = param;

  const observer = new IntersectionObserver((entries) => {
    const isIntersecting = entries.some((entry) => entry.isIntersecting);
    store.set(isIntersecting);
    if (isIntersecting && once) {
      observer.disconnect();
    }
  }, param);

  observer.observe(element);

  return {
    destroy: () => {
      observer.disconnect();
    },
  };
};
