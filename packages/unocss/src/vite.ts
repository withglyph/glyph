import { loadConfig } from '@unocss/config';
import { createGenerator } from '@unocss/core';
import { unoPreprocess } from './preprocess';
import type { Plugin } from 'vite';

export const unocss = (): Plugin[] => {
  return [preprocess(), virtual()];
};

const preprocess = (): Plugin => {
  return {
    name: '@penxle/unocss:preprocess',
    api: { sveltePreprocess: unoPreprocess() },
  };
};

const virtual = (): Plugin => {
  const virtualModuleId = 'virtual:uno.css';
  const resolvedVirtualModuleId = `\0${virtualModuleId}`;

  const configPromise = loadConfig();

  return {
    name: '@penxle/unocss:virtual',
    resolveId: (id) => {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load: async (id) => {
      if (id === resolvedVirtualModuleId) {
        const { config } = await configPromise;
        const generator = createGenerator(config);

        const { css } = await generator.generate('', {
          preflights: true,
          safelist: true,
          minify: true,
        });

        return css;
      }
    },
  };
};
