<script lang="ts">
  import { offset } from '@floating-ui/dom';
  import { tick } from 'svelte';
  import { writable } from 'svelte/store';
  import { hover, portal } from '$lib/svelte/actions';
  import { createFloatingActions } from '$lib/svelte-floating-ui';
  import type { Placement } from '@floating-ui/dom';

  export let message: string;
  export let placement: Placement = 'bottom';

  const hovered = writable(false);
  let show = false;
  let timer: NodeJS.Timeout | undefined;

  const [floatingRef, floatingContent, update] = createFloatingActions({
    placement,
    middleware: [offset(4)],
  });

  $: if ($hovered) {
    timer = setTimeout(() => {
      // eslint-disable-next-line svelte/infinite-reactive-loop
      show = true;
      tick().then(() => update());
    }, 1000);
  } else {
    clearTimeout(timer);
    show = false;
  }
</script>

<div use:floatingRef use:hover={hovered}>
  <slot />
</div>

{#if show}
  <div
    class="z-100 rounded-2px bg-gray-600 px-10px py-6px text-12-m text-gray-100"
    role="tooltip"
    use:floatingContent
    use:portal
  >
    {message}
  </div>
{/if}
