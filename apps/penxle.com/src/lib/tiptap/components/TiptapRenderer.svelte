<script lang="ts">
  import { Editor } from '@tiptap/core';
  import { generateHTML } from '@tiptap/html';
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

  $: if (element && editor) {
    element.append(editor.options.element);
  }

  onMount(() => {
    editor = new Editor({
      editable: false,
      content,
      extensions,
      injectCSS: false,
    });

    return () => {
      editor?.destroy();
    };
  });
</script>

<div class={_class}>
  {#if editor}
    <div bind:this={element} />
  {:else}
    <div class="ProseMirror">
      {@html html}
    </div>
  {/if}
</div>
