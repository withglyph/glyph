<script lang="ts">
  import { writable } from 'svelte/store';
  import { createFloatingActions, hover } from '$lib/svelte/actions';
  import { css } from '$styled-system/css';
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
  <div
    class={css({
      borderRadius: '2px',
      paddingX: '10px',
      paddingY: '6px',
      fontSize: '12px',
      fontWeight: 'medium',
      color: 'gray.100',
      backgroundColor: 'gray.600',
      zIndex: '100',
    })}
    role="tooltip"
    use:floating
  >
    {message}
  </div>
{/if}
