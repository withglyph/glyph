<script lang="ts">
  import IconPlus from '~icons/tabler/plus';
  import { fragment, graphql } from '$glitch';
  import { Icon, Image } from '$lib/components';
  import { CreateCollectionModal } from '$lib/components/pages/collections';
  import { Button, Modal } from '$lib/components/v2';
  import { Select, SelectItem } from '$lib/components/v2/select';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { PostManageTable_SwitchCollectionModal_spaceCollection } from '$glitch';

  let _collections: PostManageTable_SwitchCollectionModal_spaceCollection[];
  export { _collections as $collections };

  export let open = false;
  export let spaceId = '';
  export let selectedPostIds: string[] = [];

  $: console.log(selectedPostIds);

  let selectedCollection: (typeof $collections)[number] | null = null;
  let collectionSelectorOpen = false;
  let createCollectionOpen = false;

  $: collections = fragment(
    _collections,
    graphql(`
      fragment PostManageTable_SwitchCollectionModal_spaceCollection on SpaceCollection {
        id
        name

        thumbnail {
          id
          ...Image_image
        }
      }
    `),
  );
</script>

<Modal style={css.raw({ paddingBottom: '120px' })} bind:open>
  <svelte:fragment slot="title">컬렉션 변경</svelte:fragment>

  <Select
    style={css.raw({ marginBottom: '120px', height: '66px' })}
    listStyle={css.raw({ top: '66px!', maxHeight: '252px!' })}
    size="md"
    bind:open={collectionSelectorOpen}
  >
    <div slot="placeholder" class={flex({ alignItems: 'center', gap: '8px', truncate: true })}>
      <div class={css({ size: '38px' })}>
        <Image
          style={css.raw({ height: '38px', aspectRatio: '3/4', objectFit: 'cover' })}
          $image={selectedCollection?.thumbnail}
          placeholder
          size={48}
        />
      </div>
      {#if selectedCollection}
        <p class={css({ truncate: true })}>{selectedCollection.name}</p>
      {:else}
        <span class={css({ color: 'gray.500' })}>컬렉션을 선택해주세요</span>
      {/if}
    </div>

    {#if collectionSelectorOpen && $collections}
      {#each $collections as collection (collection.id)}
        <SelectItem
          on:click={() => {
            selectedCollection = collection;
            collectionSelectorOpen = false;
          }}
        >
          <div class={flex({ alignItems: 'center', gap: '8px', truncate: true })}>
            <div class={css({ flex: 'none', size: '38px' })}>
              <Image
                style={css.raw({ height: '38px', aspectRatio: '3/4', objectFit: 'cover' })}
                $image={collection?.thumbnail}
                placeholder
                size={48}
              />
            </div>
            <p class={css({ truncate: true })}>{collection.name}</p>
          </div>
        </SelectItem>
      {/each}
    {/if}

    <svelte:fragment slot="create">
      <SelectItem state="create" on:click={() => (createCollectionOpen = true)}>
        <div class={flex({ align: 'center', gap: '4px' })}>
          <Icon icon={IconPlus} />
          새로운 컬렉션 추가하기
        </div>
      </SelectItem>
    </svelte:fragment>
  </Select>

  <!-- TODO: update post option -->
  <Button slot="action" style={css.raw({ width: 'full' })} size="lg" variant="gradation-fill">확인</Button>
</Modal>

<CreateCollectionModal bind:open={createCollectionOpen} bind:spaceId />
