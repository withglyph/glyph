<script lang="ts">
  import { html } from '@codemirror/lang-html';
  import clsx from 'clsx';
  import { EditorView, minimalSetup } from 'codemirror';
  import DOMPurify from 'isomorphic-dompurify';
  import { onMount } from 'svelte';
  import { NodeView } from '$lib/tiptap';
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

  $: content = DOMPurify.sanitize(node.attrs.content, {
    USE_PROFILES: { html: true },
  });

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

<NodeView class={clsx('relative border border-dashed', selected && 'ring-2px ring-teal-500')} draggable>
  {#if editor?.isEditable}
    <div class="flex items-center gap-8px bg-gray-50 px-8px py-4px" data-drag-handle>
      <div class="text-16-sb text-gray-500 grow">HTML</div>

      {#if preview}
        <div class="text-12-r text-gray-500">미리보는 중</div>
      {/if}

      <button
        class="p-4px rounded-4px transition hover:bg-gray-100"
        type="button"
        on:click={() => (preview = !preview)}
      >
        <i class={clsx('block i-tb-eye square-18px', preview ? 'text-teal-500' : 'text-gray-600')} />
      </button>

      <div class="p-4px rounded-4px transition hover:bg-gray-100">
        <i class="block i-tb-grip-vertical square-18px text-gray-600" />
      </div>
    </div>

    <div class="p-8px">
      <div class={clsx('font-mono text-14-r', preview && 'hidden')}>
        <div bind:this={codeEl} />
      </div>

      {#if preview}
        <div class="relative overflow-hidden isolate">
          {@html content}
        </div>
      {/if}
    </div>
  {:else}
    <div class="relative overflow-hidden isolate px-8px py-4px">
      {@html content}
    </div>
  {/if}
</NodeView>
