import { loadAll } from '$lib/api';

export const load = async (event) => {
  await loadAll(event.fetch);
};
