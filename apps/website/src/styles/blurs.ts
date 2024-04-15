import { defineTokens } from '@pandacss/dev';
import { generatePXs } from './helpers';

export const blurs = defineTokens.blurs({
  ...generatePXs(16),
});
