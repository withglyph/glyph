import type { estypes } from '@elastic/elasticsearch';

export const searchResultToIds = (searchResult: estypes.SearchResponse) =>
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  searchResult.hits.hits.map((hit) => hit._id!);

type RawQueryContainer = {
  query: estypes.QueryDslQueryContainer;
  condition?: boolean;
};

export const makeQueryContainers = (containers: RawQueryContainer[]): estypes.QueryDslQueryContainer[] | undefined => {
  const result: estypes.QueryDslQueryContainer[] = containers
    .map(({ query, condition }) => {
      return condition === false ? undefined : query;
    })
    .filter((container): container is estypes.QueryDslQueryContainer => container !== undefined);

  return result.length > 0 ? result : undefined;
};

export type SearchResponse = estypes.SearchResponse;
