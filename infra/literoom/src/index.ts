import { outputs as finalize } from './finalize';
import { outputs as transform } from './transform';

// eslint-disable-next-line import/no-default-export
export default Object.assign({}, finalize, transform);
