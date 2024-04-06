<script lang="ts">
  import qs from 'query-string';
  import IconFilter from '~icons/tabler/adjustments-horizontal';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { Helmet, Icon, Pagination, Tag } from '$lib/components';
  import { Button, Modal } from '$lib/components/v2';
  import { Select, SelectItem } from '$lib/components/v2/select';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import Post from '../(index)/Post.svelte';
  import AdultFilter from './AdultFilter.svelte';
  import TagForm from './TagForm.svelte';
  import { initSearchFilter } from './util';

  let filterOpen = false;
  let includeValue = '';
  let excludeValue = '';
  let {
    includeTags,
    excludeTags,
    adultFilter,
    excludeContentFilters,
    orderBy,
    page: initialPage,
  } = initSearchFilter($page.url.search);

  $: query = graphql(`
    query SearchPage_Query(
      $query: String!
      $includeTags: [String!]! = []
      $excludeTags: [String!]! = []
      $adultFilter: Boolean
      $orderBy: SearchOrderByKind!
      $page: Int! = 1
    ) {
      searchPosts(
        query: $query
        includeTags: $includeTags
        excludeTags: $excludeTags
        adultFilter: $adultFilter
        orderBy: $orderBy
        page: $page
      ) {
        count

        posts {
          id
          ...Feed_Post_post
        }
      }

      searchTags(query: $query) {
        id
        name
      }
    }
  `);

  const updateSearchFilter = (currentPage: number) => {
    const stringifiedURL = qs.stringifyUrl(
      {
        url: '/search',
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

  $: keyword = $page.url.searchParams.get('q');
</script>

<Helmet description={`글리프에서 ${keyword} 검색을 한 결과에요`} title={`${keyword} 검색 결과`} />

<div class={flex({ direction: 'column', flexGrow: '1', paddingX: '20px', width: 'full', backgroundColor: 'gray.5' })}>
  <div
    class={flex({
      gap: '48px',
      marginX: 'auto',
      width: 'full',
      maxWidth: '1280px',
    })}
  >
    <aside
      class={flex({
        direction: 'column',
        gap: '32px',
        position: 'sticky',
        top: '104px',
        marginY: '42px',
        flex: 'none',
        outlineWidth: '1px',
        outlineColor: 'gray.150',
        paddingTop: '24px',
        paddingX: '20px',
        paddingBottom: '32px',
        width: '312px',
        height: 'fit',
        hideBelow: 'sm',
      })}
    >
      <TagForm
        placeholder="포함할 태그를 입력해주세요"
        {updateSearchFilter}
        value={includeValue}
        bind:tags={includeTags}
      >
        포함할 태그
      </TagForm>

      <TagForm
        placeholder="제외할 태그를 입력해주세요"
        {updateSearchFilter}
        value={excludeValue}
        bind:tags={excludeTags}
      >
        제외할 태그
      </TagForm>

      <AdultFilter {updateSearchFilter} bind:adultFilter />
    </aside>

    <div class={css({ marginTop: '24px', width: 'full' })}>
      <h1 class={flex({ fontSize: '22px' })}>
        <strong class={css({ fontWeight: 'bold' })}>
          {keyword}
        </strong>
        에 대한 결과 ({comma($query.searchPosts.count)})
      </h1>

      <div class={flex({ gap: '6px', wrap: 'wrap', marginTop: '10px', marginBottom: '32px' })}>
        {#each $query.searchTags as tag (tag.id)}
          <Tag size="sm">
            #{tag.name}
          </Tag>
        {/each}
      </div>

      <div class={flex({ align: 'center', justify: 'space-between', paddingY: '12px' })}>
        <p class={css({ fontSize: { base: '14px', sm: '16px' }, fontWeight: 'semibold' })}>포스트</p>

        <div class={flex({ align: 'center', gap: '8px' })}>
          <Button
            style={flex.raw({
              align: 'center',
              gap: '4px',
              outlineColor: '[gray.100!]',
              paddingLeft: '14px',
              paddingRight: '12px',
              fontSize: '13px',
              height: '34px',
              hideFrom: 'sm',
            })}
            size="xs"
            variant="gray-outline"
            on:click={() => (filterOpen = true)}
          >
            검색옵션
            <Icon icon={IconFilter} />
          </Button>

          <Select size="xs">
            <div slot="placeholder">
              {orderBy === 'LATEST' ? '최신순' : '정확도순'}
            </div>

            <SelectItem
              pressed={orderBy === 'LATEST'}
              on:click={() => {
                orderBy = 'LATEST';
                updateSearchFilter(1);
              }}
            >
              최신순
            </SelectItem>
            <SelectItem
              pressed={orderBy === 'ACCURACY'}
              on:click={() => {
                orderBy = 'ACCURACY';
                updateSearchFilter(1);
              }}
            >
              정확도순
            </SelectItem>
          </Select>
        </div>
      </div>

      {#if $query.searchPosts.count === 0}
        <div
          class={center({
            fontSize: '15px',
            fontWeight: 'semibold',
            color: 'gray.400',
            textAlign: 'center',
            minHeight: '200px',
          })}
        >
          검색 결과가 없어요
        </div>
      {:else}
        <ul>
          {#each $query.searchPosts.posts as post (post.id)}
            <li>
              <Post $post={post} />
            </li>
          {/each}
          <Pagination {initialPage} onChange={updateSearchFilter} totalItems={$query.searchPosts.count} />
        </ul>
      {/if}
    </div>
  </div>
</div>

<Modal bind:open={filterOpen}>
  <svelte:fragment slot="title">검색옵션</svelte:fragment>

  <div class={flex({ direction: 'column', gap: '32px' })}>
    <TagForm placeholder="포함할 태그를 입력해주세요" value={includeValue} bind:tags={includeTags}>포함할 태그</TagForm>

    <TagForm placeholder="제외할 태그를 입력해주세요" value={excludeValue} bind:tags={excludeTags}>제외할 태그</TagForm>

    <AdultFilter bind:adultFilter />
  </div>

  <div slot="action" class={flex({ gap: '8px', width: 'full' })}>
    <Button
      style={css.raw({ width: 'full' })}
      size="lg"
      variant="gray-sub-fill"
      on:click={() => {
        includeValue = '';
        excludeValue = '';
        includeTags = [];
        excludeTags = [];
        adultFilter = null;
        excludeContentFilters = [];
        orderBy = 'LATEST';
      }}
    >
      초기화
    </Button>
    <Button
      style={css.raw({ width: 'full' })}
      size="lg"
      on:click={() => {
        filterOpen = false;
        updateSearchFilter(1);
      }}
    >
      적용하기
    </Button>
  </div>
</Modal>
