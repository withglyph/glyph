<script lang="ts">
  import { Editor } from '@tiptap/core';
  import { StarterKit } from '@tiptap/starter-kit';
  import { onDestroy, onMount } from 'svelte';
  import type { JSONContent } from '@tiptap/core';

  let element: HTMLDivElement;
  let editor: Editor | undefined;

  export let value: JSONContent | undefined = undefined;
  export let autofocus = false;

  onMount(() => {
    editor = new Editor({
      element,
      autofocus,
      extensions: [StarterKit],
      editorProps: {
        handleKeyDown: (_, event) => {
          // 맥 구름입력기에서 엔터키 입력시 마지막 글자 잘리는 문제 workaround
          if (editor && event.key === 'Enter') {
            const s = editor.view.state.selection;
            editor.commands.setTextSelection(s.to);
          }
        },
      },
      content: value,
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

<div
  bind:this={element}
  class="max-w-full border rounded p-4 prose prose-neutral"
/>

<pre class="whitespace-pre p-4 font-mono text-xs">
{JSON.stringify(editor?.getJSON(), null, 2)}
</pre>
