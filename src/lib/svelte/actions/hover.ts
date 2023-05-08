import type { Writable } from '@svelte-kits/store';
import type { Action } from 'svelte/action';

type Parameter = Writable<boolean>;

export const hover: Action<HTMLElement, Parameter> = (element, store) => {
  if (!store) {
    throw new Error('No store provided.');
  }

  const mouseenter = () => store.set(true);
  const mouseleave = () => store.set(false);

  element.addEventListener('mouseenter', mouseenter);
  element.addEventListener('mouseleave', mouseleave);

  return {
    destroy: () => {
      document.removeEventListener('mouseenter', mouseenter);
      document.removeEventListener('mouseleave', mouseleave);
    },
  };
};
