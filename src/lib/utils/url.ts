import { get } from 'svelte/store';
import { page } from '$app/stores';

export const absolutePath = (path: string) =>
  new URL(path, get(page).url).toString();
