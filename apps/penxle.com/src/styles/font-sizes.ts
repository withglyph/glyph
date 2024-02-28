import { defineTokens } from '@pandacss/dev';
import { generateREMs } from './helpers';

export const fontSizes = defineTokens.fontSizes({
  ...generateREMs(32),
});
