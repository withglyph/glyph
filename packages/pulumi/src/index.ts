import fg from 'fast-glob';

export const index = async () => {
  const paths = await fg('pulumi/**/*.ts', {
    absolute: true,
    ignore: ['pulumi/index.ts'],
  });
  const imports = paths.map((path) => import(path));
  const outputs = imports.map((i) =>
    i.then(({ outputs }: { outputs: Record<string, unknown> }) => outputs),
  );

  const awaited = await Promise.all(outputs);

  return Object.assign({}, ...awaited);
};

export { bedrockRef } from './ref';
