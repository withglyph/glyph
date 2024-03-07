import { defineUtility } from '@pandacss/dev';

export const utilities = {
  size: defineUtility({
    values: 'sizes',
    transform: (value) => ({
      width: value,
      height: value,
    }),
  }),
};
