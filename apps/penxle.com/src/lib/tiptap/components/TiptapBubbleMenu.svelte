<script lang="ts">
  import { flip, offset, shift } from '@floating-ui/dom';
  import { Editor, posToDOMRect } from '@tiptap/core';
  import { Plugin, PluginKey } from '@tiptap/pm/state';
  import { EditorView } from '@tiptap/pm/view';
  import clsx from 'clsx';
  import * as R from 'radash';
  import { onMount, tick } from 'svelte';
  import { portal } from '$lib/svelte/actions';
  import { createFloatingActions } from '$lib/svelte-floating-ui';
  import { isEmptyTextBlock } from '$lib/utils';
  import type { VirtualElement } from '@floating-ui/dom';

  export let key = 'bubble-menu';
  export let editor: Editor;
  export let when: ((view: EditorView) => boolean) | undefined = undefined;
  let _class: string | undefined = undefined;
  export { _class as class };

  let open = false;
  let preventUpdate = false;

  const [floatingRef, floatingContent] = createFloatingActions({
    strategy: 'absolute',
    placement: 'top',
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  const update = R.debounce({ delay: 150 }, async (view: EditorView) => {
    if (preventUpdate) {
      preventUpdate = false;
      return;
    }

    const { empty, from, to, $anchor } = view.state.selection;

    if (view.composing || empty || isEmptyTextBlock($anchor.parent) || when?.(view) === false) {
      open = false;
      return;
    }

    open = true;
    await tick();

    const targetEl: VirtualElement = {
      getBoundingClientRect: () => posToDOMRect(view, from, to),
    };

    floatingRef(targetEl);
  });

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
    class={clsx('z-25 select-none', _class)}
    role="menu"
    tabindex="-1"
    on:mousedown|stopPropagation={() => (preventUpdate = true)}
    use:floatingContent
    use:portal
  >
    <slot />
  </div>
{/if}
