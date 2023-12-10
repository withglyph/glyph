import { Client } from '@opensearch-project/opensearch';
import { env } from '$env/dynamic/private';

export const openSearch = new Client({
  node: env.PRIVATE_OPENSEARCH_URL || 'http://localhost:9200',
});
