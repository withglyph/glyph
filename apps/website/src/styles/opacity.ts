import { defineTokens } from '@pandacss/dev';

export const opacity = defineTokens.opacity({
  ...Object.fromEntries([...Array.from({ length: 101 }).keys()].map((i) => [`${i}`, { value: `${i / 100}` }])),
});
