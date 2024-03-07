<script lang="ts">
  import { html } from '@codemirror/lang-html';
  import { EditorView, minimalSetup } from 'codemirror';
  import DOMPurify from 'isomorphic-dompurify';
  import { onMount } from 'svelte';
  import IconEye from '~icons/tabler/eye';
  import IconGripVertical from '~icons/tabler/grip-vertical';
  import { Icon } from '$lib/components';
  import { NodeView } from '$lib/tiptap';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { NodeViewProps } from '$lib/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let editor: NodeViewProps['editor'] | undefined;
  export let selected: NodeViewProps['selected'];
  export let updateAttributes: NodeViewProps['updateAttributes'];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let codeMirror: EditorView | undefined;
  let codeEl: HTMLDivElement;

  let preview = false;

  $: content = DOMPurify.isSupported ? DOMPurify.sanitize(node.attrs.content) : '';

  onMount(() => {
    if (!editor?.isEditable) {
      return;
    }

    const theme = EditorView.theme({
      '&.cm-editor.cm-focused': {
        outline: 'none',
      },
      '.cm-scroller': {
        fontFamily: 'inherit',
      },
    });

    codeMirror = new EditorView({
      parent: codeEl,
      doc: node.attrs.content,
      extensions: [
        minimalSetup,
        theme,
        html(),
        EditorView.updateListener.of((v) => {
          if (v.docChanged) {
            updateAttributes({
              content: v.state.doc.toString(),
            });
          }
        }),
      ],
    });
  });
</script>

<NodeView
  style={css.raw(
    { position: 'relative', borderWidth: '1px', borderStyle: 'dashed' },
    selected && { ringWidth: '2px', ringColor: 'teal.500' },
  )}
  draggable
>
  {#if editor?.isEditable}
    <div
      class={flex({ align: 'center', gap: '8px', paddingX: '8px', paddingY: '4px', backgroundColor: 'gray.50' })}
      data-drag-handle
    >
      <div class={css({ flexGrow: '1', fontWeight: 'semibold', color: 'gray.500' })}>HTML</div>

      {#if preview}
        <div class={css({ fontSize: '12px', color: 'gray.500' })}>미리보는 중</div>
      {/if}

      <button
        class={css({
          borderRadius: '4px',
          padding: '4px',
          transition: 'common',
          _hover: { backgroundColor: 'gray.100' },
        })}
        type="button"
        on:click={() => (preview = !preview)}
      >
        <Icon
          style={css.raw({ size: '18px' }, preview ? { color: 'teal.500' } : { color: 'gray.600' })}
          icon={IconEye}
        />
      </button>

      <div
        class={css({
          borderRadius: '4px',
          padding: '4px',
          transition: 'common',
          _hover: { backgroundColor: 'gray.100' },
        })}
      >
        <Icon style={css.raw({ color: 'gray.600', size: '18px' })} icon={IconGripVertical} />
      </div>
    </div>

    <div class={css({ padding: '8px' })}>
      <div class={css({ fontSize: '14px', fontFamily: '[PNXL_firacode]' }, preview && { display: 'none' })}>
        <div bind:this={codeEl} />
      </div>

      {#if preview}
        <div class={css({ position: 'relative', overflow: 'hidden', isolation: 'isolate' })}>
          <div class="html-content">
            {@html content}
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <div
      class={css({ position: 'relative', overflow: 'hidden', isolation: 'isolate', paddingX: '8px', paddingY: '4px' })}
    >
      <div class="html-content">
        {@html content}
      </div>
    </div>
  {/if}
</NodeView>

<style>
  .html-content {
    all: initial;

    & :global(:where(:not(svg, svg *))) {
      all: revert;
    }
  }
</style>
