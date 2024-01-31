<script lang="ts">
  import { offset } from '@floating-ui/dom';
  import { tick } from 'svelte';
  import { writable } from 'svelte/store';
  import { scale } from 'svelte/transition';
  import { hover, portal } from '$lib/svelte/actions';
  import { arrow, computeArrowPosition, createFloatingActions } from '$lib/svelte-floating-ui';
  import type { Placement } from '@floating-ui/dom';

  let _class: string | undefined = undefined;
  export { _class as class };
  let _offset: number | undefined = undefined;
  export { _offset as offset };

  export let enabled = true;
  export let message: string;
  export let placement: Placement = 'bottom';

  const arrowRef = writable<HTMLElement | null>(null);
  const hovered = writable(false);

  const [floatingRef, floatingContent, update] = createFloatingActions({
    strategy: 'absolute',
    placement,
    middleware: [offset(_offset ?? 0), arrow({ element: arrowRef })],
    onComputed(position) {
      if ($arrowRef) {
        Object.assign($arrowRef.style, computeArrowPosition(position));
      }
    },
  });

  $: if (enabled && $hovered) {
    // eslint-disable-next-line unicorn/prefer-top-level-await
    void tick().then(() => update());
  }
</script>

<div class={_class} use:floatingRef use:hover={hovered}>
  <slot />
</div>

{#if enabled && $hovered}
  <div
    class="z-100 rounded bg-gray-90 px-4 py-2 text-xs font-semibold text-white"
    role="tooltip"
    use:floatingContent
    use:portal
    transition:scale={{ start: 0.9, duration: 200 }}
  >
    {message}
    <div bind:this={$arrowRef} class="absolute square-2 rotate-45 bg-gray-90" />
  </div>
{/if}
