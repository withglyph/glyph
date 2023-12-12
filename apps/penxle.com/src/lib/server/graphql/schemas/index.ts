import { dev } from '$app/environment';
import { addSchema, createBuilder } from '../builder';
import { bookmarkSchema } from './bookmark';
import { collectionSchema } from './collection';
import { enumsSchema } from './enums';
import { feedSchema } from './feed';
import { fileSchema } from './file';
import { imageSchema } from './image';
import { internalSchema } from './internal';
import { playgroundSchema } from './playground';
import { pointSchema } from './point';
import { postSchema } from './post';
import { revenueSchema } from './revenue';
import { searchSchema } from './search';
import { spaceSchema } from './space';
import { tagSchema } from './tag';
import { userSchema } from './user';

const builder = createBuilder();
addSchema(builder, [
  bookmarkSchema,
  collectionSchema,
  enumsSchema,
  feedSchema,
  fileSchema,
  imageSchema,
  internalSchema,
  playgroundSchema,
  pointSchema,
  postSchema,
  revenueSchema,
  searchSchema,
  spaceSchema,
  tagSchema,
  userSchema,
]);

export const schema = builder.toSchema();

if (dev) {
  const { writeFileSync } = await import('node:fs');
  const { lexicographicSortSchema, printSchema } = await import('graphql');
  writeFileSync('schema.graphql', `${printSchema(lexicographicSortSchema(schema))}\n`);
}
