<script lang="ts">
  import { graphql } from '$glitch';
  import { Helmet } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import Collection from '../Collection.svelte';

  $: query = graphql(`
    query SpaceCollectionsPage_Query($slug: String!) {
      space(slug: $slug) {
        id
        slug
        name

        collections {
          id
          ...SpacePage_Collection_spaceCollection
        }

        ...SpacePage_Collection_space
      }
    }
  `);
</script>

<Helmet
  description={`${$query.space.name} 스페이스의 컬렉션 목록을 확인해보세요.`}
  title={`${$query.space.name}의 컬렉션`}
/>

<p class={css({ marginY: '14px', fontSize: '13px', color: 'gray.500' })}>
  총 {$query.space.collections.length}개의 컬렉션
</p>

<ul class={flex({ align: 'center', gap: '12px', wrap: 'wrap' })}>
  {#each $query.space.collections as collection (collection.id)}
    <li>
      <Collection $space={$query.space} $spaceCollection={collection} />
    </li>
  {/each}
</ul>
