<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import clsx from 'clsx';
  import qs from 'query-string';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { PostCard } from '$lib/components';
  import { TabHead, TabHeadItem } from '$lib/components/tab';
  import type { ContentFilterCategory, OrderByKind } from '$glitch';

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

  let includeTags: string[] = [];
  let excludeTags: string[] = [];
  let adultFilter: boolean | null = null;
  let excludeContentFilters: ContentFilterCategory[] = [];
  let orderBy: OrderByKind = 'ACCURACY';
  let currentPage = 1;
  let pagination = 1;

  $: totalPage = Math.ceil($query.searchPosts.count / 10);

  $: if (qs.parseUrl($page.url.search)?.query) {
    const parsedURL = qs.parseUrl($page.url.search).query;

    adultFilter =
      $page.url.searchParams.get('adult') === '' ? null : JSON.parse($page.url.searchParams.get('adult') as string);

    if (parsedURL.include_tags) {
      if (typeof parsedURL.include_tags === 'string') {
        includeTags = [parsedURL.include_tags];
      } else if (typeof parsedURL.include_tags === 'object') {
        includeTags = parsedURL.include_tags as string[];
      }
    }

    if (parsedURL.exclude_tags) {
      if (typeof parsedURL.exclude_tags === 'string') {
        excludeTags = [parsedURL.exclude_tags];
      } else if (typeof parsedURL.exclude_tags === 'object') {
        excludeTags = parsedURL.exclude_tags as string[];
      }
    }

    if (parsedURL.exclude_triggers) {
      if (typeof parsedURL.exclude_triggers === 'string') {
        excludeContentFilters = [parsedURL.exclude_triggers] as ContentFilterCategory[];
      } else if (typeof parsedURL.exclude_triggers === 'object') {
        excludeContentFilters = parsedURL.exclude_triggers as ContentFilterCategory[];
      }
    }

    orderBy = parsedURL.order_by === 'LATEST' ? 'LATEST' : 'ACCURACY';

    currentPage = parsedURL.page ? Number(parsedURL.page) : 1;

    if (parsedURL.page) {
      pagination = Math.ceil(Number(parsedURL.page) / 10);
    }
  }

  const addSearchOption = async () => {
    const url = qs.stringifyUrl(
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
    await goto(url);
  };
</script>

<Helmet title="{$page.url.searchParams.get('q')} - 검색" />

<div class="body-14-m text-secondary py-1 px-3 rounded-lg bg-surface-primary mt-3 <sm:mx-4">
  🔍 약 {$query.searchPosts.count}개의 검색결과가 있어요!
</div>

<TabHead class="mt-9 mb-4 w-full <sm:(sticky top-61px z-1)" variant="secondary">
  <TabHeadItem id={0} href={`/search?q=${$page.url.searchParams.get('q')}`}>전체</TabHeadItem>
  <TabHeadItem id={1} class="text-black! border-black!" href={`/search/post?q=${$page.url.searchParams.get('q')}`}>
    포스트
  </TabHeadItem>
  <TabHeadItem id={2} href={`/search/space?q=${$page.url.searchParams.get('q')}`}>스페이스</TabHeadItem>
  <TabHeadItem id={3} href={`/search/tag?q=${$page.url.searchParams.get('q')}`}>태그</TabHeadItem>
</TabHead>

{#if $query.searchPosts.posts.length === 0}
  <div class="text-secondary body-15-b text-center flex center min-h-50">검색 결과가 없어요</div>
{:else}
  <div class="<sm:bg-primary">
    {#each $query.searchPosts.posts as post (post.id)}
      <PostCard class="mt-4" $post={post} />
    {/each}
    <div class="flex center mt-9 gap-1">
      <button
        class="square-7 flex center disabled:(text-disabled cursor-not-allowed)"
        disabled={currentPage <= 10}
        type="button"
        on:click={() => {
          currentPage = (pagination - 1) * 10;
          pagination -= 1;

          addSearchOption();
        }}
      >
        <i class="i-lc-chevron-left square-3.5" />
      </button>
      {#each Array.from({ length: totalPage - (pagination - 1) * 10 > 10 ? 10 : totalPage - (pagination - 1) * 10 }, (_, i) => (pagination - 1) * 10 + (i + 1)) as pageNum (pageNum)}
        <button
          class={clsx(
            'square-8 p-2 rounded-lg border border-alphagray-10 flex center body-13-b transition hover:(bg-gray-90 text-darkprimary)',
            currentPage === pageNum && 'bg-gray-90! text-darkprimary!',
          )}
          type="button"
          on:click={() => {
            currentPage = pageNum;

            addSearchOption();
          }}
        >
          {pageNum}
        </button>
      {/each}
      <button
        class="square-7 flex center disabled:(text-disabled cursor-not-allowed)"
        disabled={totalPage <= 10 || pagination === Math.ceil(totalPage / 10)}
        type="button"
        on:click={() => {
          pagination = Math.ceil((currentPage + 10) / 10);
          currentPage = (pagination - 1) * 10 + 1;

          addSearchOption();
        }}
      >
        <i class="i-lc-chevron-right square-3.5" />
      </button>
    </div>
  </div>
{/if}
