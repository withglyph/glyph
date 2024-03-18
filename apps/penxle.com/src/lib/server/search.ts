import { Client } from '@elastic/elasticsearch';
import { stack } from '@penxle/lib/environment';
import { env } from '$env/dynamic/private';

export const elasticSearch = new Client({
  cloud: { id: env.PRIVATE_ELASTICSEARCH_CLOUD_ID || ':' },
  auth: { apiKey: env.PRIVATE_ELASTICSEARCH_API_KEY },
});

export const indexName = (name: string) => {
  if (stack === 'prod' || stack === 'staging') {
    return name;
  }
  return `${name}-dev`;
};
