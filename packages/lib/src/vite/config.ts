import { defineConfig as defineViteConfig } from 'vite';
import type { UserConfig } from 'vite';

export const defineConfig = (config: UserConfig) => {
  return defineViteConfig({
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
