import { HoudiniClient } from '$houdini';
import { batch } from './batch';

// eslint-disable-next-line import/no-default-export
export default new HoudiniClient({
  url: '/api/graphql',
  plugins: [batch],
});
