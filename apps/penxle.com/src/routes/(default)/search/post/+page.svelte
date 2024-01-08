<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import qs from 'query-string';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { Pagination, PostCard } from '$lib/components';
  import { TabHead, TabHeadItem } from '$lib/components/tab';
  import { initSearchFilter } from '../util';

  $: query = graphql(`
    query SearchPostPage_Query(
      $query: String!
      $includeTags: [String!]! = []
      $excludeTags: [String!]! = []
      $adultFilter: Boolean
      $excludeContentFilters: [ContentFilterCategory!]
      $orderBy: OrderByKind!
      $page: Int! = 1
    ) {
      searchPosts(
        query: $query
        includeTags: $includeTags
        excludeTags: $excludeTags
        adultFilter: $adultFilter
        excludeContentFilters: $excludeContentFilters
        orderBy: $orderBy
        page: $page
      ) {
        count

        posts {
          id
          ...Feed_post
        }
      }
    }
  `);

  let {
    includeTags,
    excludeTags,
    adultFilter,
    excludeContentFilters,
    orderBy,
    page: initialIndex,
  } = initSearchFilter($page.url.search);

  const updateSearchFilter = (currentPage: number) => {
    const stringifiedURL = qs.stringifyUrl(
      {
        url: '/search/post',
        query: {
          q: $page.url.searchParams.get('q'),
          include_tags: includeTags,
          exclude_tags: excludeTags,
          adult: adultFilter,
          exclude_triggers: excludeContentFilters,
          order_by: orderBy,
          page: currentPage,
        },
      },
      {
        skipNull: false,
      },
    );

    location.href = stringifiedURL;
  };
</script>

<Helmet title="{$page.url.searchParams.get('q')} - 펜슬 검색결과" />

<div class="body-14-m text-secondary py-1 px-3 rounded-lg bg-surface-primary mt-3 <sm:mx-4">
  🔍 약 {$query.searchPosts.count}개의 검색결과가 있어요!
</div>

<TabHead class="mt-9 w-full <sm:(sticky top-61px z-1) sm:mb-4" variant="secondary">
  <TabHeadItem id={0} href={`/search?q=${$page.url.searchParams.get('q')}`}>전체</TabHeadItem>
  <TabHeadItem id={1} class="text-black! border-black!" href={`/search/post?q=${$page.url.searchParams.get('q')}`}>
    포스트
  </TabHeadItem>
  <TabHeadItem id={2} href={`/search/space?q=${$page.url.searchParams.get('q')}`}>스페이스</TabHeadItem>
  <TabHeadItem id={3} href={`/search/tag?q=${$page.url.searchParams.get('q')}`}>태그</TabHeadItem>
</TabHead>

{#if $query.searchPosts.count === 0}
  <div class="text-secondary body-15-b text-center flex center min-h-50">검색 결과가 없어요</div>
{:else}
  <div class="<sm:bg-primary">
    {#each $query.searchPosts.posts as post (post.id)}
      <PostCard class="mt-4 first:mt-0" $post={post} />
    {/each}
    <Pagination count={$query.searchPosts.count} {initialIndex} onChange={updateSearchFilter} />
  </div>
{/if}
