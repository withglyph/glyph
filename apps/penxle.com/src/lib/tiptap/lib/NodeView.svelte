<script lang="ts">
  import { getContext } from 'svelte';
  import { css } from '$styled-system/css';
  import type { DragEventHandler } from 'svelte/elements';
  import type { SystemStyleObject } from '$styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;

  const onDragStart = getContext<DragEventHandler<HTMLDivElement>>('onDragStart');
</script>

<div
  {...$$restProps}
  style={css({ whiteSpace: 'normal' }, style)}
  data-node-view
  role="presentation"
  on:dragstart={onDragStart}
>
  <slot />
</div>
