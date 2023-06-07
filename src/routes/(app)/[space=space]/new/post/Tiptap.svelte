<script lang="ts">
  import { Editor } from '@tiptap/core';
  import { Placeholder } from '@tiptap/extension-placeholder';
  import { TextAlign } from '@tiptap/extension-text-align';
  import { Underline } from '@tiptap/extension-underline';
  import { StarterKit } from '@tiptap/starter-kit';
  import { onDestroy, onMount } from 'svelte';

  let element: HTMLDivElement;
  export let editor: Editor | undefined = undefined;
  export let value: object | undefined = undefined;

  const placeholder = '내용을 입력하세요.';

  onMount(() => {
    editor = new Editor({
      element,
      content: value,
      extensions: [
        Placeholder.configure({ placeholder }),
        StarterKit,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Underline,
      ],
      editorProps: {
        attributes: {
          class: 'max-w-full grow prose prose-neutral',
        },
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
    <div class="ProseMirror max-w-full prose prose-neutral">
      <p class="is-editor-empty" data-placeholder={placeholder} />
    </div>
  {/if}
</div>
