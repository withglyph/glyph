import { defineConfig as defineViteConfig } from 'vite';
import type { UserConfig } from 'vite';

export const defineConfig = (config: UserConfig) => {
  return defineViteConfig({
    ...config,
    server: {
      ...config.server,
      host: 'localhost',
      strictPort: true,
      fs: {
        ...config.server?.fs,
        allow: [...(config.server?.fs?.allow ?? []), 'styled-system'],
      },
    },
  });
};
