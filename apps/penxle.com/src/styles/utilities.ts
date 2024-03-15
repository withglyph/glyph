import { defineUtility } from '@pandacss/dev';

export const utilities = {
  size: defineUtility({
    className: 's',
    values: 'sizes',
    transform: (value) => ({
      width: value,
      height: value,
    }),
  }),
};
