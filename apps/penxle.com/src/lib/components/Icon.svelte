<script lang="ts">
  import { css } from '$styled-system/css';
  import type { ComponentType } from 'svelte';
  import type { SystemStyleObject } from '$styled-system/types';

  export let icon: ComponentType;
  export let style: SystemStyleObject | undefined = undefined;
</script>

<svelte:component
  this={icon}
  class={css(
    {
      'display': 'block',
      'verticalAlign': 'middle',
      'flex': 'none',
      '& *': { strokeWidth: '[1.5]' },
    },
    style,
  )}
/>
