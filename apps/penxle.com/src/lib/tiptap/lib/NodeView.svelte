<script lang="ts">
  import clsx from 'clsx';
  import { getContext } from 'svelte';
  import type { DragEventHandler } from 'svelte/elements';

  const onDragStart = getContext<DragEventHandler<HTMLDivElement>>('onDragStart');
</script>

<div
  {...$$restProps}
  class={clsx('touch-none', $$restProps.class)}
  data-node-view
  role="presentation"
  on:dragstart={onDragStart}
  on:touchmove|nonpassive|preventDefault
  on:contextmenu|preventDefault
>
  <slot />
</div>
