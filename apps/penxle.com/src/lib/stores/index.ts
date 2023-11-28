import { writable } from 'svelte/store';

export const pageTitle = writable<string | null>(null);
export const pageSubTitle = writable<string | null>(null);

export const openLoginRequiredModal = writable<boolean>(false);
