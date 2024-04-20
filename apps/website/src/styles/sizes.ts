import { defineTokens } from '@pandacss/dev';
import { generateREMs } from './helpers';

export const sizes = defineTokens.sizes({
  ...generateREMs(1600),

  full: { value: '100%' },
  none: { value: 'none' },

  min: { value: 'min-content' },
  fit: { value: 'fit-content' },
  max: { value: 'max-content' },
});
