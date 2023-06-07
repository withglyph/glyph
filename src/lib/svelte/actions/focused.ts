import type { Writable } from '@svelte-kits/store';
import type { Action } from 'svelte/action';

type Parameter = Writable<boolean>;

export const focused: Action<HTMLElement, Parameter> = (element, store) => {
  const focus = () => store.set(true);
  const blur = () => store.set(false);

  element.addEventListener('focus', focus);
  element.addEventListener('blur', blur);

  return {
    destroy: () => {
      document.removeEventListener('focus', focus);
      document.removeEventListener('blur', blur);
    },
  };
};
