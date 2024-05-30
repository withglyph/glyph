import qs from 'query-string';
import type { PostPriceCategory, PostVisibility } from '$glitch';

export const initFilter = (param: string) => {
  let visibility: PostVisibility | null = null;
  let price: PostPriceCategory | null = null;
  let collectionId: string | null = null;
  let anyCollection: false | undefined = undefined;

  const parsedURL = qs.parseUrl(param).query;

  if (parsedURL.visibility && typeof parsedURL.visibility === 'string') {
    visibility = parsedURL.visibility as PostVisibility;
  }

  if (parsedURL.price && typeof parsedURL.price === 'string') {
    price = parsedURL.price as PostPriceCategory;
  }

  if (parsedURL.collectionId && typeof parsedURL.collectionId === 'string') {
    collectionId = parsedURL.collectionId as string;
  }

  if (parsedURL.anyCollection) {
    anyCollection = JSON.parse(parsedURL.anyCollection.toString());
  }

  return { visibility, price, collectionId, anyCollection };
};
