<script lang="ts">
  import { detectOverflow, hide } from '@floating-ui/dom';
  import { Editor, posToDOMRect } from '@tiptap/core';
  import { tick } from 'svelte';
  import { createFloatingActions } from '$lib/svelte/actions';
  import { css } from '$styled-system/css';
  import { center } from '$styled-system/patterns';
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
    middleware: [
      {
        name: 'bubble',
        fn: async (state) => {
          const overflow = await detectOverflow(state, { altBoundary: true });
          if (overflow.top > 0) {
            const max = state.y - overflow.bottom - 24;

            return {
              y: Math.min(
                state.rects.reference.y + state.rects.reference.height - state.rects.floating.height - 24,
                max,
              ),
              data: {
                bubbled: true,
              },
            };
          }

          return {};
        },
      },
      hide({ strategy: 'escaped' }),
    ],
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
  <div
    class={css({
      borderWidth: '1px',
      borderColor: 'gray.300',
      backgroundColor: 'gray.5',
      boxShadow: '[2px 2px 8px 0 {colors.gray.900/15}]',
    })}
    use:floating
  >
    <div
      class={center({
        position: 'relative',
        gap: '8px',
        paddingX: '14px',
        paddingY: '8px',
        backgroundColor: 'gray.5',
        zIndex: '2',
      })}
    >
      <slot />
    </div>

    <div
      class={css({ borderWidth: '1px', borderColor: 'gray.300', size: '12px', backgroundColor: 'gray.5', zIndex: '1' })}
      use:arrow
    />
  </div>
{/if}
