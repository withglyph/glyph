<script lang="ts">
  import { Editor } from '@tiptap/core';
  import { generateHTML } from '@tiptap/html';
  import clsx from 'clsx';
  import { onMount } from 'svelte';
  import { extensions } from '$lib/tiptap';
  import type { JSONContent } from '@tiptap/core';
  import type { HTMLAttributes } from 'svelte/elements';

  export let content: JSONContent;
  export let editor: Editor | undefined = undefined;

  let element: HTMLElement;

  type $$Props = HTMLAttributes<HTMLDivElement> & { content: JSONContent; editor?: Editor | undefined };

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
      editorProps: {
        attributes: { class: $$props.class ?? '' },
      },
    });

    return () => {
      editor?.destroy();
    };
  });
</script>

<div bind:this={element} class={clsx(...(editor ? [] : ['ProseMirror', $$props.class]))} {...$$restProps}>
  {#if !editor}
    {@html html}
  {/if}
</div>
