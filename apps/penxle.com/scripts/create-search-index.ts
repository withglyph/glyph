/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { argv } from 'node:process';
import ReadLine from 'node:readline';
import { Client } from '@elastic/elasticsearch';
import { prismaClient } from '$lib/server/database';
import { indexPost, indexSpace } from '$lib/server/utils';
import type { IndicesCreateRequest } from '@elastic/elasticsearch/lib/api/types';

export const elasticSearch = new Client({
  cloud: { id: process.env.PRIVATE_ELASTICSEARCH_CLOUD_ID! },
  auth: { apiKey: process.env.PRIVATE_ELASTICSEARCH_API_KEY! },
});

const version = Date.now();
const BATCH_SIZE = 100;
const env = argv[2] === 'dev' ? 'dev' : 'prod';

const wait = (message: string) => {
  const rl = ReadLine.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

await wait(`Create/Update index for ${env} (y/n)? `);

const createIndex = async (name: string, indexBody: Omit<IndicesCreateRequest, 'index'>) => {
  if (env === 'dev') {
    name = `${name}-dev`;
  }

  await elasticSearch.indices.create({
    ...indexBody,
    index: `${name}-${version}`,
  });

  try {
    const getAliasRequest = await elasticSearch.indices.getAlias({ name });
    const originalIndices = Object.keys(getAliasRequest);

    await Promise.all(
      originalIndices.map(async (originalIndex) => {
        await elasticSearch.indices.delete({ index: originalIndex });
      }),
    );
  } catch (err) {
    console.warn(err);
  }

  await elasticSearch.indices.putAlias({
    index: `${name}-${version}`,
    name,
    is_write_index: true,
  });
};

await createIndex('posts', {
  settings: {
    index: {
      number_of_shards: 6,
      number_of_replicas: 0,
    },
    analysis: {
      analyzer: {
        ngram_23: {
          type: 'custom',
          tokenizer: 'ngram_23',
          filter: ['lowercase'],
        },
      },
      tokenizer: {
        ngram_23: {
          type: 'ngram',
          token_chars: ['letter', 'digit'],
          min_gram: 2,
          max_gram: 3,
        },
      },
    },
  },
  mappings: {
    properties: {
      title: { type: 'text', analyzer: 'ngram_23' },
      subtitle: { type: 'text', analyzer: 'ngram_23' },
      tags: {
        properties: {
          id: { type: 'keyword' },
          name: { type: 'text', analyzer: 'ngram_23' },
          nameRaw: { type: 'keyword' },
          kind: { type: 'keyword' },
        },
      },
      spaceId: { type: 'keyword' },
      contentFilters: { type: 'keyword' },
      publishedAt: { type: 'date', format: 'epoch_millis' },
    },
  },
});

await createIndex('spaces', {
  settings: {
    index: {
      number_of_shards: 6,
      number_of_replicas: 0,
    },
    analysis: {
      analyzer: {
        ngram_23: {
          type: 'custom',
          tokenizer: 'ngram_23',
          filter: ['lowercase'],
        },
      },
      tokenizer: {
        ngram_23: {
          type: 'ngram',
          token_chars: ['letter', 'digit'],
          min_gram: 2,
          max_gram: 3,
        },
      },
    },
  },
  mappings: {
    properties: {
      name: { type: 'text', analyzer: 'ngram_23' },
    },
  },
});

await createIndex('tags', {
  settings: {
    index: {
      number_of_shards: 6,
      number_of_replicas: 0,
      analysis: {
        analyzer: {
          ngram_23: {
            type: 'custom',
            tokenizer: 'ngram_23',
            filter: ['lowercase'],
          },
        },
        tokenizer: {
          ngram_23: {
            type: 'ngram',
            token_chars: ['letter', 'digit'],
            min_gram: 2,
            max_gram: 3,
          },
        },
      },
    },
  },
  mappings: {
    properties: {
      name: {
        properties: {
          raw: { type: 'text', analyzer: 'ngram_23' }, // 원본
          disassembled: { type: 'text', analyzer: 'ngram_23' }, // 초중종성 분해
          initial: { type: 'text', analyzer: 'ngram_23' }, // 초성
        },
      },
      usageCount: { type: 'rank_features' },
    },
  },
});

for (let i = 0; ; i++) {
  const posts = await prismaClient.post.findMany({
    skip: i * BATCH_SIZE,
    take: BATCH_SIZE,
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      publishedRevision: true,
      space: true,
    },
  });

  if (posts.length === 0) break;
  for (const post of posts) indexPost(post);

  console.log(`Reindexed ${i * BATCH_SIZE + posts.length} posts.`);
}

for (let i = 0; ; i++) {
  const spaces = await prismaClient.space.findMany({
    skip: i * BATCH_SIZE,
    take: BATCH_SIZE,
  });

  if (spaces.length === 0) break;
  for (const space of spaces) indexSpace(space);

  console.log(`Reindexed ${i * BATCH_SIZE + spaces.length} spaces.`);
}
