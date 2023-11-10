<script lang="ts">
  import { computePosition, flip, offset, shift } from '@floating-ui/dom';
  import { Editor, isTextSelection, posToDOMRect } from '@tiptap/core';
  import { Plugin, PluginKey } from '@tiptap/pm/state';
  import { EditorView } from '@tiptap/pm/view';
  import * as R from 'radash';
  import { onMount, tick } from 'svelte';
  import { portal } from '$lib/svelte/actions';

  export let key = 'bubble-menu';
  export let editor: Editor;
  export let when: ((view: EditorView) => boolean) | undefined = undefined;

  let menuEl: HTMLElement;
  let open = false;
  let preventUpdate = false;

  const update = R.debounce({ delay: 150 }, async (view: EditorView) => {
    if (preventUpdate) {
      preventUpdate = false;
      return;
    }

    const { empty, from, to } = view.state.selection;
    const isEmptyTextBlock = view.state.doc.textBetween(from, to).length === 0 && isTextSelection(view.state.selection);

    if (view.composing || !view.hasFocus() || empty || isEmptyTextBlock || when?.(view) === false) {
      open = false;
      return;
    }

    open = true;
    await tick();

    const targetEl = {
      getBoundingClientRect: () => posToDOMRect(view, from, to),
    };

    const position = await computePosition(targetEl, menuEl, {
      placement: 'top',
      middleware: [offset(8), flip(), shift({ padding: 8 })],
    });

    Object.assign(menuEl.style, {
      left: `${position.x}px`,
      top: `${position.y}px`,
    });
  });

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
