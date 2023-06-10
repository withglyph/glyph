import { get } from 'svelte/store';
import { page } from '$app/stores';

export const absolutePath = (path: string) => {
  const { url } = get(page);
  url.pathname = '';
  return new URL(path, url).toString();
};
