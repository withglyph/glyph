<script lang="ts">
  import { css, cva } from '$styled-system/css';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { SystemStyleObject } from '$styled-system/types';

  export let size: 'sm' | 'lg' = 'lg';
  export let style: SystemStyleObject | undefined = undefined;

  export let as: 'div' | 'a' | 'label' = 'a';
  export let checked = false;
  export let name: string | undefined = undefined;

  type $$Events = {
    change: Parameters<NonNullable<HTMLInputAttributes['on:change']>>[0];
  };

  const recipe = cva({
    base: {
      borderWidth: '1px',
      borderColor: 'gray.100',
      borderRadius: 'full',
      paddingY: '4px',
      lineHeight: '[1]',
      backgroundColor: 'gray.100',
      transition: 'common',
      transitionDuration: '[300ms]',
      truncate: true,
    },
    variants: {
      size: {
        sm: { paddingX: '8px', fontSize: '13px', fontWeight: 'medium' },
        lg: { paddingX: '16px', fontWeight: 'semibold' },
      },
    },
  });
</script>

<svelte:element
  this={as}
  id={name}
  class={css(
    recipe.raw({ size }),
    checked && { borderColor: 'gray.900' },
    as !== 'div' && { _hover: { borderColor: 'gray.200', backgroundColor: 'gray.200' } },
    style,
  )}
  {...$$restProps}
>
  {#if as === 'label'}
    <input class={css({ appearance: 'none' })} aria-checked={checked} type="checkbox" on:change bind:checked />
  {/if}
  <slot />
</svelte:element>
