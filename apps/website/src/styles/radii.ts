import { defineTokens } from '@pandacss/dev';
import { generatePXs } from './helpers';

export const radii = defineTokens.radii({
  ...generatePXs(16),
  full: { value: '9999px' },
});
