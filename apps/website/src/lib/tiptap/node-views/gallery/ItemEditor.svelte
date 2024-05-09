<script lang="ts">
  import { Semaphore } from 'async-mutex';
  import ky from 'ky';
  import Sortable from 'sortablejs';
  import { onDestroy } from 'svelte';
  import IconPlus from '~icons/tabler/plus';
  import { graphql } from '$glitch';
  import { Icon } from '$lib/components';
  import { Button, Modal } from '$lib/components/v2';
  import { isMobile, validImageMimes } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import Item from './Item.svelte';
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
    delay: isMobile() ? 50 : 0,
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

  onDestroy(() => {
    if (sortable) {
      sortable.destroy();
    }
  });
</script>

<Modal
  style={css.raw({ paddingBottom: '0', height: 'full', overflowY: 'hidden' })}
  size="lg"
  on:close={() => (open = false)}
  bind:open
>
  <svelte:fragment slot="title">그룹편집</svelte:fragment>

  <div class={flex({ direction: 'column', size: 'full' })}>
    <p class={css({ marginBottom: '8px', paddingY: '2px', fontSize: '13px', color: 'gray.500' })}>
      이미지를 드래그해서 놓으면 순서를 변경할 수 있어요
    </p>

    <ul
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
        <Item {index} {updateAttributes} bind:id />
      {/each}
      <li class="prevent-dragging">
        <button
          class={flex({
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
          })}
          type="button"
          on:click={handleInsertImage}
        >
          <Icon icon={IconPlus} />
          <span class={css({ fontSize: '13px' })}>이미지 추가</span>
        </button>
      </li>
    </ul>
  </div>

  <svelte:fragment slot="action">
    <!-- prettier-ignore -->
    <p class={css({ flexGrow: '1', fontSize: '14px' })}>
      {#if  node.attrs.ids.length > 0}
        총 <mark class={css({ color: 'brand.400' })}>{node.attrs.ids.length}</mark>개의 파일
      {/if}
    </p>

    <Button style={css.raw({ width: '110px' })} size="md" on:click={() => (open = false)}>확인</Button>
  </svelte:fragment>
</Modal>
