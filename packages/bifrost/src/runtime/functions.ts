import { readable } from 'svelte/store';

export const graphql = () => {
  throw new Error('should not reach here');
};

export const fragment = (data: unknown) => {
  return readable(data);
};
