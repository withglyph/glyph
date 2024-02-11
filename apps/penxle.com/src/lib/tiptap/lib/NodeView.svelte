<script lang="ts">
  import clsx from 'clsx';
  import { getContext } from 'svelte';
  import type { DragEventHandler } from 'svelte/elements';

  let _class: string | undefined = undefined;
  export { _class as class };

  const onDragStart = getContext<DragEventHandler<HTMLDivElement>>('onDragStart');
</script>

<div
  {...$$restProps}
  class={clsx(_class, 'whitespace-normal')}
  data-node-view
  role="presentation"
  on:dragstart={onDragStart}
>
  <slot />
</div>
