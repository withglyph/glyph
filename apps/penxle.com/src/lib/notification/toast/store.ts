import { writable } from '@svelte-kits/store';

type ToastType = 'info' | 'success' | 'error';

export type Toast = ToastOptions & {
  id: symbol;

  type: ToastType;
  message: string;

  dismiss: () => void;
  set: (toast: Partial<Omit<Toast, 'id'>>) => void;

  mounted: boolean;
  top: number;
  height: number;
};

type ToastOptions = {
  title?: string;
  duration: number;
};

type ToastReturn = Pick<Toast, 'dismiss'>;

const createToastStore = () => {
  const { subscribe, update } = writable<Toast[]>([]);

  return {
    subscribe,
    toast: (
      type: ToastType,
      message: string,
      options?: Partial<ToastOptions>,
    ) => {
      const id = Symbol();

      const toast: Toast = {
        id,

        message,
        type,
        title: options?.title,
        duration: options?.duration ?? 5000,

        dismiss: () => update((toasts) => toasts.filter((t) => t.id !== id)),
        set: (toast) =>
          update((toasts) =>
            toasts.map((t) => (t.id === id ? { ...t, ...toast } : t)),
          ),

        mounted: false,
        top: 0,
        height: 0,
      };

      update((toasts) => [toast, ...toasts]);

      return toast as ToastReturn;
    },
  };
};

export const store = createToastStore();
export const toast = {
  info: (message: string, options?: Partial<ToastOptions>) =>
    store.toast('info', message, options),
  success: (message: string, options?: Partial<ToastOptions>) =>
    store.toast('success', message, options),
  error: (message: string, options?: Partial<ToastOptions>) =>
    store.toast('error', message, options),
};
