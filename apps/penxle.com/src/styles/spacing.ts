import { defineTokens } from '@pandacss/dev';
import { generateREMs } from './helpers';

export const spacing = defineTokens.spacing({
  ...generateREMs(256),
});
