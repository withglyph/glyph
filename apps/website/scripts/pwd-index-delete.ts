#!/usr/bin/env node

import { Client } from '@elastic/elasticsearch';
import { and, eq, isNotNull } from 'drizzle-orm';
import { database, Posts } from '$lib/server/database';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export const elasticSearch = new Client({
  cloud: { id: process.env.PRIVATE_ELASTICSEARCH_CLOUD_ID! },
  auth: { apiKey: process.env.PRIVATE_ELASTICSEARCH_API_KEY! },
});

/* eslint-enable @typescript-eslint/no-non-null-assertion */

for (let i = 0; ; i++) {
  const posts = await database
    .select({
      id: Posts.id,
    })
    .from(Posts)
    .where(and(eq(Posts.state, 'PUBLISHED'), isNotNull(Posts.password)))
    .orderBy(Posts.id)
    .limit(100)
    .offset(i * 100);

  if (posts.length === 0) {
    break;
  }

  elasticSearch.bulk({
    index: 'posts',
    operations: posts.map((post) => ({
      delete: { _id: post.id },
    })),
  });
}

console.log('OK');
process.exit(0);
