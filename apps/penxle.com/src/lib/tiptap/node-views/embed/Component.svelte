<script lang="ts">
  import { Link } from '@penxle/ui';
  import { RingSpinner } from '@penxle/ui/spinners';
  import clsx from 'clsx';
  import { onMount } from 'svelte';
  import { graphql } from '$glitch';
  import { NodeView } from '$lib/tiptap';
  import { TiptapNodeViewBubbleMenu } from '$lib/tiptap/components';
  import type { NodeViewProps } from '$lib/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let editor: NodeViewProps['editor'] | undefined;
  export let selected: NodeViewProps['selected'];
  export let deleteNode: NodeViewProps['deleteNode'];
  export let getPos: NodeViewProps['getPos'];
  export let updateAttributes: NodeViewProps['updateAttributes'];

  const unfurlEmbed = graphql(`
    mutation TiptapEmbed_UnfurlEmbed_Mutation($input: UnfurlEmbedInput!) {
      unfurlEmbed(input: $input) {
        id
        type
        url
        title
        description
        thumbnailUrl
        html
      }
    }
  `);

  const unfurl = async () => {
    try {
      const resp = await unfurlEmbed({ url: node.attrs.url });
      if (!resp) {
        throw new Error('Unfurl failed');
      }

      updateAttributes?.({
        url: resp.url,
        mode: resp.html ? 'embed-full' : 'opengraph',
        __data: resp,
      });
    } catch {
      convertToLink();
    }
  };

  const convertToLink = () => {
    editor?.chain().insertContentAt(getPos(), node.attrs.url).focus().run();
    deleteNode?.();
  };

  onMount(() => {
    if (!node.attrs.__data) {
      unfurl();
    }
  });
</script>

<svelte:head>
  <script async src="https://cdn.iframe.ly/embed.js"></script>
</svelte:head>

<NodeView class={clsx('flex center py-4px', editor?.isEditable && 'pointer-events-none')} data-drag-handle draggable>
  {#if !node.attrs.__data}
    <div
      class={clsx(
        'w-full border border-gray-300 flex rounded-4px max-w-500px h-100px overflow-hidden pointer-events-auto flex center',
        selected && 'ring-2 ring-teal-500',
      )}
    >
      <RingSpinner class="text-teal-500 square-8" />
    </div>
  {:else if node.attrs.mode.startsWith('embed-')}
    <div
      class={clsx(
        'w-full pointer-events-auto',
        node.attrs.mode === 'embed-compact' && 'max-w-500px',
        selected && 'ring-2 ring-teal-500',
      )}
    >
      <div class={clsx('contents', editor?.isEditable && 'pointer-events-none')}>
        {@html node.attrs.__data.html}
      </div>
    </div>
  {:else if node.attrs.mode === 'opengraph'}
    <div
      class={clsx(
        'w-full border border-gray-300 flex rounded-4px max-w-500px h-100px overflow-hidden pointer-events-auto',
        selected && 'ring-2 ring-teal-500',
      )}
    >
      <Link
        class={clsx('contents', editor?.isEditable ? 'pointer-events-none' : 'pointer-events-auto')}
        href={node.attrs.url}
      >
        {#if node.attrs.__data.thumbnailUrl}
          <img class="h-full aspect-1/1 object-cover" alt="" src={node.attrs.__data.thumbnailUrl} />
        {/if}

        <div class="flex flex-col grow p-14px">
          <div class="text-14-m line-clamp-1">{node.attrs.__data.title}</div>
          <div class="text-12-r text-gray-400 line-clamp-1">{node.attrs.__data.description}</div>
          <div class="flex items-end text-12-r text-teal-500 grow">{new URL(node.attrs.url).hostname}</div>
        </div>
      </Link>
    </div>
  {/if}
</NodeView>

{#if editor && selected && node.attrs.__data}
  <TiptapNodeViewBubbleMenu {editor} {getPos} {node}>
    {#if node.attrs.__data.html}
      <button
        class="p-4px rounded-2px transition hover:bg-gray-100"
        type="button"
        on:click={() => {
          updateAttributes({ mode: 'embed-full' });
          editor?.commands.focus();
        }}
      >
        <i
          class={clsx(
            'i-px2-embed-full text-gray-600 square-18px block',
            node.attrs.mode === 'embed-full' && 'text-teal-500',
          )}
        />
      </button>
      <button
        class="p-4px rounded-2px transition hover:bg-gray-100"
        type="button"
        on:click={() => {
          updateAttributes({ mode: 'embed-compact' });
          editor?.commands.focus();
        }}
      >
        <i
          class={clsx(
            'i-px2-embed-compact text-gray-600 square-18px block',
            node.attrs.mode === 'embed-compact' && 'text-teal-500',
          )}
        />
      </button>
      <button
        class="p-4px rounded-2px transition hover:bg-gray-100"
        type="button"
        on:click={() => {
          updateAttributes({ mode: 'opengraph' });
          editor?.commands.focus();
        }}
      >
        <i
          class={clsx(
            'i-px2-opengraph text-gray-600 square-18px block',
            node.attrs.mode === 'opengraph' && 'text-teal-500',
          )}
        />
      </button>

      <div class="w-1px h-12px bg-gray-200" />
    {/if}

    <button class="p-4px rounded-2px transition hover:bg-gray-100" type="button" on:click={convertToLink}>
      <i class="i-tb-link text-gray-600 square-18px block" />
    </button>

    <div class="w-1px h-12px bg-gray-200" />

    <button
      class="p-4px rounded-2px transition hover:bg-gray-100"
      type="button"
      on:click={() => {
        deleteNode();
        editor?.commands.focus();
      }}
    >
      <i class="i-tb-trash text-gray-600 square-18px block" />
    </button>
  </TiptapNodeViewBubbleMenu>
{/if}
