<script lang="ts">
  import { onMount } from 'svelte';
  import IconEmbedCompact from '~icons/glyph/embed-compact';
  import IconEmbedFull from '~icons/glyph/embed-full';
  import IconAlignCenter from '~icons/tabler/align-center';
  import IconAlignLeft from '~icons/tabler/align-left';
  import IconAlignRight from '~icons/tabler/align-right';
  import IconTrash from '~icons/tabler/trash';
  import IconX from '~icons/tabler/x';
  import { graphql } from '$glitch';
  import { Icon, Image } from '$lib/components';
  import { RingSpinner } from '$lib/components/spinners';
  import { isWebView, postFlutterMessage } from '$lib/flutter';
  import { portal, scrollLock } from '$lib/svelte/actions';
  import { NodeView } from '$lib/tiptap';
  import { TiptapNodeViewBubbleMenu } from '$lib/tiptap/components';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import type { NodeViewProps } from '$lib/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let editor: NodeViewProps['editor'] | undefined;
  export let selected: NodeViewProps['selected'];
  export let getPos: NodeViewProps['getPos'];
  export let updateAttributes: NodeViewProps['updateAttributes'];
  export let deleteNode: NodeViewProps['deleteNode'];

  let headerEl: HTMLElement;

  let viewerOpen = false;
  let prevScrollpos = 0;
  let timer: NodeJS.Timeout;

  $: query = graphql(`
    query TiptapImageNodeView_Query($id: ID!) @_manual {
      image(id: $id) {
        id
        ...Image_image
      }
    }
  `);

  onMount(() => {
    query.refetch({ id: node.attrs.id });
  });

  $: {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (headerEl) {
        headerEl.style.top = '-62px';
      }
    }, 1000);

    [prevScrollpos];
  }
</script>

<NodeView
  style={css.raw(
    { display: 'flex', alignItems: 'center', paddingY: '4px', smDown: { marginX: '-20px' } },
    node.attrs.align === 'left' && { justifyContent: 'flex-start' },
    node.attrs.align === 'center' && { justifyContent: 'center' },
    node.attrs.align === 'right' && { justifyContent: 'flex-end' },
  )}
  data-drag-handle
  draggable
