import { argv } from 'node:process';
import ReadLine from 'node:readline';
import { Client } from '@elastic/elasticsearch';

export const elasticSearch = new Client({
  cloud: { id: process.env.PRIVATE_ELASTICSEARCH_CLOUD_ID },
  auth: { apiKey: process.env.PRIVATE_ELASTICSEARCH_API_KEY },
});

const version = Date.now();

const wait = (message) => {
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

const createIndex = async (name, indexBody) => {
  if (argv[2] === 'dev') {
    name = `${name}-dev`;
  }

  await wait(`Create/Update index ${name} (y/n)? `);

  await elasticSearch.indices.create({
    index: `${name}-${version}`,
    ...indexBody,
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
    },
  },
});
