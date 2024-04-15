import { Client } from '@elastic/elasticsearch';
import { stack } from '@withglyph/lib/environment';
import { env } from '$env/dynamic/private';

export const elasticSearch = new Client({
  cloud: { id: env.PRIVATE_ELASTICSEARCH_CLOUD_ID || ':' },
  auth: { apiKey: env.PRIVATE_ELASTICSEARCH_API_KEY },
});

export type ElasticSearchEnvironment = 'prod' | 'dev';

export const indexName = (name: string, env?: ElasticSearchEnvironment) => {
  if (env !== 'dev' && (stack === 'prod' || stack === 'staging' || env === 'prod')) {
    return name;
  }
  return `${name}-dev`;
};
