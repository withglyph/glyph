<script lang="ts">
  import {
    arrow,
    computePosition,
    flip,
    offset,
    shift,
  } from '@floating-ui/dom';
  import { writable } from '@svelte-kits/store';
  import { tick } from 'svelte';
  import { scale } from 'svelte/transition';
  import { hover, portal } from '$lib/svelte/actions';

  export let message: string;
  export let placement: 'top' | 'right' | 'bottom' | 'left' = 'bottom';

  let targetEl: HTMLDivElement;
  let tooltipEl: HTMLDivElement;
  let arrowEl: HTMLDivElement;

  const hovered = writable(false);

  const update = async () => {
    await tick();

    const position = await computePosition(targetEl, tooltipEl, {
      placement,
      middleware: [
        offset(8),
        flip(),
        shift({ padding: 8 }),
        arrow({ element: arrowEl }),
      ],
    });

    Object.assign(tooltipEl.style, {
      left: `${position.x}px`,
      top: `${position.y}px`,
    });

    if (position.middlewareData.arrow) {
      const { x, y } = position.middlewareData.arrow;

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
</script>

<div bind:this={targetEl} class="inline" use:hover={hovered}>
  <slot />
</div>

{#if $hovered}
  <div
    bind:this={tooltipEl}
    class="absolute rounded bg-gray-900 px-4 py-2 text-xs font-semibold text-white"
    role="tooltip"
    use:portal
    transition:scale|local={{ start: 0.9, duration: 200 }}
  >
    {message}
    <div bind:this={arrowEl} class="absolute square-2 rotate-45 bg-gray-900" />
  </div>
{/if}
