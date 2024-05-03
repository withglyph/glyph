<script lang="ts">
  import IconCheck from '~icons/tabler/check';
  import IconClipboard from '~icons/tabler/clipboard';
  import IconGripVertical from '~icons/tabler/grip-vertical';
  import IconTrash from '~icons/tabler/trash';
  import { Icon } from '$lib/components';
  import { toast } from '$lib/notification';
  import { NodeView, NodeViewContentEditable } from '$lib/tiptap';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import Select from './Select.svelte';
  import type { NodeViewProps } from '$lib/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let editor: NodeViewProps['editor'] | undefined;
  export let selected: NodeViewProps['selected'];
  export let updateAttributes: NodeViewProps['updateAttributes'];
  export let deleteNode: NodeViewProps['deleteNode'];

  let copied = false;
</script>

<NodeView style={css.raw({ position: 'relative' }, selected && { ringWidth: '2px', ringColor: 'brand.400' })}>
  {#if editor?.isEditable}
    <div
      class={flex({
        align: 'center',
        justifyContent: 'space-between',
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
      <Select {node} {updateAttributes} />

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
      style={css.raw({ paddingY: '8px', paddingX: '12px', fontSize: '14px', fontFamily: 'mono', overflowX: 'auto' })}
      as="pre"
    />
  {:else}
    <div
      class={flex({
        align: 'center',
        justify: 'flex-end',
        gap: '6px',
        paddingTop: '6px',
        paddingX: '12px',
        paddingBottom: '4px',
        height: '34px',
      })}
    >
      <div
        class={css({
          paddingX: '8px',
          paddingY: '4px',
          fontSize: '12px',
          fontWeight: 'medium',
          color: 'gray.5',
          backgroundColor: 'gray.600',
          opacity: copied ? '100' : '0',
          transition: 'opacity',
        })}
      >
        복사됨
      </div>
      <button
        class={css({ paddingX: '4px' })}
        type="button"
        on:click={async () => {
          try {
            // @ts-expect-error type mismatch
            navigator.clipboard.writeText(node.content.content[0].text);
            copied = true;

            setTimeout(() => {
              copied = false;
            }, 1000);
          } catch (err) {
            toast('클립보드 복사를 실패했어요');
            console.error(err);
          }
        }}
      >
        <Icon style={css.raw({ color: 'gray.300' })} icon={copied ? IconCheck : IconClipboard} size={20} />
      </button>
    </div>
    <NodeViewContentEditable
      style={css.raw({
        paddingY: '8px',
        paddingX: '12px',
        fontSize: '14px',
        fontFamily: 'mono',
        userSelect: 'text',
        overflowX: 'auto',
      })}
      as="pre"
    />
  {/if}
</NodeView>
