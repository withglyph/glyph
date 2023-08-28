import './image';
import './playground';
import './space';
import './user';
import './post';

import { dev } from '$app/environment';
import { builder } from '../builder';

export const schema = builder.toSchema();

if (dev) {
  const { writeFileSync } = await import('node:fs');
  const { lexicographicSortSchema, printSchema } = await import('graphql');
  writeFileSync(
    'schema.graphql',
    `${printSchema(lexicographicSortSchema(schema))}\n`,
  );
}
