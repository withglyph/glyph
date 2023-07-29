import { unoPreprocess } from './preprocess';
import type { Plugin } from 'vite';

export const unocss = (): Plugin[] => {
  return [preprocess()];
};

const preprocess = (): Plugin => {
  return {
    name: '@penxle/unocss:preprocess',
    api: { sveltePreprocess: unoPreprocess() },
  };
};
