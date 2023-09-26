import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Toast = {
  id: symbol;
  type: 'success' | 'error';
  title?: string;
  message: string;
  duration: number;
};

type ToastOptions = Partial<Pick<Toast, 'title' | 'duration'>>;

export const store = writable<Toast[]>([]);
const append = (toast: Omit<Toast, 'id'>) => {
  if (!browser) {
    throw new Error('toast can only be used in browser');
  }
  store.update((toasts) => [...toasts, { id: Symbol(), ...toast }]);
};

export const toast = {
  success: (message: string, options?: ToastOptions) =>
    append({ message, type: 'success', duration: 5000, ...options }),
  error: (message: string, options?: ToastOptions) => append({ message, type: 'error', duration: 10_000, ...options }),
};
