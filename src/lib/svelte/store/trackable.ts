import { writable } from 'svelte/store';

export const trackable = () => {
  const { subscribe, set } = writable(false);

  const track = async <T>(fn: () => Promise<T>): Promise<T> => {
    set(true);
    try {
      return await fn();
    } finally {
      set(false);
    }
  };

  return {
    track,
    subscribe,
  };
};
