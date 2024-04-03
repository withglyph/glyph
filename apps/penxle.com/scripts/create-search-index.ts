/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Client } from '@elastic/elasticsearch';
import arg from 'arg';
import type { IndicesCreateRequest } from '@elastic/elasticsearch/lib/api/types';

export const elasticSearch = new Client({
  cloud: { id: process.env.PRIVATE_ELASTICSEARCH_CLOUD_ID! },
  auth: { apiKey: process.env.PRIVATE_ELASTICSEARCH_API_KEY! },
});

const args = arg({
  '--production': Boolean,
  '--name': [String],
  '--all': Boolean,
  '--reindex': Boolean,

  '-prod': '--production',
  '-n': '--name',
  '-r': '--reindex',
  '-a': '--all',
});

const version = Date.now();
const env = args['--production'] ? 'prod' : 'dev';

const indexData: Record<string, Omit<IndicesCreateRequest, 'index'>> = {
  posts: {
    settings: {
      index: {
        number_of_shards: 6,
        number_of_replicas: 0,
      },
      analysis: {
        analyzer: {
          ngram_2: {
            type: 'custom',
            tokenizer: 'ngram_2',
            filter: ['lowercase'],
          },
        },
        tokenizer: {
          ngram_2: {
            type: 'ngram',
            token_chars: ['letter', 'digit'],
            min_gram: 2,
            max_gram: 2,
          },
        },
      },
    },
    mappings: {
      properties: {
        title: { type: 'text', analyzer: 'ngram_2' },
        subtitle: { type: 'text', analyzer: 'ngram_2' },
        tags: {
          properties: {
            id: { type: 'keyword' },
            name: {
              type: 'text',
              analyzer: 'ngram_2',
              fields: {
                raw: { type: 'keyword' },
              },
            },
            kind: { type: 'keyword' },
          },
        },
        space: {
          properties: {
            id: { type: 'keyword' },
            name: { type: 'text', analyzer: 'ngram_2' },
          },
        },
        ageRating: { type: 'keyword' },
        reputation: { type: 'rank_feature' },
        publishedAt: { type: 'date', format: 'epoch_millis' },
      },
    },
  },
  tags: {
    settings: {
      index: {
        number_of_shards: 6,
        number_of_replicas: 0,
        analysis: {
          analyzer: {
            ngram_2: {
              type: 'custom',
              tokenizer: 'ngram_2',
              filter: ['lowercase'],
            },
          },
          tokenizer: {
            ngram_2: {
              type: 'ngram',
              token_chars: ['letter', 'digit'],
              min_gram: 2,
              max_gram: 2,
            },
          },
        },
      },
    },
    mappings: {
      properties: {
        name: {
          properties: {
            raw: { type: 'text', analyzer: 'ngram_2' }, // 원본
            disassembled: { type: 'text', analyzer: 'ngram_2' }, // 초중종성 분해
            initial: { type: 'text', analyzer: 'ngram_2' }, // 초성
          },
        },
        usageCount: { type: 'rank_features' },
      },
    },
  },
  collections: {
    settings: {
      index: {
        number_of_shards: 6,
        number_of_replicas: 0,
        analysis: {
          analyzer: {
            ngram_2: {
              type: 'custom',
              tokenizer: 'ngram_2',
              filter: ['lowercase'],
            },
          },
          tokenizer: {
            ngram_2: {
              type: 'ngram',
              token_chars: ['letter', 'digit'],
              min_gram: 2,
              max_gram: 2,
            },
          },
        },
      },
    },
    mappings: {
      properties: {},
    },
  },
};

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
        if (args['--reindex']) {
          await elasticSearch.reindex({
            source: { index: originalIndex },
            dest: { index: `${name}-${version}` },
          });
        }
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

for (const indexName of Object.keys(indexData)) {
  if (args['--all'] || args['--name']?.includes(indexName)) {
    await createIndex(indexName, indexData[indexName]);
  }
}
