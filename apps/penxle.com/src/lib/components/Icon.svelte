<script lang="ts">
  import { css, cva } from '$styled-system/css';
  import type { ComponentType } from 'svelte';
  import type { SystemStyleObject } from '$styled-system/types';

  export let icon: ComponentType;
  export let style: SystemStyleObject | undefined = undefined;
  export let size: 12 | 16 | 20 | 24 | 28 | 32 = 16;

  const recipe = cva({
    base: {
      display: 'block',
      verticalAlign: 'middle',
      flex: 'none',
      transition: 'common',
    },
    variants: {
      size: {
        12: { 'size': '12px', '& *': { strokeWidth: '[1]' } },
        16: { 'size': '16px', '& *': { strokeWidth: '[1.5]' } },
        20: { 'size': '20px', '& *': { strokeWidth: '[1.5]' } },
        24: { 'size': '24px', '& *': { strokeWidth: '[1.5]' } },
        28: { 'size': '28px', '& *': { strokeWidth: '[2]' } },
        32: { 'size': '32px', '& *': { strokeWidth: '[2]' } },
      },
    },
  });

  $: _style = recipe.raw({ size });
</script>

<svelte:component this={icon} class={css(_style, style)} />
