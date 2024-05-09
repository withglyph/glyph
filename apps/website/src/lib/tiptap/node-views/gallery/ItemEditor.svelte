<script lang="ts">
  import { Semaphore } from 'async-mutex';
  import ky from 'ky';
  import * as R from 'radash';
  import Sortable from 'sortablejs';
  import { onDestroy } from 'svelte';
  import IconArrowsExchange from '~icons/tabler/arrows-exchange';
  import IconChevronLeft from '~icons/tabler/chevron-left';
  import IconGripVertical from '~icons/tabler/grip-vertical';
  import IconPictureInPictureOff from '~icons/tabler/picture-in-picture-off';
  import IconPlus from '~icons/tabler/plus';
  import { graphql } from '$glitch';
  import { Icon, Link } from '$lib/components';
  import { Checkbox } from '$lib/components/forms';
  import { Button, Modal } from '$lib/components/v2';
  import { validImageMimes } from '$lib/utils';
  import { css, cx } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import Image from './Image.svelte';
  import type { NodeViewProps } from '$lib/tiptap';

  export let open = false;

  export let node: NodeViewProps['node'];
  export let updateAttributes: NodeViewProps['updateAttributes'];

  let sortable: Sortable;

  let sortableGallery: HTMLElement;

  const reorderArray = (arr: string[], newIndex: number, oldIndex: number) => {
    const draggedItem = arr[oldIndex];

    if (oldIndex > newIndex) {
      arr = [...arr.slice(0, newIndex), draggedItem, ...arr.slice(newIndex, oldIndex), ...arr.slice(oldIndex + 1)];
    } else {
      arr = [
        ...arr.slice(0, oldIndex),
        ...arr.slice(oldIndex + 1, newIndex + 1),
        draggedItem,
        ...arr.slice(newIndex + 1),
      ];
    }

    return arr;
  };

  let sortableOptions: Sortable.Options = {
    scroll: true,
    handle: '.image',
    animation: 150,
    delay: 0,
    forceAutoScrollFallback: true,
    scrollSensitivity: 100,
    scrollSpeed: 10,
    bubbleScroll: true,
    dragClass: 'dragging-item',
    onMove: (evt) => {
      if (evt.related.className.includes('prevent-dragging')) {
        return false;
      }
    },
    onEnd: ({ newIndex, oldIndex }) => {
      if (newIndex === undefined || oldIndex === undefined) return;

      const reorderedData = reorderArray(node.attrs.ids, newIndex, oldIndex);

      updateAttributes({ ids: reorderedData });
    },
  };

  $: if (sortableGallery) {
    sortable = Sortable.create(sortableGallery, sortableOptions);
  }

  const prepareImageUpload = graphql(`
    mutation TiptapGallery_Editor_PrepareImageUpload_Mutation {
      prepareImageUpload {
        key
        presignedUrl
      }
    }
  `);

  const finalizeImageUpload = graphql(`
    mutation TiptapGallery_Editor_FinalizeImageUpload_Mutation($input: FinalizeImageUploadInput!) {
      finalizeImageUpload(input: $input) {
        id
      }
    }
  `);

  let imageListOpen = false;
  let selectedImageIds: string[] = [];

  $: allSelected = node.attrs.ids.length > 0 && R.diff(node.attrs.ids, selectedImageIds).length === 0;

  const semaphore = new Semaphore(20);

  const uploadImage = async (file: File) => {
    return await semaphore.runExclusive(async () => {
      const { key, presignedUrl } = await prepareImageUpload();
      await ky.put(presignedUrl, { body: file });
      const resp = await finalizeImageUpload({ key, name: file.name });
      await updateAttributes((attrs) => ({ ids: [...attrs.ids, resp.id] }));
    });
  };

  const handleInsertImage = () => {
    const picker = document.createElement('input');
    picker.type = 'file';
    picker.accept = validImageMimes.join(',');
    picker.multiple = true;
    picker.addEventListener('change', async () => {
      if (picker.files?.length) {
        await Promise.all([...picker.files].map((v) => uploadImage(v)));
      }
    });
    picker.click();
  };

  const removeImages = async (ids: string[]) => {
    await updateAttributes((attrs) => ({ ids: attrs.ids.filter((i: string) => !ids.includes(i)) }));
    selectedImageIds = selectedImageIds.filter((i) => !ids.includes(i));
  };

  onDestroy(() => {
    if (sortable) {
      sortable.destroy();
    }
  });
</script>

<Modal
  style={css.raw({ paddingTop: '0', paddingBottom: '0', height: 'full', overflowY: 'hidden' })}
  size="lg"
  on:close={() => (open = false)}
  bind:open
