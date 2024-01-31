<script lang="ts">
  import { Link } from '@penxle/ui';
  import { RingSpinner } from '@penxle/ui/spinners';
  import clsx from 'clsx';
  import { onMount } from 'svelte';
  import { graphql } from '$glitch';
  import { NodeView } from '$lib/tiptap';
  import type { NodeViewProps } from '$lib/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let editor: NodeViewProps['editor'] | undefined;
  export let selected: NodeViewProps['selected'] | undefined;
  export let deleteNode: NodeViewProps['deleteNode'] | undefined;
  export let getPos: NodeViewProps['getPos'] | undefined;
  export let updateAttributes: NodeViewProps['updateAttributes'] | undefined;

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
        __data: resp,
      });
    } catch {
      if (getPos) {
        editor?.commands.insertContentAt(getPos(), node.attrs.url, { updateSelection: false });
        deleteNode?.();
      }
    }
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

<NodeView class={clsx(selected && 'ring-2 ring-teal-500')} data-drag-handle draggable>
  <div class={clsx(editor?.isEditable && 'pointer-events-none')}>
    {#if node.attrs.__data}
      {#if node.attrs.__data.html}
        <div class="flex center">
          <div class="w-full">
            {@html node.attrs.__data.html}
          </div>
        </div>
      {:else}
        <Link class="border flex w-full items-center gap-4" href={node.attrs.url}>
          {#if node.attrs.__data.thumbnailUrl}
            <div class="w-100px">
              <img class="aspect-1/1 object-cover" alt="" src={node.attrs.__data.thumbnailUrl} />
            </div>
          {/if}
          <div class="grow p-4">
            <div class="font-bold">{node.attrs.__data.title}</div>
            <div class="text-sm text-gray-50">{node.attrs.__data.description}</div>
          </div>
        </Link>
      {/if}
    {:else}
      <p class="flex gap-2 items-center text-gray-50 py-1">
        {node.attrs.url}
        <RingSpinner class="square-4" />
      </p>
    {/if}
  </div>
</NodeView>
