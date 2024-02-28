<script lang="ts">
  import { Editor } from '@tiptap/core';
  import { generateHTML } from '@tiptap/html';
  import { onMount } from 'svelte';
  import { extensions } from '$lib/tiptap';
  import { css, cx } from '$styled-system/css';
  import type { JSONContent } from '@tiptap/core';
  import type { SystemStyleObject } from '$styled-system/types';
  import type { TiptapRendererOptions } from '../types';

  export let style: SystemStyleObject | undefined = undefined;

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
        attributes: { class: css(style) },
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
  class={cx('tiptap', css({ display: 'contents', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }))}
  data-indent={options.paragraphIndent}
  data-spacing={options.paragraphSpacing}
  on:copy|capture={handleContentProtection}
  on:cut|capture={handleContentProtection}
  on:contextmenu|capture={handleContentProtection}
>
  {#if !loaded}
    <div class={cx('ProseMirror', css(style))}>
      {@html html}
    </div>
  {/if}
</article>
