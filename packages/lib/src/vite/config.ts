import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';
import { defineConfig as defineViteConfig } from 'vite';
import type { UserConfig } from 'vite';

export const defineConfig = (config: UserConfig) => {
  return defineViteConfig({
    build: {
      cssMinify: 'lightningcss',
    },
    css: {
      transformer: 'lightningcss',
      lightningcss: {
        targets: browserslistToTargets(browserslist('> 0.25%, last 2 versions, not dead')),
      },
    },
    ...config,
    server: {
      host: 'localhost',
      strictPort: true,
      ...config.server,
    },
    ssr: {
      ...config.ssr,
      external: config.ssr?.external === true ? true : ['@penxle/tracing', ...(config.ssr?.external ?? [])],
    },
  });
};
