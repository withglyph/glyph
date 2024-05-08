<script lang="ts">
  import { Editor } from '@tiptap/core';
  import { createEventDispatcher, onMount } from 'svelte';
  import * as YAwareness from 'y-protocols/awareness';
  import * as Y from 'yjs';
  import { extensions } from '$lib/tiptap';
  import { Collaboration, Freeze } from '$lib/tiptap/extensions';
  import { css, cx } from '$styled-system/css';
  import type { SystemStyleObject } from '$styled-system/types';

  const dispatch = createEventDispatcher<{ file: { pos: number; files: File[] } }>();

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
        handleDrop: (view, event) => {
          if (event.dataTransfer?.files?.length) {
            dispatch('file', {
              pos: view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos ?? view.state.selection.to,
              files: [...event.dataTransfer.files],
            });
            return true;
          }
        },
        handlePaste: (view, event) => {
          if (event.clipboardData?.files?.length) {
            dispatch('file', {
              pos: view.state.selection.to,
              files: [...event.clipboardData.files],
            });
            return true;
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
