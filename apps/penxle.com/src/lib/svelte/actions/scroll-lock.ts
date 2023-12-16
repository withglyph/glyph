import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import type { Action } from 'svelte/action';

export const scrollLock: Action<HTMLElement> = (element) => {
  disableBodyScroll(element);

  return {
    destroy: () => {
      enableBodyScroll(element);
    },
  };
};
