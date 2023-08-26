import fg from 'fast-glob';

const paths = await fg('src/**/*.ts', { ignore: ['src/index.ts'] });
const imports = paths.map((path) => import('../' + path));
const outputs = imports.map((i) =>
  i.then(({ outputs }: { outputs: Record<string, unknown> }) => outputs),
);

const awaited = await Promise.all(outputs);
// eslint-disable-next-line import/no-default-export
export default Object.assign({}, ...awaited);
