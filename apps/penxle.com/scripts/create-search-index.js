import { Client } from '@opensearch-project/opensearch';

export const openSearch = new Client({
  node: process.env.PRIVATE_OPENSEARCH_URL,
});

await openSearch.indices.create({
  index: 'posts',
  body: {
    settings: {
      index: {
        number_of_shards: 12,
        number_of_replicas: 1,
      },
    },
    mappings: {
      properties: {
        title: { type: 'text', analyzer: 'nori' },
        subtitle: { type: 'text', analyzer: 'nori' },
        tags: { type: 'text', analyzer: 'nori' },
        publishedAt: { type: 'date', format: 'epoch_millis' },
      },
    },
  },
});
