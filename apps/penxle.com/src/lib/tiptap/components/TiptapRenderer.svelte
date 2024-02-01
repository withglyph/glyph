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
  export let paragraphIndent: number | undefined = undefined;
  export let paragraphSpacing: number | undefined = undefined;

  export let protectContent = false;
  const handleContentProtection = (e: Event) => {
    if (protectContent) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  let element: HTMLElement;
  let loaded = false;

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

<article
  bind:this={element}
  class={_class}
  data-indent={paragraphIndent}
  data-spacing={paragraphSpacing}
  on:copy|capture={handleContentProtection}
  on:cut|capture={handleContentProtection}
  on:contextmenu|capture={handleContentProtection}
>
  {#if !loaded}
    <div class="ProseMirror">
      {@html html}
    </div>
  {/if}
</article>
