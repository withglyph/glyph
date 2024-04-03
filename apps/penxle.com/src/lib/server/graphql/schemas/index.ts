import { building, dev } from '$app/environment';
import { builder } from '../builder';

if (!building) {
  await import('./bookmark');
  await import('./collection');
  await import('./comment');
  await import('./embed');
  await import('./enums');
  await import('./feed');
  await import('./file');
  await import('./image');
  await import('./internal');
  await import('./notification');
  await import('./playground');
  await import('./point');
  await import('./post');
  await import('./revenue');
  await import('./search');
  await import('./space');
  await import('./tag');
  await import('./user');
}

export const schema = builder.toSchema();

if (dev) {
  const { writeFileSync } = await import('node:fs');
  const { lexicographicSortSchema, printSchema } = await import('graphql');
  writeFileSync('schema.graphql', `${printSchema(lexicographicSortSchema(schema))}\n`);
}
