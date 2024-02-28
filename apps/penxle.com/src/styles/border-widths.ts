import { defineTokens } from '@pandacss/dev';
import { generateREMs } from './helpers';

export const borderWidths = defineTokens.borderWidths({
  ...generateREMs(4),
});
