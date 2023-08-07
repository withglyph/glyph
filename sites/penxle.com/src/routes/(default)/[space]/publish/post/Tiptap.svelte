<script lang="ts">
  import { Editor } from '@tiptap/core';
  import { onDestroy, onMount } from 'svelte';
  import {
    DropCursor,
    GapCursor,
    History,
    Placeholder,
    TextAlign,
  } from '$lib/tiptap/extensions';
  import { Bold, Italic, Strike, Underline } from '$lib/tiptap/marks';
  import { AccessBarrier } from '$lib/tiptap/node-views';
  import {
    Document,
    HardBreak,
    Heading,
    Paragraph,
    Text,
  } from '$lib/tiptap/nodes';
  import type { JSONContent } from '@tiptap/core';

  let element: HTMLDivElement;
  let _class: string;
  export { _class as class };
  export let editor: Editor | undefined = undefined;
  export let value: JSONContent | undefined = undefined;

  const placeholder = '내용을 입력하세요.';

  onMount(() => {
    editor = new Editor({
      element,
      content: value,
      extensions: [
        // special nodes
        Document,
        Text,

        // nodes
        HardBreak,
        Heading,
        Paragraph,

        // marks
        Bold,
        Italic,
        Strike,
        Underline,

        // extensions
        DropCursor,
        GapCursor,
        History,
        Placeholder,
        TextAlign,

        // node views
        AccessBarrier,
      ],
      injectCSS: false,
      editorProps: {
        attributes: { class: _class },
        scrollMargin: { top: 100, bottom: 100, left: 0, right: 0 },
        scrollThreshold: { top: 100, bottom: 100, left: 0, right: 0 },
        handleKeyDown: (_, event) => {
          // 맥 구름입력기에서 엔터키 입력시 마지막 글자 잘리는 문제 workaround
          if (editor && event.key === 'Enter') {
            const s = editor.view.state.selection;
            editor.commands.setTextSelection(s.to);
          }
        },
      },
      onTransaction: () => {
        // eslint-disable-next-line no-self-assign
        editor = editor;
        value = editor?.getJSON();
      },
    });
  });

  onDestroy(() => {
    editor?.destroy();
  });
</script>

<div bind:this={element} class="contents">
  {#if !editor}
    <div class="ProseMirror font-content-sans max-w-full whitespace-pre-wrap">
      <p class="is-editor-empty" data-placeholder={placeholder} />
    </div>
  {/if}
</div>
