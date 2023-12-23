import { Client } from '@elastic/elasticsearch';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

export const elasticSearch = new Client({
  cloud: { id: env.PRIVATE_ELASTICSEARCH_CLOUD_ID || ':' },
  auth: { apiKey: env.PRIVATE_ELASTICSEARCH_API_KEY },
});

export const indexName = (name: string) => {
  if (dev) {
    return `${name}-dev`;
  }
  return name;
};
