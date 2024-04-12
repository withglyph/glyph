<script lang="ts">
  import IconPlus from '~icons/tabler/plus';
  import { graphql } from '$glitch';
  import { Helmet, Icon } from '$lib/components';
  import { CreateCollectionModal } from '$lib/components/pages/collections';
  import { Button } from '$lib/components/v2';
  import { css } from '$styled-system/css';
  import { flex, grid } from '$styled-system/patterns';
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
    <p class={css({ color: 'gray.500', textAlign: 'center' })}>스페이스에 업로드된 컬렉션이 없어요</p>
    {#if $query.space.meAsMember}
      <Button
        style={flex.raw({ align: 'center', gap: '4px', marginTop: '16px', marginX: 'auto' })}
        size="sm"
        variant="cyan-fill"
        on:click={() => (createCollectionOpen = true)}
      >
        <Icon icon={IconPlus} />
        새 컬렉션 만들기
      </Button>
    {/if}
  </div>
{:else}
  <ul class={grid({ columns: { base: 2, sm: 4 }, gap: '12px' })}>
    {#each $query.space.collections as collection (collection.id)}
      <li>
        <Collection $space={$query.space} $spaceCollection={collection} />
      </li>
    {/each}
    {#if $query.space.meAsMember}
      <li>
        <button class={css({ textAlign: 'left' })} type="button" on:click={() => (createCollectionOpen = true)}>
          <div class={css({ position: 'relative' })}>
            <div
              class={css({
                borderWidth: '2px',
                borderColor: 'gray.100',
                width: { base: '161px', sm: '206px' },
                backgroundColor: 'gray.50',
                aspectRatio: '4/5',
              })}
            />
            <Icon
              style={css.raw({
                position: 'absolute',
                top: '1/2',
                left: '1/2',
                transform: 'translate(-50%, -50%)',
                color: 'gray.300',
              })}
              icon={IconPlus}
              size={32}
            />
          </div>
          <p class={css({ marginTop: '6px', fontSize: '15px', fontWeight: 'semibold', color: 'gray.500' })}>
            새 컬렉션 만들기
          </p>
        </button>
      </li>
    {/if}
  </ul>
{/if}

<CreateCollectionModal spaceId={$query.space.id} bind:open={createCollectionOpen} />
