<script lang="ts">
  import IconPlus from '~icons/tabler/plus';
  import { graphql } from '$glitch';
  import { Button, Helmet, Icon } from '$lib/components';
  import { CreateCollectionModal } from '$lib/components/pages/collections';
  import { css } from '$styled-system/css';
  import { center, grid } from '$styled-system/patterns';
  import Collection from '../Collection.svelte';

  let createCollectionOpen = false;

  $: query = graphql(`
    query SpaceCollectionsPage_Query($slug: String!) {
      space(slug: $slug) {
        id
        slug
        name

        meAsMember {
          id
        }

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

<p class={css({ marginTop: '14px', marginBottom: '8px', fontSize: '13px', color: 'gray.500' })}>
  총 {$query.space.collections.length}개의 컬렉션
</p>

{#if $query.space.collections.length === 0}
  <div class={css({ marginY: '32px' })}>
    <p class={css({ fontSize: '14px', color: 'gray.500', textAlign: 'center' })}>스페이스에 업로드된 컬렉션이 없어요</p>
    {#if $query.space.meAsMember}
      <Button
        style={center.raw({ gap: '4px', marginTop: '16px', marginX: 'auto', width: '142px' })}
        size="sm"
        variant="brand-fill"
        on:click={() => (createCollectionOpen = true)}
      >
        <Icon icon={IconPlus} />
        새 컬렉션 만들기
      </Button>
    {/if}
  </div>
{:else}
  <ul class={grid({ columns: { base: 2, sm: 4 }, columnGap: '14px', rowGap: '36px', marginTop: '8px' })}>
    {#each $query.space.collections as collection (collection.id)}
      <li>
        <Collection $space={$query.space} $spaceCollection={collection} />
      </li>
    {/each}
  </ul>
{/if}

<CreateCollectionModal spaceId={$query.space.id} bind:open={createCollectionOpen} />
