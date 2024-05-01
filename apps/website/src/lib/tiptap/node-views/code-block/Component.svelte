<script lang="ts">
  import { bundledLanguagesInfo } from 'shiki';
  import IconGripVertical from '~icons/tabler/grip-vertical';
  import { Icon } from '$lib/components';
  import { NodeView, NodeViewContentEditable } from '$lib/tiptap';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { NodeViewProps } from '$lib/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let editor: NodeViewProps['editor'] | undefined;
  export let selected: NodeViewProps['selected'];
  export let updateAttributes: NodeViewProps['updateAttributes'];
</script>

<NodeView
  style={css.raw(
    { position: 'relative', borderWidth: '1px', borderStyle: 'dashed' },
    selected && { ringWidth: '2px', ringColor: 'brand.400' },
  )}
>
  {#if editor?.isEditable}
    <div
      class={flex({
        align: 'center',
        gap: '8px',
        paddingX: '8px',
        paddingY: '4px',
        backgroundColor: 'gray.50',
        userSelect: 'none',
      })}
      contenteditable="false"
      data-drag-handle
      draggable
    >
      <div class={css({ flexGrow: '1', fontWeight: 'semibold', color: 'gray.500' })}>CodeBlock</div>

      <select
        class={css({ color: 'gray.900' })}
        value={node.attrs.language}
        on:change={(e) => updateAttributes({ language: e.currentTarget.value })}
      >
        {#each bundledLanguagesInfo as language (language.id)}
          <option value={language.id}>{language.name}</option>
        {/each}
      </select>

      <div
        class={css({
          borderRadius: '4px',
          padding: '4px',
          transition: 'common',
          _hover: { backgroundColor: 'gray.100' },
        })}
      >
        <Icon style={css.raw({ color: 'gray.600' })} icon={IconGripVertical} size={20} />
      </div>
    </div>

    <NodeViewContentEditable
      style={css.raw({ padding: '8px', fontSize: '14px', fontFamily: 'mono', overflowX: 'auto' })}
      as="pre"
    />
  {:else}
    <NodeViewContentEditable
      style={css.raw({ padding: '8px', fontSize: '14px', fontFamily: 'mono', userSelect: 'text', overflowX: 'auto' })}
      as="pre"
    />
  {/if}
</NodeView>
