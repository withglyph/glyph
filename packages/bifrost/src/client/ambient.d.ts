declare module '$bifrost/client' {
  import { BifrostClient } from '.';

  const factory: () => BifrostClient;

  // eslint-disable-next-line import/no-default-export
  export default factory;
}
