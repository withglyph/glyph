<script lang="ts">
  import { Editor, isTextSelection, posToDOMRect } from '@tiptap/core';
  import { Plugin, PluginKey } from '@tiptap/pm/state';
  import { onMount, tick } from 'svelte';
  import { createFloatingActions } from '$lib/svelte/actions';
  import { css } from '$styled-system/css';
  import type { VirtualElement } from '@floating-ui/dom';
  import type { EditorView } from '@tiptap/pm/view';

  export let editor: Editor;

  let open = false;

  const { anchor, floating, arrow } = createFloatingActions({
    placement: 'bottom',
    offset: 8,
    arrow: true,
  });

  const update = async (view: EditorView) => {
    const { from, to, empty } = view.state.selection;

    if (empty || !isTextSelection(view.state.selection)) {
      open = false;
      return;
    }

    open = true;
    await tick();

    const targetEl: VirtualElement = {
      getBoundingClientRect: () => posToDOMRect(view, from, to),
      contextElement: editor.view.dom,
    };

    anchor(targetEl);
  };

  onMount(() => {
    const key = new PluginKey();

    editor.registerPlugin(
      new Plugin({
        key,
        view: () => ({ update }),
      }),
    );

    return () => {
      editor.unregisterPlugin(key);
    };
  });
</script>

{#if open}
  <div
    class={css({
      borderRadius: '8px',
      padding: '8px',
      fontSize: '14px',
      color: 'gray.300',
      backgroundColor: 'gray.900',
      userSelect: 'none',
      zIndex: '1',
    })}
    use:floating
  >
    <slot />
    <div class={css({ size: '8px', backgroundColor: 'gray.900' })} use:arrow />
  </div>
{/if}
