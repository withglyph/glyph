import { Client } from '@opensearch-project/opensearch';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

export const openSearch = new Client({
  node: env.PRIVATE_OPENSEARCH_URL || 'http://localhost:9200',
});

export const indexName = (name: string) => {
  if (dev) {
    return `${name}-dev`;
  }
  return name;
};
