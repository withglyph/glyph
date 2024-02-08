<script lang="ts">
  import { offset } from '@floating-ui/dom';
  import { Editor, posToDOMRect } from '@tiptap/core';
  import { tick } from 'svelte';
  import { writable } from 'svelte/store';
  import { portal } from '$lib/svelte/actions';
  import { arrow, computeArrowPosition, createFloatingActions } from '$lib/svelte-floating-ui';
  import type { VirtualElement } from '@floating-ui/dom';
  import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

  export let editor: Editor;
  export let node: ProseMirrorNode;
  export let getPos: () => number;

  let open = false;

  const arrowRef = writable<HTMLElement | null>(null);

  const [floatingRef, floatingContent] = createFloatingActions({
    placement: 'top',
    middleware: [offset(10), arrow({ element: arrowRef })],
    onComputed(position) {
      if ($arrowRef) {
        Object.assign($arrowRef.style, computeArrowPosition(position, '-6px'));
      }
    },
  });

  $: update(editor);

  const update = async (editor: Editor) => {
    const { from, to } = editor.state.selection;
    if (from !== getPos() || to !== getPos() + node.nodeSize) {
      open = false;
      return;
    }

    open = true;
    await tick();

    const targetEl: VirtualElement = {
      getBoundingClientRect: () => posToDOMRect(editor.view, from, to),
    };

    floatingRef(targetEl);
  };
</script>

{#if open}
  <div
    class="relative bg-white border border-gray-200 rounded-4px shadow-[0_2px_8px_0] shadow-black/6"
    use:floatingContent
    use:portal
  >
    <div bind:this={$arrowRef} class="z-1 absolute square-12px rotate-45 bg-white border border-gray-200" />
    <div class="z-2 bg-white rounded-4px px-8px py-6px relative flex center gap-4px <sm:gap-8px">
      <slot />
    </div>
  </div>
{/if}
