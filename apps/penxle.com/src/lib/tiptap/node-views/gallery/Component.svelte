<script lang="ts">
  import clsx from 'clsx';
  import IconEmbedCompact from '~icons/effit/embed-compact';
  import IconEmbedFull from '~icons/effit/embed-full';
  import IconAlignCenter from '~icons/tabler/align-center';
  import IconAlignLeft from '~icons/tabler/align-left';
  import IconAlignRight from '~icons/tabler/align-right';
  import IconEdit from '~icons/tabler/edit';
  import IconTrash from '~icons/tabler/trash';
  import { Icon } from '$lib/components';
  import { NodeView } from '$lib/tiptap';
  import { TiptapNodeViewBubbleMenu } from '$lib/tiptap/components';
  import Display from './Display.svelte';
  import Editor from './Editor.svelte';
  import type { NodeViewProps } from '$lib/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let editor: NodeViewProps['editor'] | undefined;
  export let selected: NodeViewProps['selected'];
  export let getPos: NodeViewProps['getPos'];
  export let deleteNode: NodeViewProps['deleteNode'];
  export let updateAttributes: NodeViewProps['updateAttributes'];

  let open = node.attrs.layout === 'initial';
  let onClose: (() => void) | null;

  const handleClose = () => {
    if (node.attrs.layout !== 'initial' && node.attrs.__data.length === 0) {
      deleteNode();
      return;
    }

    if (editor && node.attrs.layout === 'standalone' && node.attrs.__data.length > 0) {
      let chain = editor.chain();
      for (const image of node.attrs.__data) {
        chain = chain.setStandaloneGallery(image);
      }
      chain.run();
      deleteNode();
      return;
    }
  };

  $: if (open) {
    onClose = handleClose;
  } else {
    onClose?.();
    onClose = null;
  }
</script>

<NodeView
  class={clsx(
    'flex items-center pointer-events-none py-4px',
    node.attrs.align === 'left' && 'justify-start',
    node.attrs.align === 'center' && 'justify-center',
    node.attrs.align === 'right' && 'justify-end',
  )}
  data-drag-handle
  draggable
>
  <div
    class={clsx(
      'pointer-events-auto min-w-0',
      node.attrs.ids.length === 0 && 'bg-#d9d9d9 w-400px h-200px',
      selected && 'ring-2 ring-teal-500',
    )}
  >
    <div class={clsx(editor?.isEditable && 'pointer-events-none')}>
      <Display {node} {updateAttributes} />
    </div>
  </div>
</NodeView>

{#if editor && selected}
  <TiptapNodeViewBubbleMenu {editor} {getPos} {node}>
    <button class="p-4px rounded-2px transition hover:bg-gray-100" type="button" on:click={() => (open = true)}>
      <Icon class="text-gray-600 square-18px block <sm:square-20px" icon={IconEdit} />
    </button>

    <div class="w-1px h-12px bg-gray-200" />

    {#if node.attrs.size === 'compact'}
      <button
        class="p-4px rounded-2px transition hover:bg-gray-100"
        type="button"
        on:click={() => {
          updateAttributes({ align: 'left' });
          editor?.commands.focus();
        }}
      >
        <Icon
          class={clsx(
            'text-gray-600 square-18px block <sm:square-20px',
            node.attrs.align === 'left' && 'text-teal-500!',
          )}
          icon={IconAlignLeft}
        />
      </button>

      <button
        class="p-4px rounded-2px transition hover:bg-gray-100"
        type="button"
        on:click={() => {
          updateAttributes({ align: 'center' });
          editor?.commands.focus();
        }}
      >
        <Icon
          class={clsx(
            'text-gray-600 square-18px block <sm:square-20px',
            node.attrs.align === 'center' && 'text-teal-500!',
          )}
          icon={IconAlignCenter}
        />
      </button>

      <button
        class="p-4px rounded-2px transition hover:bg-gray-100"
        type="button"
        on:click={() => {
          updateAttributes({ align: 'right' });
          editor?.commands.focus();
        }}
      >
        <Icon
          class={clsx(
            'text-gray-600 square-18px block <sm:square-20px',
            node.attrs.align === 'right' && 'text-teal-500!',
          )}
          icon={IconAlignRight}
        />
      </button>

      <div class="w-1px h-12px bg-gray-200" />
    {/if}

    <button
      class="p-4px rounded-2px transition hover:bg-gray-100"
      type="button"
      on:click={() => {
        updateAttributes({ size: 'full' });
        editor?.commands.focus();
      }}
    >
      <Icon
        class={clsx('text-gray-600 square-18px block <sm:square-20px', node.attrs.size === 'full' && 'text-teal-500!')}
        icon={IconEmbedFull}
      />
    </button>
    <button
      class="p-4px rounded-2px transition hover:bg-gray-100"
      type="button"
      on:click={() => {
        updateAttributes({ size: 'compact' });
        editor?.commands.focus();
      }}
    >
      <Icon
        class={clsx(
          'text-gray-600 square-18px block <sm:square-20px',
          node.attrs.size === 'compact' && 'text-teal-500!',
        )}
        icon={IconEmbedCompact}
      />
    </button>

    <div class="w-1px h-12px bg-gray-200" />

    <button class="p-4px rounded-2px transition hover:bg-gray-100" type="button" on:click={() => deleteNode()}>
      <Icon class="text-gray-600 square-18px block" icon={IconTrash} />
    </button>
  </TiptapNodeViewBubbleMenu>

  <Editor {node} {updateAttributes} bind:open />
{/if}
