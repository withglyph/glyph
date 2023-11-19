<script lang="ts">
  import { computePosition, flip, offset, shift } from '@floating-ui/dom';
  import clsx from 'clsx';
  import { tick } from 'svelte';
  import { portal } from '$lib/svelte/actions';
  import type { ReferenceElement } from '@floating-ui/dom';

  let _class: string | undefined = undefined;
  export { _class as class };
  export let as: keyof HTMLElementTagNameMap = 'div';
  export let referenceEl: ReferenceElement;
  export let show = false;
  export let placement: 'top' | 'right' | 'bottom' | 'left' = 'bottom';

  let targetEl: HTMLElement;

  const update = async () => {
    await tick();

    const position = await computePosition(referenceEl, targetEl, {
      placement,
      middleware: [offset(8), flip(), shift({ padding: 8 })],
    });

    Object.assign(targetEl.style, {
      left: `${position.x}px`,
      top: `${position.y}px`,
    });
  };

  $: if (show) {
    void update();
  }
</script>

{#if show}
  <svelte:element this={as} bind:this={targetEl} class={clsx('absolute', _class)} use:portal>
    <slot />
  </svelte:element>
{/if}
