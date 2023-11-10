<script lang="ts">
  import { computePosition, flip, offset, shift } from '@floating-ui/dom';
  import { Editor, posToDOMRect } from '@tiptap/core';
  import { Plugin, PluginKey } from '@tiptap/pm/state';
  import { EditorView } from '@tiptap/pm/view';
  import { onMount, tick } from 'svelte';
  import { portal } from '$lib/svelte/actions';

  export let key = 'floating-menu';
  export let editor: Editor;
  export let when: ((view: EditorView) => boolean) | undefined = undefined;

  let menuEl: HTMLElement;
  let open = false;
  let preventUpdate = false;

  const update = async (view: EditorView) => {
    if (preventUpdate) {
      preventUpdate = false;
      return;
    }

    const { $anchor, empty, from, to } = view.state.selection;
    const isEmptyTextBlock = $anchor.parent.isTextblock && !$anchor.parent.textContent;

    if (!view.hasFocus() || !empty || !isEmptyTextBlock || $anchor.depth !== 1 || when?.(view) === false) {
      open = false;
      return;
    }

    open = true;
    await tick();

    const targetEl = {
      getBoundingClientRect: () => posToDOMRect(view, from, to),
    };

    const position = await computePosition(targetEl, menuEl, {
      placement: 'left',
      middleware: [offset(8), flip(), shift({ padding: 8 })],
    });

    Object.assign(menuEl.style, {
      left: `${position.x}px`,
      top: `${position.y}px`,
    });
  };

  onMount(() => {
    if (!editor?.isDestroyed) {
      editor.registerPlugin(
        new Plugin({
          key: new PluginKey(key),
          view: () => ({ update }),
        }),
      );
    }

    return () => {
      editor.unregisterPlugin(key);
    };
  });
</script>

{#if open}
  <div
    bind:this={menuEl}
    class="absolute z-100"
    role="menu"
    tabindex="-1"
    on:mousedown={() => (preventUpdate = true)}
    use:portal
  >
    <slot />
  </div>
{/if}
