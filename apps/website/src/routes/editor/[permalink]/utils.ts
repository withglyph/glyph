import type { Writable } from 'svelte/store';
import type { EditorState } from './context';

export const createLoroStore = (state: EditorState, name: 'title' | 'subtitle') => {
  const root = state.document.getMap('root');

  const store: Writable<string | null> = {
    subscribe: (set) => {
      const subscriptionId = root.subscribe(state.document, () => {
        const value = root.get(name);
        set(value === undefined || value === '' ? null : value);
      });

      return () => state.document.unsubscribe(subscriptionId);
    },
    set: (value: string) => {
      root.set(name, value);
      state.document.commit();
    },
    update: (fn: (value: string) => string) => {
      root.set(name, fn(root.get(name) ?? ''));
      state.document.commit();
    },
  };

  return store;
};
