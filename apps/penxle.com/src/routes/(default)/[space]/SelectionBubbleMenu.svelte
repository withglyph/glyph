<script lang="ts">
  import { flip, offset, shift } from '@floating-ui/dom';
  import { Editor, isiOS, isTextSelection, posToDOMRect } from '@tiptap/core';
  import { Plugin, PluginKey } from '@tiptap/pm/state';
  import { EditorView } from '@tiptap/pm/view';
  import clsx from 'clsx';
  import * as R from 'radash';
  import { onMount, tick } from 'svelte';
  import { writable } from 'svelte/store';
  import { browser } from '$app/environment';
  import { portal } from '$lib/svelte/actions';
  import { arrow, createFloatingActions } from '$lib/svelte-floating-ui';
  import { isEmptyTextBlock, isMobile } from '$lib/utils';
  import type { VirtualElement } from '@floating-ui/dom';

  let key = 'share-bubble-menu';
  export let editor: Editor;
  let _class: string | undefined = undefined;
  export { _class as class };

  const arrowRef = writable<HTMLElement | null>(null);
  let open = false;
  let preventUpdate = false;

  let mobile: boolean | undefined;

  $: if (browser) {
    mobile = isMobile();
  }

  const [floatingRef, floatingContent, updatePosition] = createFloatingActions({
    strategy: 'absolute',
    middleware: [offset(8), flip(), shift({ padding: 8 }), arrow({ element: arrowRef })],
    onComputed({ placement, middlewareData }) {
      if (placement !== 'right' && isiOS()) {
        open = false;
      }

      if (!middlewareData.arrow) throw new Error('arrow middleware is not registered');

      const { x, y } = middlewareData.arrow;
      const staticSide = {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right',
      }[placement.split('-')[0]];

      if (!staticSide) throw new Error('invalid placement');
      if (!$arrowRef) return;

      Object.assign($arrowRef.style, {
        left: x == null ? '' : `${x}px`,
        top: y == null ? '' : `${y}px`,
        [staticSide]: '-0.25rem',
      });
    },
  });

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

    const targetEl: VirtualElement = {
      getBoundingClientRect: () => posToDOMRect(view, to, to),
    };
    floatingRef(targetEl);

    updatePosition({ placement: mobile ? 'right' : 'bottom' });
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
    class={clsx('z-1 select-none bg-gray-90 text-sm text-gray-30 rounded-lg p-2', _class)}
    role="menu"
    tabindex="-1"
    on:mousedown|stopPropagation={() => (preventUpdate = true)}
    use:floatingContent
    use:portal
  >
    <slot />
    <div bind:this={$arrowRef} class="absolute square-2 rotate-45 bg-gray-90" />
  </div>
{/if}
