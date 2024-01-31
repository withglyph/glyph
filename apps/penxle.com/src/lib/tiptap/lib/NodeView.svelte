<script lang="ts">
  import { getContext } from 'svelte';
  import type { DragEventHandler } from 'svelte/elements';

  const onDragStart = getContext<DragEventHandler<HTMLDivElement>>('onDragStart');
</script>

<div data-node-view {...$$restProps} role="presentation" on:dragstart={onDragStart}>
  <slot />
</div>
