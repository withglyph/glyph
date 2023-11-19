<script lang="ts">
  import { arrow, computePosition, flip, offset, shift } from '@floating-ui/dom';
  import { tick } from 'svelte';
  import { writable } from 'svelte/store';
  import { scale } from 'svelte/transition';
  import { hover, portal } from '$lib/svelte/actions';
  import type { Editor } from '@tiptap/core';

  export let editor: Editor | undefined;

  let targetEl: HTMLDivElement;
  let tooltipEl: HTMLDivElement;
  let arrowEl: HTMLDivElement;

  const hovered = writable(false);

  const update = async () => {
    await tick();

    const position = await computePosition(targetEl, tooltipEl, {
      placement: 'bottom',
      middleware: [offset(8), flip(), shift({ padding: 8 }), arrow({ element: arrowEl })],
    });

    Object.assign(tooltipEl.style, {
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
  };

  $: if ($hovered) {
    void update();
  }

  $: doc = editor?.state.doc;
  $: text = doc?.textBetween(0, doc.content.size);
  $: countWithWhitespace = text?.length ?? 0;
  $: countWithoutWhitespace = text?.replaceAll(/\s/g, '').length ?? 0;
</script>

<div bind:this={targetEl} class="body-15-b w-fit" use:hover={hovered}>
  <mark class="text-blue-50">{countWithWhitespace}</mark>
  자
</div>

{#if $hovered}
  <div
    bind:this={tooltipEl}
    class="absolute z-100 rounded px-3 py-2 shadow-[0_2px_10px_0_rgba(0,0,0,0.10)] bg-cardprimary text-primary"
    role="tooltip"
    use:portal
    transition:scale={{ start: 0.9, duration: 200 }}
  >
    <div class="caption-12-m">
      <span class="text-secondary w-17.5 inline-block">공백 미포함</span>
      <span class="text-rights">{countWithoutWhitespace}자</span>
    </div>
    <div class="caption-12-m">
      <span class="text-secondary w-17.5 inline-block">공백 포함</span>
      <span class="text-rights">{countWithWhitespace}자</span>
    </div>

    <div bind:this={arrowEl} class="absolute square-2 rotate-45 bg-cardprimary" />
  </div>
{/if}
