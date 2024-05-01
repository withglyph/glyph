<script lang="ts">
  import { Editor } from '@tiptap/core';
  import { generateHTML } from '@tiptap/html';
  import { onMount } from 'svelte';
  import { extensions } from '$lib/tiptap';
  import { css, cx } from '$styled-system/css';
  import type { JSONContent } from '@tiptap/core';
  import type { SystemStyleObject } from '$styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;
  export let content: JSONContent;
  export let editor: Editor | undefined = undefined;

  let element: HTMLElement;
  let loaded = false;

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
        attributes: { class: css(style) },
      },

      onCreate: () => {
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
  class={cx(
    'tiptap',
    css({ display: 'contents', fontFamily: 'prose', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }),
  )}
>
  {#if !loaded}
    <div class={cx('ProseMirror', css(style))}>
      {@html html}
    </div>
  {/if}
</article>
