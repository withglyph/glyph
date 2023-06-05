import { builder } from '../builder';

export const buildSchema = async () => {
  await Promise.all([import('./image'), import('./test'), import('./user')]);
  return builder.toSchema();
};
