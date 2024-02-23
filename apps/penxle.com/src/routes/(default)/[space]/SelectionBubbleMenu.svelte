<script lang="ts">
  import { Editor, isTextSelection, posToDOMRect } from '@tiptap/core';
  import { Plugin, PluginKey } from '@tiptap/pm/state';
  import { EditorView } from '@tiptap/pm/view';
  import { onMount, tick } from 'svelte';
  import { createFloatingActions } from '$lib/svelte/actions';
  import type { VirtualElement } from '@floating-ui/dom';

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
  <div class="z-1 select-none bg-gray-90 text-sm text-gray-30 rounded-lg p-2" use:floating>
    <slot />
    <div class="square-2 bg-gray-90" use:arrow />
  </div>
{/if}
