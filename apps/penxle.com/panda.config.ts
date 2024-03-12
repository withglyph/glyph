import { defineConfig } from '@pandacss/dev';
import { breakpoints, conditions, globalCss, hooks, tokens, utilities } from './src/styles';

const prod = process.env.NODE_ENV === 'production';

export default defineConfig({
  preflight: true,
  include: ['./src/**/*.{js,ts,svelte}'],

  eject: true,
  presets: ['@pandacss/preset-base'],

  strictPropertyValues: true,
  strictTokens: true,

  separator: '-',
  hash: prod,
  minify: prod,

  lightningcss: true,
  browserslist: ['> 2%', 'last 2 versions', 'not dead'],

  theme: {
    breakpoints,
    tokens,
  },

  globalCss,

  conditions,
  utilities,

  hooks: prod
    ? {
        'cssgen:done': ({ artifact, content }) => {
          if (artifact === 'styles.css') {
            return hooks.removeUnusedCssVars(content);
          }
        },
      }
    : undefined,
});
