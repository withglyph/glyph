<script lang="ts">
  import { writable } from 'svelte/store';
  import { createFloatingActions, hover } from '$lib/svelte/actions';
  import type { Placement } from '@floating-ui/dom';

  export let message: string;
  export let placement: Placement = 'bottom';

  const hovered = writable(false);
  let show = false;
  let timer: NodeJS.Timeout | undefined;

  const { anchor, floating } = createFloatingActions({
    placement,
    offset: 4,
  });

  $: if ($hovered) {
    timer = setTimeout(() => {
      // eslint-disable-next-line svelte/infinite-reactive-loop
      show = true;
    }, 1000);
  } else {
    clearTimeout(timer);
    show = false;
  }
</script>

<div use:anchor use:hover={hovered}>
  <slot />
</div>

{#if show}
  <div class="z-100 rounded-2px bg-gray-600 px-10px py-6px text-12-m text-gray-100" role="tooltip" use:floating>
    {message}
  </div>
{/if}
