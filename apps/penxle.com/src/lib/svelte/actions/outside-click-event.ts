import type { Action } from 'svelte/action';

type Attributes = {
  'on:outsideClick': (event: CustomEvent) => void;
};

export const outsideClickEvent: Action<HTMLElement, undefined, Attributes> = (element) => {
  const handler = (event: MouseEvent) => {
    try {
      if (!element.contains(event.target as Node)) {
        element.dispatchEvent(new CustomEvent('outsideClick'));
      }
    } catch {
      // skip
    }
  };

  document.addEventListener('click', handler);

  return {
    destroy: () => {
      document.removeEventListener('click', handler);
    },
  };
};
