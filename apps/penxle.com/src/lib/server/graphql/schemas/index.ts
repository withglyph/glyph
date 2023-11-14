import './enums';
import './file';
import './image';
import './internal';
import './playground';
import './point';
import './post';
import './space';
import './tag';
import './user';

import { dev } from '$app/environment';
import { builder } from '../builder';

export const schema = builder.toSchema();

if (dev) {
  const { writeFileSync } = await import('node:fs');
  const { lexicographicSortSchema, printSchema } = await import('graphql');
  writeFileSync('schema.graphql', `${printSchema(lexicographicSortSchema(schema))}\n`);
}
