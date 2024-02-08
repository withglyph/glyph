<script lang="ts">
  import { getContext } from 'svelte';
  import type { DragEventHandler } from 'svelte/elements';

  const onDragStart = getContext<DragEventHandler<HTMLDivElement>>('onDragStart');
</script>

<div {...$$restProps} data-node-view role="presentation" on:dragstart={onDragStart}>
  <slot />
</div>
