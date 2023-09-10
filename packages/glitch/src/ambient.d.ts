declare module '$glitch/client' {
  import { GlitchClient } from './types';

  const factory: (isClient: boolean) => GlitchClient;

  // eslint-disable-next-line import/no-default-export
  export default factory;
}
