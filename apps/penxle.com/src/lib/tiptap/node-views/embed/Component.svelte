<script lang="ts">
  import { onMount } from 'svelte';
  import IconEmbedCompact from '~icons/effit/embed-compact';
  import IconEmbedFull from '~icons/effit/embed-full';
  import IconOpengraph from '~icons/effit/opengraph';
  import IconLink from '~icons/tabler/link';
  import IconTrash from '~icons/tabler/trash';
  import { graphql } from '$glitch';
  import { Icon, Link } from '$lib/components';
  import { RingSpinner } from '$lib/components/spinners';
  import { NodeView } from '$lib/tiptap';
  import { TiptapNodeViewBubbleMenu } from '$lib/tiptap/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
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

<NodeView
  style={css.raw(
    { display: 'flex', justifyContent: 'center', alignItems: 'center', paddingY: '4px' },
    editor?.isEditable && { pointerEvents: 'none' },
  )}
  data-drag-handle
  draggable
>
  {#if !node.attrs.__data}
    <div
      class={css(
        {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: '1px',
          borderColor: 'gray.300',
          borderRadius: '4px',
          width: 'full',
          maxWidth: '500px',
          height: '100px',
          overflow: 'hidden',
          pointerEvents: 'auto',
        },
        selected && {
          outlineWidth: '2px',
          outlineColor: 'teal.500',
        },
      )}
    >
      <RingSpinner style={css.raw({ size: '32px', color: 'teal.500' })} />
    </div>
  {:else if node.attrs.mode.startsWith('embed-')}
    <div
      class={css(
        { width: 'full', pointerEvents: 'auto' },
        node.attrs.mode === 'embed-compact' && { maxWidth: '500px' },
        selected && { outlineWidth: '2px', outlineColor: 'teal.500' },
      )}
    >
      <div class={css({ display: 'contents' }, editor?.isEditable && { pointerEvents: 'none' })}>
        {@html node.attrs.__data.html}
      </div>
    </div>
  {:else if node.attrs.mode === 'opengraph'}
    <div
      class={css(
        {
          display: 'flex',
          borderWidth: '1px',
          borderColor: 'gray.300',
          borderRadius: '4px',
          width: 'full',
          maxWidth: '500px',
          height: '100px',
          overflow: 'hidden',
          pointerEvents: 'auto',
        },
        selected && {
          outlineWidth: '2px',
          outlineColor: 'teal.500',
        },
      )}
    >
      <Link
        style={css.raw({ display: 'contents', pointerEvents: editor?.isEditable ? 'none' : 'auto' })}
        href={node.attrs.url}
      >
        {#if node.attrs.__data.thumbnailUrl}
          <img
            class={css({ height: 'full', aspectRatio: '[1/1]', objectFit: 'cover' })}
            alt=""
            src={node.attrs.__data.thumbnailUrl}
          />
        {/if}

        <div class={flex({ direction: 'column', grow: '1', padding: '14px' })}>
          <div class={css({ fontSize: '14px', fontWeight: 'medium', lineClamp: 1 })}>
            {node.attrs.__data.title ?? '(제목 없음)'}
          </div>
          <div class={css({ fontSize: '12px', color: 'gray.400', lineClamp: 1 })}>
            {node.attrs.__data.description ?? ''}
          </div>
          <div class={flex({ align: 'flex-end', grow: '1', fontSize: '12px', color: 'teal.500' })}>
            {new URL(node.attrs.url).hostname}
          </div>
        </div>
      </Link>
    </div>
  {/if}
</NodeView>

{#if editor && selected && node.attrs.__data}
  <TiptapNodeViewBubbleMenu {editor} {getPos} {node}>
    {#if node.attrs.__data.html}
      <div class={flex({ smDown: { gap: '6px' } })}>
        <button
          class={css({
            borderRadius: '2px',
            padding: '4px',
            transition: 'common',
            _hover: { backgroundColor: 'gray.100' },
          })}
          type="button"
          on:click={() => {
            updateAttributes({ mode: 'embed-full' });
            editor?.commands.focus();
          }}
        >
          <Icon
            style={css.raw({
              size: { base: '20px', sm: '18px' },
              color: node.attrs.mode === 'embed-full' ? 'teal.500' : 'gray.600',
            })}
            icon={IconEmbedFull}
          />
        </button>
        <button
          class={css({
            borderRadius: '2px',
            padding: '4px',
            transition: 'common',
            _hover: { backgroundColor: 'gray.100' },
          })}
          type="button"
          on:click={() => {
            updateAttributes({ mode: 'embed-compact' });
            editor?.commands.focus();
          }}
        >
          <Icon
            style={css.raw({
              size: { base: '20px', sm: '18px' },
              color: node.attrs.mode === 'embed-compact' ? 'teal.500' : 'gray.600',
            })}
            icon={IconEmbedCompact}
          />
        </button>
        <button
          class={css({
            borderRadius: '2px',
            padding: '4px',
            transition: 'common',
            _hover: { backgroundColor: 'gray.100' },
          })}
          type="button"
          on:click={() => {
            updateAttributes({ mode: 'opengraph' });
            editor?.commands.focus();
          }}
        >
          <Icon
            style={css.raw({
              size: { base: '20px', sm: '18px' },
              color: node.attrs.mode === 'opengraph' ? 'teal.500' : 'gray.600',
            })}
            icon={IconOpengraph}
          />
        </button>
      </div>

      <div class={css({ width: '1px', height: '12px', backgroundColor: 'gray.200' })} />
    {/if}

    <button
      class={css({
        borderRadius: '2px',
        padding: '4px',
        transition: 'common',
        _hover: { backgroundColor: 'gray.100' },
      })}
      type="button"
      on:click={convertToLink}
    >
      <Icon style={css.raw({ size: { base: '20px', sm: '18px' }, color: 'gray.600' })} icon={IconLink} />
    </button>

    <button
      class={css({
        borderRadius: '2px',
        padding: '4px',
        transition: 'common',
        _hover: { backgroundColor: 'gray.100' },
      })}
      type="button"
      on:click={() => {
        deleteNode();
        editor?.commands.focus();
      }}
    >
      <Icon style={css.raw({ size: { base: '20px', sm: '18px' }, color: 'gray.600' })} icon={IconTrash} />
    </button>
  </TiptapNodeViewBubbleMenu>
{/if}
