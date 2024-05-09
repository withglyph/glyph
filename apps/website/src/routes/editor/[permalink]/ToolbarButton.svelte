<script generics="T extends 'button' | 'link' = 'button'" lang="ts">
  import { Icon } from '$lib/components';
  import { css } from '$styled-system/css';
  import type { ComponentType } from 'svelte';
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
  import type { SystemStyleObject } from '$styled-system/types';

  type $$Props = {
    type?: T;
    icon: ComponentType;
    label?: string;
    style?: SystemStyleObject;
    size?: 'sm' | 'lg';
  } & Omit<
    T extends 'link' ? HTMLAnchorAttributes & { external?: boolean } : Omit<HTMLButtonAttributes, 'type'>,
    'class' | 'style'
  >;

  export let type: 'button' | 'link' = 'button';
  export let external = false;
  export let icon: ComponentType;
  export let style: SystemStyleObject | undefined = undefined;

  export let label: string | undefined = undefined;
  export let size: 'sm' | 'lg' = 'sm';
</script>

<svelte:element
  this={type === 'link' ? 'a' : 'button'}
  class={css(
    {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '2px',
      color: 'gray.800',
      _enabled: { backgroundColor: { _hover: 'gray.100' } },
      _pressed: { backgroundColor: { base: 'gray.900', _hover: 'gray.600!' }, color: 'gray.5' },
      _disabled: { color: 'gray.300' },
    },
    size === 'sm' && {
      size: '24px',
    },
    size === 'lg' && {
      size: '54px',
    },
    style,
  )}
  role="button"
  tabindex="0"
  on:click
  {...$$restProps}
  {...external && {
    target: '_blank',
    rel: 'noopener noreferrer',
  }}
>
  <Icon style={css.raw({ margin: '2px' })} {icon} size={20} />
  {#if label}
    <span class={css({ fontSize: '11px' })}>{label}</span>
  {/if}
</svelte:element>
