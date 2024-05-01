<script lang="ts">
  import { Editor } from '@tiptap/core';
  import { onMount } from 'svelte';
  import * as YAwareness from 'y-protocols/awareness';
  import * as Y from 'yjs';
  import { dev } from '$app/environment';
  import { extensions } from '$lib/tiptap';
  import { css, cx } from '$styled-system/css';
  import { Collaboration, Freeze } from '../extensions';
  import type { SystemStyleObject } from '$styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;

  export let document: Y.Doc | undefined = undefined;
  export let awareness: YAwareness.Awareness | undefined = undefined;

  export let editor: Editor | undefined = undefined;
  export let frozen = false;

  let element: HTMLDivElement;

  onMount(() => {
    editor = new Editor({
      element,
      extensions: [
        ...extensions,
        ...(document && awareness ? [Collaboration.configure({ document, awareness })] : []),
        ...(frozen ? [Freeze] : []),
      ],
      injectCSS: false,
      editorProps: {
        attributes: { class: css(style) },
        scrollMargin: { top: 150, bottom: 50, left: 0, right: 0 },
        scrollThreshold: { top: 150, bottom: 50, left: 0, right: 0 },
        handleKeyDown: (_, event) => {
          // 맥 구름입력기에서 엔터키 입력시 마지막 글자 잘리는 문제 workaround
          if (editor && event.key === 'Enter') {
            const s = editor.view.state.selection;
            editor.commands.setTextSelection(s.to);
          }
        },
      },
      onTransaction: ({ editor: editor_ }) => {
        editor = editor_;
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
  class={cx(
    'tiptap tiptap-editor',
    css({ display: 'contents', fontFamily: 'prose', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }),
  )}
  autocapitalize="off"
  autocorrect="off"
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
      fontFamily: 'mono',
      fontSize: '12px',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      backgroundColor: 'gray.50',
      opacity: '50',
      overflow: 'scroll',
      pointerEvents: 'none',
      zIndex: '[100]',
    })}
  >
    {JSON.stringify(editor?.getJSON(), null, 2)}
  </div>
{/if}
