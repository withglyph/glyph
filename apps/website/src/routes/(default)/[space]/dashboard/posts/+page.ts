import { initFilter } from './filter';
import type { PageLoadEvent } from './$types';

export const _SpaceDashboardPostsPage_QueryVariables = (event: PageLoadEvent) => {
  const { visibility, price, collectionId, anyCollection } = initFilter(event.url.search);

  return { slug: event.params.space, collectionId, priceCategory: price, visibility, anyCollection };
};
