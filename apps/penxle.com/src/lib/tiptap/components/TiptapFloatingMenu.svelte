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
  export let leftOffset = 0;

  let menuEl: HTMLElement;
  let open = false;
  let preventUpdate = false;

  const update = async (view: EditorView) => {
    if (preventUpdate) {
      preventUpdate = false;
      return;
    }

    const { from, to } = view.state.selection;

    if (!view.hasFocus() || when?.(view) === false) {
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

    const { left } = editor.view.dom.getBoundingClientRect();

    Object.assign(menuEl.style, {
      left: `${left - leftOffset}px`,
      top: `${position.y}px`,
    });
  };

  onMount(() => {
    editor.registerPlugin(
      new Plugin({
        key: new PluginKey(key),
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