>
  <div
    class={css(
      { display: 'flex', justifyContent: 'center', pointerEvents: 'auto' },
      node.attrs.size === 'compact' && { maxWidth: '500px' },
      node.attrs.size === 'full' && { width: 'full' },
      selected && { ringWidth: '2px', ringColor: 'brand.400' },
    )}
    role={editor?.isEditable ? 'presentation' : 'button'}
    on:click={() => {
      if (!editor?.isEditable) {
        if (isWebView()) {
          postFlutterMessage({ type: 'image:view', id: node.attrs.id });
        } else {
          viewerOpen = true;
        }
      }
    }}
    on:keypress={null}
  >
    {#if $query}
      <Image style={css.raw({ width: 'full' })} $image={$query.image} size="full" />

      {#if viewerOpen}
        <div
          class={flex({
            direction: 'column',
            align: 'center',
            justify: 'flex-start',
            position: 'fixed',
            inset: '0',
            zIndex: '50',
            paddingX: { sm: '96px' },
            backgroundColor: '[#212121]',
            overflow: 'auto',
            scrollbar: 'hidden',
          })}
          data-scroll-lock-ignore
          role="presentation"
          on:scroll={(e) => {
            var currentScrollPos = e.currentTarget.scrollTop;

            headerEl.style.top = prevScrollpos > currentScrollPos ? '0' : '-62px';
            prevScrollpos = currentScrollPos;
          }}
          on:mousemove={() => {
            if (!headerEl) return;

            headerEl.style.top = '0';

            clearTimeout(timer);
            timer = setTimeout(() => {
              headerEl.style.top = '-62px';
            }, 1000);
          }}
          use:portal
          use:scrollLock
        >
          <div
            bind:this={headerEl}
            class={flex({
              align: 'center',
              justify: 'flex-end',
              position: 'fixed',
              top: '0',
              paddingX: '20px',
              paddingY: '15px',
              color: 'gray.300',
              backgroundColor: 'gray.900/50',
              width: 'full',
              height: '62px',
              zIndex: '10',
              transition: 'all',
            })}
          >
            <button type="button" on:click={() => (viewerOpen = false)}>
              <Icon style={css.raw({ hideFrom: 'sm' })} icon={IconX} size={24} />
              <Icon style={css.raw({ hideBelow: 'sm' })} icon={IconX} size={32} />
            </button>
          </div>

          <Image style={css.raw({ marginY: 'auto', width: 'full' })} $image={$query.image} size="full" />
        </div>
      {/if}
    {:else}
      <div
        class={center({
          size: '200px',
          backgroundColor: 'gray.50',
        })}
      >
        <RingSpinner style={css.raw({ size: '32px', color: 'brand.400' })} />
      </div>
    {/if}
  </div>
</NodeView>

{#if editor && selected}
  <TiptapNodeViewBubbleMenu {editor} {getPos} {node}>
    <button
      class={css({
        margin: '2px',
        transition: 'common',
        _hover: { backgroundColor: 'gray.100' },
        _pressed: { backgroundColor: { base: 'brand.400', _hover: 'brand.600' }, color: 'gray.50' },
      })}
      aria-pressed={node.attrs.size === 'full'}
      type="button"
      on:click={() => {
        updateAttributes({ size: 'full' });
        editor?.commands.focus();
      }}
    >
      <Icon style={css.raw({ size: '18px' })} icon={IconEmbedFull} />
    </button>
    <button
      class={css({
        margin: '2px',
        transition: 'common',
        _hover: { backgroundColor: 'gray.100' },
        _pressed: { backgroundColor: { base: 'brand.400', _hover: 'brand.600' }, color: 'gray.50' },
      })}
      aria-pressed={node.attrs.size === 'compact'}
      type="button"
      on:click={() => {
        updateAttributes({ size: 'compact' });
        editor?.commands.focus();
      }}
    >
      <Icon style={css.raw({ size: '18px' })} icon={IconEmbedCompact} />
    </button>

    <div class={css({ backgroundColor: 'gray.200', width: '1px', height: '12px' })} />

    {#if node.attrs.size === 'compact'}
      <button
        class={css({
          margin: '2px',
          transition: 'common',
          _hover: { backgroundColor: 'gray.100' },
          _pressed: { backgroundColor: { base: 'brand.400', _hover: 'brand.600' }, color: 'gray.50' },
        })}
        aria-pressed={node.attrs.align === 'left'}
        type="button"
        on:click={() => {
          updateAttributes({ align: 'left' });
          editor?.commands.focus();
        }}
      >
        <Icon style={css.raw({ size: '18px' })} icon={IconAlignLeft} />
      </button>

      <button
        class={css({
          margin: '2px',
          transition: 'common',
          _hover: { backgroundColor: 'gray.100' },
          _pressed: { backgroundColor: { base: 'brand.400', _hover: 'brand.600' }, color: 'gray.50' },
        })}
        aria-pressed={node.attrs.align === 'center'}
        type="button"
        on:click={() => {
          updateAttributes({ align: 'center' });
          editor?.commands.focus();
        }}
      >
        <Icon style={css.raw({ size: '18px' })} icon={IconAlignCenter} />
      </button>

      <button
        class={css({
          margin: '2px',
          transition: 'common',
          _hover: { backgroundColor: 'gray.100' },
          _pressed: { backgroundColor: { base: 'brand.400', _hover: 'brand.600' }, color: 'gray.50' },
        })}
        aria-pressed={node.attrs.align === 'right'}
        type="button"
        on:click={() => {
          updateAttributes({ align: 'right' });
          editor?.commands.focus();
        }}
      >
        <Icon style={css.raw({ size: '18px' })} icon={IconAlignRight} />
      </button>

      <div class={css({ backgroundColor: 'gray.200', width: '1px', height: '12px' })} />
    {/if}

    <button
      class={css({
        margin: '2px',
        transition: 'common',
        _hover: { backgroundColor: 'gray.100' },
      })}
      type="button"
      on:click={() => deleteNode()}
    >
      <Icon style={css.raw({ color: 'gray.600', size: '18px' })} icon={IconTrash} />
    </button>
  </TiptapNodeViewBubbleMenu>
{/if}
