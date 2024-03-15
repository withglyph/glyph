import { defineTokens } from '@pandacss/dev';
import { generateREMs } from './helpers';

export const spacing = defineTokens.spacing({
  '1/2': { value: '50%' },
  ...generateREMs(256),
});
