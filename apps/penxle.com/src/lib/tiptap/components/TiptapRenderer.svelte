<script lang="ts">
  import { Editor } from '@tiptap/core';
  import { generateHTML } from '@tiptap/html';
  import clsx from 'clsx';
  import { onMount } from 'svelte';
  import { extensions } from '$lib/tiptap';
  import type { JSONContent } from '@tiptap/core';
  import type { TiptapRendererOptions } from '../types';

  let _class: string;
  export { _class as class };

  export let content: JSONContent;
  export let options: TiptapRendererOptions;

  export let editor: Editor | undefined = undefined;

  let element: HTMLElement;
  let loaded = false;

  $: html = generateHTML(content, extensions);

  const handleContentProtection = (e: Event) => {
    if (options.protectContent) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  onMount(() => {
    editor = new Editor({
      editable: false,
      content,
      extensions,
      injectCSS: false,

      editorProps: {
        attributes: { class: _class },
      },

      onCreate: ({ editor }) => {
        element.append(editor.options.element);
        loaded = true;
      },
    });

    return () => {
      editor?.destroy();
      editor = undefined;
    };
  });
</script>

<article
  bind:this={element}
  class="tiptap contents whitespace-pre-wrap break-all"
  data-indent={options.paragraphIndent}
  data-spacing={options.paragraphSpacing}
  on:copy|capture={handleContentProtection}
  on:cut|capture={handleContentProtection}
  on:contextmenu|capture={handleContentProtection}
>
  {#if !loaded}
    <div class={clsx('ProseMirror', _class)}>
      {@html html}
    </div>
  {/if}
</article>
