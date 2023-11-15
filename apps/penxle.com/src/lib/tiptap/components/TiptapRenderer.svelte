<script lang="ts">
  import { Editor } from '@tiptap/core';
  import { generateHTML } from '@tiptap/html';
  import { onMount } from 'svelte';
  import { extensions } from '$lib/tiptap';
  import type { JSONContent } from '@tiptap/core';
  import type { HTMLAttributes } from 'svelte/elements';

  export let content: JSONContent;
  export let editor: Editor | undefined = undefined;

  let element: HTMLElement;
  let loaded = false;

  type $$Props = HTMLAttributes<HTMLDivElement> & { content: JSONContent; editor?: Editor | undefined };

  $: html = generateHTML(content, extensions);
  $: editor?.commands.setContent(content);

  onMount(() => {
    editor = new Editor({
      editable: false,
      content,
      extensions,
      injectCSS: false,

      onCreate: ({ editor }) => {
        element.append(editor.options.element);
        loaded = true;
      },
    });

    return () => {
      editor?.destroy();
    };
  });
</script>

<div bind:this={element} {...$$restProps}>
  {#if !loaded}
    <div class="ProseMirror">
      {@html html}
    </div>
  {/if}
</div>
