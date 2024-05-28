<script lang="ts">
  import { graphql } from '$glitch';
  import { Helmet } from '$lib/components';
  import { Select, SelectItem } from '$lib/components/v2/select';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import PostManageTable from './PostManageTable.svelte';

  $: query = graphql(`
    query SpaceDashboardPostsPage_Query($slug: String!) {
      space(slug: $slug) {
        id
        name

        collections {
          id
          ...PostManageTable_spaceCollection
        }

        posts {
          id
          ...PostManageTable_post
        }
      }
    }
  `);
</script>

<Helmet description={`${$query.space.name} 스페이스 포스트 관리`} title={`포스트 관리 | ${$query.space.name}`} />

<h1 class={css({ marginBottom: '32px', fontSize: '24px', fontWeight: 'bold', hideBelow: 'sm' })}>포스트</h1>

<div class={flex({ align: 'center', gap: '12px', wrap: 'wrap', marginBottom: { base: '24px', sm: '20px' } })}>
  <Select size="xs">
    <svelte:fragment slot="placeholder">공개범위</svelte:fragment>

    <SelectItem>전체공개</SelectItem>
    <SelectItem>링크공개</SelectItem>
    <SelectItem>멤버공개</SelectItem>
  </Select>

  <Select size="xs">
    <svelte:fragment slot="placeholder">유료/무료</svelte:fragment>

    <SelectItem>유료/무료</SelectItem>
    <SelectItem>유료</SelectItem>
    <SelectItem>무료</SelectItem>
  </Select>

  <Select size="xs">
    <svelte:fragment slot="placeholder">컬렉션</svelte:fragment>

    <SelectItem>컬렉션 1</SelectItem>
    <SelectItem>컬렉션 2</SelectItem>
    <SelectItem>컬렉션 3</SelectItem>
  </Select>
</div>

<PostManageTable $collections={$query.space.collections} $posts={$query.space.posts} />
