<script lang="ts">
  import { Editor } from '@tiptap/core';
  import { Fragment, Node, Slice } from '@tiptap/pm/model';
  import { createEventDispatcher, onMount } from 'svelte';
  import { dev } from '$app/environment';
  import { extensions } from '$lib/tiptap';
  import type { JSONContent } from '@tiptap/core';
  import type { EditorProps } from '@tiptap/pm/view';
  import type { TiptapContentOptions } from '../types';

  let _class: string;
  export { _class as class };

  export let content: JSONContent | undefined = undefined;
  export let options: TiptapContentOptions;

  export let editor: Editor | undefined = undefined;

  const dispatch = createEventDispatcher<{ change: JSONContent }>();

  let element: HTMLDivElement;

  const clipboardTextParser: EditorProps['clipboardTextParser'] = (text, context) => {
    const lines = text.split(/\r\n?|\n/);

    const nodes = lines.map((line) => {
      const content: JSONContent = {
        type: 'paragraph',
        ...(line.length > 0 ? { content: [{ type: 'text', text: line }] } : {}),
      };
      return Node.fromJSON(context.doc.type.schema, content);
    });

    const fragment = Fragment.fromArray(nodes);
    return Slice.maxOpen(fragment);
  };

  onMount(() => {
    editor = new Editor({
      element,
      content,
      extensions,
      injectCSS: false,
      editorProps: {
        clipboardTextParser,
        attributes: { class: _class },
        scrollMargin: { top: 150, bottom: 50, left: 0, right: 0 },
        scrollThreshold: { top: 150, bottom: 50, left: 0, right: 0 },
        handleKeyDown: (_, event) => {
          // 맥 구름입력기에서 엔터키 입력시 마지막 글자 잘리는 문제 workaround
          if (editor && event.key === 'Enter') {
            const s = editor.view.state.selection;
            editor.commands.setTextSelection(s.to);
          }
        },
      },
      onTransaction: ({ editor: editor_, transaction }) => {
        editor = editor_;
        if (transaction.docChanged) {
          content = editor.getJSON();
          dispatch('change', content);
        }
      },
    });

    return () => {
      editor?.destroy();
      editor = undefined;
    };
  });
</script>

<div
  bind:this={element}
  class="tiptap tiptap-editor contents whitespace-pre-wrap break-all"
  autocapitalize="off"
  autocorrect="off"
  data-indent={options.paragraphIndent}
  data-spacing={options.paragraphSpacing}
  spellcheck="false"
/>

{#if dev}
  <div
    class="fixed top-0 right-0 z-100 opacity-50 pointer-events-none p-4 bg-gray-5 w-20vw font-mono whitespace-pre-wrap break-all text-xs h-screen overflow-scroll"
  >
    {JSON.stringify(content, null, 2)}
  </div>
{/if}
