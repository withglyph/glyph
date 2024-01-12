<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { Tag } from '$lib/components';
  import { TabHead, TabHeadItem } from '$lib/components/tab';

  $: query = graphql(`
    query SearchTagPage_Query($query: String!) {
      searchTags(query: $query) {
        id
        name
      }
    }
  `);
</script>

<Helmet title="{$page.url.searchParams.get('q')} - 펜슬 검색결과" />

<div class="body-14-m text-secondary py-1 px-3 rounded-lg bg-surface-primary mt-3 <sm:mx-4">
  🔍 약 {$query.searchTags.length ?? 0}개의 검색결과가 있어요!
</div>

<TabHead class="mt-9 mb-4 w-full <sm:(sticky top-61px z-1)" variant="secondary">
  <TabHeadItem id={0} pathname="/search">전체</TabHeadItem>
  <TabHeadItem id={1} pathname="/search/post">포스트</TabHeadItem>
  <TabHeadItem id={2} pathname="/search/space">스페이스</TabHeadItem>
  <TabHeadItem id={3} pathname="/search/tag">태그</TabHeadItem>
</TabHead>

{#if $query.searchTags.length === 0}
  <div class="text-secondary body-15-b text-center flex center min-h-50">검색 결과가 없어요</div>
{:else}
  <div class="flex flex-wrap gap-3 <sm:px-4">
    {#each $query.searchTags as tag (tag.id)}
      <Tag href={`/tag/${tag.name}`} size="lg">#{tag.name}</Tag>
    {/each}
  </div>
{/if}
