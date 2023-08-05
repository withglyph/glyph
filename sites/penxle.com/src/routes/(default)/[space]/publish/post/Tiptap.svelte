<script lang="ts">
  import { Editor } from '@tiptap/core';
  import { Bold } from '@tiptap/extension-bold';
  import { Document } from '@tiptap/extension-document';
  import { HardBreak } from '@tiptap/extension-hard-break';
  import { Heading } from '@tiptap/extension-heading';
  import { History } from '@tiptap/extension-history';
  import { Italic } from '@tiptap/extension-italic';
  import { Paragraph } from '@tiptap/extension-paragraph';
  import { Placeholder } from '@tiptap/extension-placeholder';
  import { Strike } from '@tiptap/extension-strike';
  import { Text } from '@tiptap/extension-text';
  import { TextAlign } from '@tiptap/extension-text-align';
  import { Typography } from '@tiptap/extension-typography';
  import { Underline } from '@tiptap/extension-underline';
  import { onDestroy, onMount } from 'svelte';

  let element: HTMLDivElement;
  let _class: string;
  export { _class as class };
  export let editor: Editor | undefined = undefined;
  export let value: object | undefined = undefined;

  const placeholder = '내용을 입력하세요.';

  onMount(() => {
    editor = new Editor({
      element,
      content: value,
      extensions: [
        Bold,
        Document,
        HardBreak,
        Heading.configure({ levels: [1, 2, 3] }),
        History,
        Italic,
        Paragraph,
        Placeholder.configure({ placeholder }),
        Strike,
        Text,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Typography.configure({
          copyright: false,
          registeredTrademark: false,
          trademark: false,
          servicemark: false,
          oneHalf: false,
          oneQuarter: false,
          threeQuarters: false,
        }),
        Underline,
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
    <div
      class="ProseMirror font-content-sans max-w-full whitespace-pre-wrap prose prose-gray"
    >
      <p class="is-editor-empty" data-placeholder={placeholder} />
    </div>
  {/if}
</div>
