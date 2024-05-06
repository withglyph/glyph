<script lang="ts">
  import { onMount } from 'svelte';
  import IconGripVertical from '~icons/tabler/grip-vertical';
  import IconTrash from '~icons/tabler/trash';
  import { Icon } from '$lib/components';
  import { NodeView, NodeViewContentEditable } from '$lib/tiptap';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import { makeIFrameContent } from './utils';
  import type { NodeViewProps } from '$lib/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let editor: NodeViewProps['editor'] | undefined;
  export let selected: NodeViewProps['selected'];
  export let deleteNode: NodeViewProps['deleteNode'];

  let iframeEl: HTMLIFrameElement | null = null;

  onMount(() => {
    const handler = (event: MessageEvent) => {
      if (event.source === iframeEl?.contentWindow && event.data.type === 'resize') {
        iframeEl.height = `${event.data.height}px`;
      }
    };

    window.addEventListener('message', handler);

    return () => {
      window.removeEventListener('message', handler);
    };
  });
</script>

<NodeView style={css.raw({ paddingY: '8px' })}>
  {#if editor?.isEditable}
    <div class={css(selected && { ringWidth: '2px', ringColor: 'brand.400' })}>
      <div
        class={flex({
          align: 'center',
          paddingTop: '6px',
          paddingX: '12px',
          paddingBottom: '4px',
          backgroundColor: '[#292D3E]',
          userSelect: 'none',
        })}
        contenteditable="false"
        data-drag-handle
        draggable
      >
        <div
          class={css({
            flexGrow: '1',
            paddingLeft: '54px',
            fontSize: '14px',
            fontWeight: 'medium',
            color: 'gray.50',
            textAlign: 'center',
          })}
        >
          HTML
        </div>

        <div class={flex({ align: 'center', gap: '10px', width: '54px' })}>
          <button class={css({ padding: '4px' })} type="button" on:click={() => deleteNode()}>
            <Icon style={css.raw({ color: 'gray.300' })} icon={IconTrash} />
          </button>

          <div class={css({ padding: '4px' })}>
            <Icon style={css.raw({ color: 'gray.300' })} icon={IconGripVertical} />
          </div>
        </div>
      </div>

      <NodeViewContentEditable
        style={css.raw({
          paddingY: '8px',
          paddingX: '12px',
          fontSize: '13px',
          fontFamily: 'mono',
          color: '[#BABED8]',
          backgroundColor: '[#292D3E]',
          overflowX: 'auto',
        })}
        as="pre"
      />
    </div>
  {:else}
    <div
      class={css({
        paddingY: '5px',
        paddingX: '10px',
        fontSize: '12px',
        color: 'gray.400',
        backgroundColor: 'gray.100',
        width: 'fit',
      })}
    >
      HTML
    </div>

    <NodeViewContentEditable style={css.raw({ display: 'none' })} />

    <div
      class={css({
        borderWidth: '1px',
        borderColor: 'gray.150',
      })}
    >
      <iframe
        bind:this={iframeEl}
        class={css({
          display: 'block',
          width: 'full',
        })}
        height="0"
        loading="lazy"
        referrerpolicy="no-referrer"
        sandbox="allow-scripts"
        srcdoc={makeIFrameContent(node.textContent)}
        title="HTML"
      />
    </div>
  {/if}
</NodeView>
