<script lang="ts">
  import { writable } from 'svelte/store';
  import { scale } from 'svelte/transition';
  import { createFloatingActions, hover } from '$lib/svelte/actions';
  import type { Placement } from '@floating-ui/dom';

  let _class: string | undefined = undefined;
  export { _class as class };
  let _offset: number | undefined = undefined;
  export { _offset as offset };

  export let enabled = true;
  export let message: string;
  export let placement: Placement = 'bottom';

  const hovered = writable(false);

  const { anchor, floating, arrow } = createFloatingActions({
    placement,
    offset: _offset ?? 0,
    arrow: true,
  });
</script>

<div class={_class} use:anchor use:hover={hovered}>
  <slot />
</div>

{#if enabled && $hovered}
  <div
    class="z-100 rounded bg-gray-90 px-4 py-2 text-12-r text-white"
    role="tooltip"
    use:floating
    transition:scale={{ start: 0.9, duration: 200 }}
  >
    {message}
    <div class="square-2 bg-gray-90" use:arrow />
  </div>
{/if}
