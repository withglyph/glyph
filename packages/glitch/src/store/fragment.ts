import { readable } from 'svelte/store';

export const createFragmentStore = (ref: unknown) => {
  return readable(ref);
};
