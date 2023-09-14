import { writable } from 'svelte/store';

export type Toast = {
  id: symbol;
  type: 'success' | 'error';
  message: string;
};

export const store = writable<Toast[]>([]);
const showToast = (type: 'success' | 'error', message: string) => {
  const id: unique symbol = Symbol();
  store.update((toasts) => [...toasts, { id, type, message }]);
};

export const toast = {
  success: (message: string) => showToast('success', message),
  error: (message: string) => showToast('error', message),
};
