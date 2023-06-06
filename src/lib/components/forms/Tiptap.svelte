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
    });
  });

  onDestroy(() => {
    editor?.destroy();
  });
</script>

<div bind:this={element} />
