<script lang="ts">
  import { css, cva } from '$styled-system/css';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { SystemStyleObject } from '$styled-system/types';

  export let size: 'sm' | 'lg' = 'lg';
  export let theme: 'dark' | 'light' = 'light';
  export let style: SystemStyleObject | undefined = undefined;

  export let as: 'div' | 'a' | 'label' | 'button' = 'a';
  export let checked = false;
  export let name: string | undefined = undefined;

  type $$Events = {
    change: Parameters<NonNullable<HTMLInputAttributes['on:change']>>[0];
    click: Event & { currentTarget: HTMLButtonElement };
  };

  const recipe = cva({
    base: {
      display: 'inline-block',
      backgroundColor: 'gray.100',
      height: 'fit',
      transition: 'common',
      truncate: true,
      _hover: {
        opacity: '[0.8]',
      },
    },
    variants: {
      size: {
        sm: {
          paddingX: '6px',
          paddingY: '2px',
          fontSize: '12px',
        },
        lg: {
          paddingX: '10px',
          paddingY: '6px',
          fontSize: '13px',
          fontWeight: 'medium',
        },
      },
      theme: {
        light: {
          'color': 'gray.500',
          'backgroundColor': { base: 'gray.50', _hover: 'gray.200' },
          '&:has(:checked)': {
            borderWidth: '1px',
            borderColor: 'gray.300',
          },
        },
        dark: {
          'color': 'gray.0',
          'backgroundColor': 'gray.900',
          '&:has(:checked)': {
            borderWidth: '1px',
            borderColor: 'gray.400',
          },
        },
      },
    },
  });
</script>

<svelte:element
  this={as}
  id={name}
  class={css(
    recipe.raw({ size, theme }),
    as !== 'div' && { cursor: 'pointer' },
    'right-icon' in $$slots && {
      paddingRight: size === 'sm' ? '4px' : '8px',
    },
    style,
  )}
  role={as}
  on:click
  {...$$restProps}
>
  {#if as === 'label'}
    <input class={css({ appearance: 'none' })} aria-checked={checked} type="checkbox" on:change bind:checked />
  {/if}

  <slot />

  {#if 'right-icon' in $$slots}
    <slot name="right-icon" />
  {/if}
</svelte:element>
