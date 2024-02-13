<script lang="ts">
  import { Editor, posToDOMRect } from '@tiptap/core';
  import { tick } from 'svelte';
  import { createFloatingActions } from '$lib/svelte/actions';
  import type { VirtualElement } from '@floating-ui/dom';
  import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

  export let editor: Editor;
  export let node: ProseMirrorNode;
  export let getPos: () => number;

  let open = false;

  const { anchor, floating, arrow } = createFloatingActions({
    placement: 'top',
    offset: 10,
    arrow: true,
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
      contextElement: editor.view.dom,
    };

    anchor(targetEl);
  };
</script>

{#if open}
  <div class="bg-white border border-gray-200 rounded-4px shadow-[0_2px_8px_0] shadow-black/6" use:floating>
    <div class="z-2 bg-white rounded-4px px-8px py-6px relative flex center gap-4px <sm:gap-8px">
      <slot />
    </div>

    <div class="z-1 square-12px bg-white border border-gray-200" use:arrow />
  </div>
{/if}
