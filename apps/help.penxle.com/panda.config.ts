import { defineConfig } from '@pandacss/dev';

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
});
