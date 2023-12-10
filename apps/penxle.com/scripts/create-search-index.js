import { Client } from '@opensearch-project/opensearch';

export const openSearch = new Client({
  node: process.env.PRIVATE_OPENSEARCH_URL,
});

const version = Date.now();

await openSearch.indices.create({
  index: `posts-${version}`,
  body: {
    settings: {
      index: {
        number_of_shards: 12,
        number_of_replicas: 0,
      },
    },
    mappings: {
      properties: {
        title: { type: 'text', analyzer: 'nori' },
        subtitle: { type: 'text', analyzer: 'nori' },
        tags: {
          properties: {
            id: { type: 'keyword' },
            name: { type: 'text', analyzer: 'nori' },
          },
        },
        spaceId: { type: 'keyword' },
        publishedAt: { type: 'date', format: 'epoch_millis' },
      },
    },
  },
});

try {
  const getAliasRequest = await openSearch.indices.getAlias({ name: 'posts' });
  const aliases = Object.keys(getAliasRequest.body);

  await Promise.all(
    aliases.map(async (alias) => {
      await openSearch.reindex({
        body: {
          source: { index: alias },
          dest: { index: `posts-${version}` },
        },
      });

      await openSearch.indices.delete({ index: alias });
    }),
  );
} catch {
  /* empty */
}

await openSearch.indices.putAlias({
  index: `posts-${version}`,
  name: 'posts',
});
