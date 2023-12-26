import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import type { Action } from 'svelte/action';

export const scrollLock: Action<HTMLElement> = (element) => {
  disableBodyScroll(element, {
    allowTouchMove: (el) => {
      while (el !== document.body) {
        if (el instanceof HTMLElement && el.dataset.scrollLockIgnore !== undefined) return true;
        if (el.parentElement === null) return false;
        el = el.parentElement;
      }

      return false;
    },
  });

  return {
    destroy: () => {
      enableBodyScroll(element);
    },
  };
};
