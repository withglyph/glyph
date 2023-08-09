import { App } from './src/app';
import type { SSTConfig } from 'sst';

export default {
  config: () => ({
    name: 'media',
    region: 'ap-northeast-2',
  }),
  stacks: (app) => {
    app.stack(App);
  },
} satisfies SSTConfig;
