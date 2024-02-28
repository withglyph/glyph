<script lang="ts">
  import { Editor } from '@tiptap/core';
  import { createEventDispatcher, onMount } from 'svelte';
  import { dev } from '$app/environment';
  import { extensions } from '$lib/tiptap';
  import { css, cx } from '$styled-system/css';
  import type { JSONContent } from '@tiptap/core';
  import type { SystemStyleObject } from '$styled-system/types';
  import type { TiptapContentOptions } from '../types';

  export let style: SystemStyleObject | undefined = undefined;
  export let content: JSONContent | undefined = undefined;
  export let options: TiptapContentOptions;

  export let editor: Editor | undefined = undefined;

  const dispatch = createEventDispatcher<{ change: JSONContent }>();

  let element: HTMLDivElement;

  onMount(() => {
    editor = new Editor({
      element,
      content,
      extensions,
      injectCSS: false,
      editorProps: {
        attributes: { class: css(style) },
        scrollMargin: { top: 150, bottom: 50, left: 0, right: 0 },
        scrollThreshold: { top: 150, bottom: 50, left: 0, right: 0 },
        // handleKeyDown: (_, event) => {
        //   // 맥 구름입력기에서 엔터키 입력시 마지막 글자 잘리는 문제 workaround
        //   if (editor && event.key === 'Enter') {
        //     const s = editor.view.state.selection;
        //     editor.commands.setTextSelection(s.to);
        //   }
        // },
      },
      onTransaction: ({ editor: editor_, transaction }) => {
        editor = editor_;
        if (transaction.docChanged) {
          content = editor.getJSON();
          dispatch('change', content);
        }
      },
    });

    return () => {
      editor?.destroy();
      editor = undefined;
    };
  });
</script>

<div
  bind:this={element}
  class={cx('tiptap tiptap-editor', css({ display: 'contents', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }))}
  autocapitalize="off"
  autocorrect="off"
  data-indent={options.paragraphIndent}
  data-spacing={options.paragraphSpacing}
  spellcheck="false"
/>

{#if dev}
  <div
    class={css({
      position: 'fixed',
      top: '0',
      right: '0',
      padding: '16px',
      width: '[20vw]',
      height: 'screen',
      fontFamily: '[PNXL_FiraCode]',
      fontSize: '12px',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      backgroundColor: 'gray.50',
      opacity: '[0.5]',
      overflow: 'scroll',
      pointerEvents: 'none',
      zIndex: '50',
    })}
  >
    {JSON.stringify(content, null, 2)}
  </div>
{/if}
