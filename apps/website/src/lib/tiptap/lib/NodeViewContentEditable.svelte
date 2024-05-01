<script lang="ts">
  import { css } from '$styled-system/css';
  import type { SystemStyleObject } from '$styled-system/types';

  export let as: keyof HTMLElementTagNameMap = 'div';
  export let style: SystemStyleObject | undefined = undefined;
</script>

<svelte:element this={as} {...$$restProps} class={css(style)} data-node-view-content-editable>
  <slot />
</svelte:element>
