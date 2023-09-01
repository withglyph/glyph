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
        drafts: { nesting: true },
        targets: browserslistToTargets(
          browserslist('> 0.25%, last 2 versions, not dead'),
        ),
      },
    },
    ...config,
    server: {
      host: '127.0.0.1',
      strictPort: true,
      ...config.server,
    },
  });
};
