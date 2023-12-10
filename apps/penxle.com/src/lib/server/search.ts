import { Client } from '@opensearch-project/opensearch';
import { PRIVATE_OPENSEARCH_URL } from '$env/static/private';

export const openSearch = new Client({
  node: PRIVATE_OPENSEARCH_URL,
});
