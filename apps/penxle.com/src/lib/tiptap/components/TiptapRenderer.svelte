<script lang="ts">
  import { Editor } from '@tiptap/core';
  import { generateHTML } from '@tiptap/html';
  import clsx from 'clsx';
  import { onMount } from 'svelte';
  import { extensions } from '$lib/tiptap';
  import type { JSONContent } from '@tiptap/core';

  let _class: string;
  export { _class as class };
  export let content: JSONContent;
  export let editor: Editor | undefined = undefined;

  let element: HTMLElement;

  $: html = generateHTML(content, extensions);
  $: editor?.commands.setContent(content);

  onMount(() => {
    editor = new Editor({
      element,
      editable: false,
      content,
      extensions,
      injectCSS: false,
      editorProps: {
        attributes: { class: _class },
      },
    });

    return () => {
      editor?.destroy();
    };
  });
</script>

<div bind:this={element} class="contents">
  {#if !editor}
    <div class={clsx('ProseMirror', _class)}>
      {@html html}
    </div>
  {/if}
</div>
