<script lang="ts">
  import { Editor } from '@tiptap/core';
  import { StarterKit } from '@tiptap/starter-kit';
  import { onDestroy, onMount } from 'svelte';

  let element: HTMLDivElement;
  let editor: Editor | undefined;

  onMount(() => {
    editor = new Editor({
      element,
      extensions: [StarterKit],
      content: '<p>Hello World! 🌍️ </p>',
      onTransaction: () => (editor = editor),
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
