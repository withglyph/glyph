<script lang="ts">
  import qs from 'query-string';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { Helmet } from '$lib/components';
  import { Select, SelectItem } from '$lib/components/v2/select';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import { initFilter } from './filter';
  import PostManageTable from './PostManageTable.svelte';

  $: query = graphql(`
    query SpaceDashboardPostsPage_Query(
      $slug: String!
      $collectionId: ID
      $priceCategory: PostPriceCategory
      $visibility: PostVisibility
      $collectionlessOnly: Boolean
    ) {
      space(slug: $slug) {
        id
        slug
        name

        posts(
          collectionId: $collectionId
          priceCategory: $priceCategory
          visibility: $visibility
          collectionlessOnly: $collectionlessOnly
        ) {
          id
          ...PostManageTable_post
        }

        collections {
          id
          name
        }
      }

      ...PostManageTable_query
    }
  `);

  let { visibility, price, collectionId, collectionlessOnly } = initFilter($page.url.search);

  $: {
    visibility = initFilter($page.url.search).visibility;
    price = initFilter($page.url.search).price;
    collectionId = initFilter($page.url.search).collectionId;
    collectionlessOnly = initFilter($page.url.search).collectionlessOnly;

    [$page.url.search];
  }

  const updateSearchFilter = () => {
    const stringifiedURL = qs.stringifyUrl(
      {
        url: `/${$query.space.slug}/dashboard/posts`,
        query: {
          visibility,
          price,
          collectionId,
          collectionlessOnly,
        },
      },
      { skipNull: true },
    );

    location.href = stringifiedURL;
  };

  const visibilityToLocaleString = {
    PUBLIC: '전체공개',
    SPACE: '멤버공개',
    UNLISTED: '링크공개',
  };

  const priceToLocaleString = {
    ALL: '유료/무료',
    FREE: '무료',
    PAID: '유료',
  }[price ?? 'ALL'];
</script>

<Helmet description={`${$query.space.name} 스페이스 포스트 관리`} title={`포스트 관리 | ${$query.space.name}`} />

<h1 class={css({ marginBottom: '32px', fontSize: '24px', fontWeight: 'bold', hideBelow: 'sm' })}>포스트</h1>

<div class={flex({ align: 'center', gap: '12px', wrap: 'wrap', marginBottom: { base: '24px', sm: '20px' } })}>
  <Select
    style={css.raw(!!visibility && { backgroundColor: { base: 'gray.900', _hover: 'gray.800!' }, color: 'gray.0!' })}
    size="xs"
  >
    <svelte:fragment slot="placeholder">
      {visibility ? visibilityToLocaleString[visibility] : '공개범위'}
    </svelte:fragment>

    {#if !!visibility}
      <SelectItem
        on:click={() => {
          visibility = null;
          updateSearchFilter();
        }}
      >
        선택안함
      </SelectItem>
    {/if}
    <SelectItem
      on:click={() => {
        visibility = 'PUBLIC';
        updateSearchFilter();
      }}
    >
      전체공개
    </SelectItem>
    <SelectItem
      on:click={() => {
        visibility = 'UNLISTED';
        updateSearchFilter();
      }}
    >
      링크공개
    </SelectItem>
    <SelectItem
      on:click={() => {
        visibility = 'SPACE';
        updateSearchFilter();
      }}
    >
      멤버공개
    </SelectItem>
  </Select>

  <Select
    style={css.raw(
      { width: '99px' },
      !!price && { backgroundColor: { base: 'gray.900', _hover: 'gray.800!' }, color: 'gray.0!' },
    )}
    size="xs"
  >
    <svelte:fragment slot="placeholder">{priceToLocaleString}</svelte:fragment>

    {#if !!price}
      <SelectItem
        on:click={() => {
          price = null;
          updateSearchFilter();
        }}
      >
        선택안함
      </SelectItem>
    {/if}
    <SelectItem
      on:click={() => {
        price = 'PAID';
        updateSearchFilter();
      }}
    >
      유료
    </SelectItem>
    <SelectItem
      on:click={() => {
        price = 'FREE';
        updateSearchFilter();
      }}
    >
      무료
    </SelectItem>
  </Select>

  <Select
    style={css.raw(
      (!!collectionId || collectionlessOnly) && {
        backgroundColor: { base: 'gray.900', _hover: 'gray.800!' },
        color: 'gray.0!',
      },
    )}
    size="xs"
  >
    <div slot="placeholder" class={css({ minWidth: '53px', maxWidth: '120px', textAlign: 'left', truncate: true })}>
      {collectionId
        ? $query.space.collections.find((c) => c.id === collectionId)?.name
        : collectionlessOnly
          ? '컬렉션 없음'
          : '컬렉션'}
    </div>

    {#if !!collectionId || collectionlessOnly}
      <SelectItem
        on:click={() => {
          collectionId = null;
          collectionlessOnly = false;
          updateSearchFilter();
        }}
      >
        선택안함
      </SelectItem>
    {/if}
    <SelectItem
      on:click={() => {
        collectionId = null;
        collectionlessOnly = true;
        updateSearchFilter();
      }}
    >
      컬렉션 없음
    </SelectItem>
    {#each $query.space.collections as collection (collection.id)}
      <SelectItem
        on:click={() => {
          collectionId = collection.id;
          collectionlessOnly = false;
          updateSearchFilter();
        }}
      >
        {collection.name}
      </SelectItem>
    {/each}
  </Select>
</div>

<PostManageTable $posts={$query.space.posts} {$query} />