import { loadConfig } from '@unocss/config';
import { createGenerator } from '@unocss/core';
import { unoPreprocess } from './preprocess';
import { transformCode } from './transform';
import type { UnoGenerator } from '@unocss/core';
import type { Plugin } from 'vite';

export const unocss = async (): Promise<Plugin[]> => {
  const { config } = await loadConfig();
  const uno = createGenerator(config);

  return [
    transform(uno, 'pre'),
    preprocess(uno),
    virtual(uno),
    transform(uno, 'default'),
    transform(uno, 'post'),
  ];
};

const preprocess = (uno: UnoGenerator): Plugin => {
  return {
    name: '@penxle/unocss:preprocess',
    enforce: 'pre',
    api: { sveltePreprocess: unoPreprocess(uno) },
  };
};

const virtual = (uno: UnoGenerator): Plugin => {
  const virtualModuleId = 'virtual:uno.css';
  const resolvedVirtualModuleId = `\0${virtualModuleId}`;

  return {
    name: '@penxle/unocss:virtual',
    enforce: 'pre',
    resolveId: (id) => {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load: async (id) => {
      if (id === resolvedVirtualModuleId) {
        const { css } = await uno.generate('', {
          preflights: true,
          safelist: true,
          minify: true,
        });

        return css;
      }
    },
  };
};

const transform = (
  uno: UnoGenerator,
  enforce: 'pre' | 'default' | 'post',
): Plugin => {
  return {
    name: `@penxle/unocss:${enforce}-transform`,
    enforce: enforce === 'default' ? undefined : enforce,
    transform: async (code, id) => {
      return await transformCode(uno, id, code, enforce);
    },
  };
};
