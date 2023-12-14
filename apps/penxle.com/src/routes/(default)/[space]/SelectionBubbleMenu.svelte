<script lang="ts">
  import { arrow, computePosition, flip, offset, shift } from '@floating-ui/dom';
  import { Editor, isiOS, isTextSelection, posToDOMRect } from '@tiptap/core';
  import { Plugin, PluginKey } from '@tiptap/pm/state';
  import { EditorView } from '@tiptap/pm/view';
  import clsx from 'clsx';
  import * as R from 'radash';
  import { onMount, tick } from 'svelte';
  import { portal } from '$lib/svelte/actions';
  import { isEmptyTextBlock } from '$lib/utils';

  let key = 'share-bubble-menu';
  export let editor: Editor;
  let _class: string | undefined = undefined;
  export { _class as class };

  let menuEl: HTMLElement;
  let arrowEl: HTMLElement;
  let open = false;
  let preventUpdate = false;

  const update = R.debounce({ delay: 150 }, async (view: EditorView) => {
    if (preventUpdate) {
      preventUpdate = false;
      return;
    }

    const { empty, to, $anchor } = view.state.selection;

    if (empty || isEmptyTextBlock($anchor.parent) || isTextSelection(view.state.selection) === false) {
      open = false;
      return;
    }

    open = true;
    await tick();

    const targetEl = {
      getBoundingClientRect: () => posToDOMRect(view, to, to),
    };

    const position = await computePosition(targetEl, menuEl, {
      placement: 'right',
      middleware: [offset(8), flip(), shift({ padding: 8 }), arrow({ element: arrowEl })],
    });

    if (position.placement !== 'right' && isiOS()) {
      open = false;
      return;
    }

    Object.assign(menuEl.style, {
      left: `${position.x}px`,
      top: `${position.y}px`,
    });

    if (position.middlewareData.arrow) {
      const { x, y } = position.middlewareData.arrow;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const staticSide = {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right',
      }[position.placement.split('-')[0]]!;

      Object.assign(arrowEl.style, {
        left: x === undefined ? '' : `${x}px`,
        top: y === undefined ? '' : `${y}px`,
        [staticSide]: '-0.25rem',
      });
    }
  });

  onMount(() => {
    editor.registerPlugin(
      new Plugin({
        key: new PluginKey(key),
        view: () => ({ update }),
      }),
    );

    const resize = () => update(editor.view);
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      editor.unregisterPlugin(key);
    };
  });
</script>

<!-- <svelte:document
  on:mousedown={() => {
    if (open) {
      update.flush(editor.view);
      open = false;
    }
  }}
/> -->

{#if open}
  <div
    bind:this={menuEl}
    class={clsx('absolute z-1 select-none bg-gray-90 text-sm text-gray-30 rounded-lg p-2', _class)}
    role="menu"
    tabindex="-1"
    on:mousedown|stopPropagation={() => (preventUpdate = true)}
    use:portal
  >
    <slot />
    <div bind:this={arrowEl} class="absolute square-2 rotate-45 bg-gray-90" />
  </div>
{/if}
