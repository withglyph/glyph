import type { Action } from 'svelte/action';

type Parameter = {
  handler: (isIntersecting: boolean) => void;

  once?: boolean;

  root?: HTMLElement;
  rootMargin?: string;
  threshold?: number;
};

export const intersectionObserver: Action<HTMLElement, Parameter> = (
  element,
  param,
) => {
  const { handler, once } = param;

  const observer = new IntersectionObserver((entries) => {
    const isIntersecting = entries.some((entry) => entry.isIntersecting);
    handler(isIntersecting);
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
