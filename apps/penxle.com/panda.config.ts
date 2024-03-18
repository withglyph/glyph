import { defineConfig } from '@pandacss/dev';
import { breakpoints, conditions, globalCss, hooks, tokens, utilities } from './src/styles';

const prod = process.env.NODE_ENV === 'production';

export default defineConfig({
  include: ['./src/**/*.{js,ts,svelte}'],
  outExtension: 'js',

  eject: true,
  presets: ['@pandacss/preset-base'],

  strictPropertyValues: true,
  strictTokens: true,

  separator: '-',
  hash: prod,
  minify: prod,

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