>
  <svelte:fragment slot="title-left">
    <button type="button" on:click={() => (imageListOpen = false)}>
      <Icon icon={IconChevronLeft} size={24} />
    </button>
  </svelte:fragment>

  <svelte:fragment slot="title">전체목록</svelte:fragment>

  <div class={flex({ direction: 'column', size: 'full' })}>
    <div
      class={flex({
        align: 'center',
        marginTop: '16px',
        paddingBottom: '8px',
      })}
    >
      <Checkbox
        style={css.raw({
          _after: {
            content: "''",
            display: 'block',
            marginLeft: '6px',
            backgroundColor: 'gray.200',
            height: '12px',
            width: '1px',
          },
        })}
        checked={allSelected}
        disabled={node.attrs.ids.length === 0}
        variant="brand"
        on:change={() => (selectedImageIds = allSelected ? [] : node.attrs.ids)}
      >
        전체선택
      </Checkbox>
      <button
        class={css({ paddingX: '6px', fontSize: '15px' })}
        type="button"
        on:click={() => removeImages(selectedImageIds)}
      >
        삭제
      </button>
    </div>

    <p class={css({ marginBottom: '16px', paddingY: '2px', fontSize: '13px', color: 'gray.500' })}>
      이미지를 드래그해서 놓으면 순서를 변경할 수 있어요
    </p>

    <div
      bind:this={sortableGallery}
      class={flex({
        direction: 'column',
        gap: '8px',
        paddingBottom: '32px',
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollbar: 'hidden',
      })}
    >
      {#each node.attrs.ids as id, index (id)}
        <button
          class={cx(
            'image',
            flex({
              position: 'relative',
              align: 'center',
              borderWidth: '1px',
              borderColor: 'gray.100',
              paddingX: '14px',
              paddingY: '8px',
              backgroundColor: { base: 'gray.5', _hover: 'gray.100' },
              height: '64px',
              width: 'full',
              _pressed: { borderWidth: '2px', borderColor: 'brand.400', backgroundColor: 'brand.50' },
            }),
          )}
          aria-pressed={selectedImageIds.includes(id)}
          data-id={id}
          type="button"
          on:click={() => {
            selectedImageIds = selectedImageIds.includes(id)
              ? selectedImageIds.filter((v) => id !== v)
              : [...selectedImageIds, id];
          }}
        >
          <span
            class={css({
              marginRight: '12px',
              fontSize: '12px',
              fontWeight: 'medium',
              color: 'gray.500',
              textAlign: 'center',
              width: '26px',
            })}
          >
            {index + 1}
          </span>
          <Image {id} style={css.raw({ marginRight: '8px', size: '48px', objectFit: 'cover' })} />
          <p class={css({ flexGrow: '1', fontSize: '13px', textAlign: 'left' })}>
            <!-- {image.kind === 'data' ? image.__data.name : image.__file.name} -->
            이미지이름
          </p>

          <div class={flex({ align: 'center', gap: '8px', marginLeft: '20px' })}>
            <button class={css({ padding: '4px' })} type="button">
              <Icon style={css.raw({ color: 'gray.800' })} icon={IconArrowsExchange} size={20} />
            </button>
            <Link external href="이미지주소">
              <Icon style={css.raw({ color: 'gray.800' })} icon={IconPictureInPictureOff} size={20} />
            </Link>
            <div class={css({ padding: '4px' })}>
              <Icon style={css.raw({ color: 'gray.800' })} icon={IconGripVertical} size={20} />
            </div>
          </div>
        </button>
      {/each}
      <button
        class={cx(
          'prevent-dragging',
          flex({
            align: 'center',
            gap: '4px',
            borderWidth: '1px',
            borderColor: 'gray.200',
            borderStyle: 'dashed',
            paddingX: '14px',
            paddingY: '8px',
            color: 'gray.400',
            backgroundColor: 'gray.50',
            width: 'full',
            height: '64px',
          }),
        )}
        type="button"
        on:click={handleInsertImage}
      >
        <Icon icon={IconPlus} />
        <span class={css({ fontSize: '13px' })}>이미지 추가</span>
      </button>
    </div>
  </div>

  <svelte:fragment slot="action">
    <!-- prettier-ignore -->
    <p class={css({ flexGrow: '1', fontSize: '14px' })}>
      {#if imageListOpen && selectedImageIds.length > 0}
        <!-- 이미지 {selectedImageName}
        {#if selectedImageIds.length > 1}
          외 <mark class={css({ color: 'brand.400' })}>{selectedImageIds.length - 1}개</mark>
        {/if}
        선택됨
      {:else}
        총 <mark class={css({ color: 'brand.400' })}>{node.attrs.__data.length}</mark>개의 파일 -->
      {/if}
    </p>

    <Button style={css.raw({ width: '110px' })} size="md" on:click={() => (imageListOpen = false)}>확인</Button>
  </svelte:fragment>
</Modal>

<style>
  .dragging-item {
    border-width: 2px;
    /* brand.400 */
    border-color: #8162e8;
    /* brand.50 */
    background-color: #f9f7ff;
  }
</style>
