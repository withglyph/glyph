<script lang="ts">
  import { Editor } from '@tiptap/core';
  import { Placeholder } from '@tiptap/extension-placeholder';
  import { StarterKit } from '@tiptap/starter-kit';
  import clsx from 'clsx';
  import { onDestroy, onMount } from 'svelte';

  let element: HTMLDivElement;
  export let editor: Editor | undefined = undefined;

  let _class: string | undefined = undefined;
  export { _class as class };
  export let value: object | undefined = undefined;
  export let placeholder = '내용을 입력하세요.';

  onMount(() => {
    editor = new Editor({
      element,
      content: value,
      extensions: [StarterKit, Placeholder.configure({ placeholder })],
      editorProps: {
        attributes: {
          class: clsx('max-w-full prose prose-neutral', _class),
        },
        handleKeyDown: (_, event) => {
          // 맥 구름입력기에서 엔터키 입력시 마지막 글자 잘리는 문제 workaround
          if (editor && event.key === 'Enter') {
            const s = editor.view.state.selection;
            editor.commands.setTextSelection(s.to);
          }
        },
      },
      onTransaction: () => {
        editor = editor;
        value = editor?.getJSON();
      },
    });
  });

  onDestroy(() => {
    editor?.destroy();
  });
</script>

<div bind:this={element} class="contents" />
