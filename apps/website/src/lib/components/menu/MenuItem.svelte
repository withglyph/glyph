<script generics="T extends 'button' | 'div' | 'link' = 'button'" lang="ts">
  import { getContext } from 'svelte';
  import { css } from '$styled-system/css';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import type { SystemStyleObject } from '$styled-system/types';

  type $$Props = {
    type?: T;
    style?: SystemStyleObject;
    disabled?: boolean;
  } & (T extends 'link' ? { href: string; external?: boolean } : unknown) &
    (T extends 'button' ? Omit<HTMLButtonAttributes, 'type' | 'style' | 'disabled'> : unknown);

  type $$Events = T extends 'link' ? unknown : { click: MouseEvent; mouseenter: MouseEvent };

  export let type: 'button' | 'div' | 'link' = 'button';

  export let style: SystemStyleObject | undefined = undefined;

  export let disabled = false;
  export let href: string | undefined = undefined;
  export let external = !href?.startsWith('/');

  let element: 'a' | 'button' | 'div';
  $: element = type === 'link' ? 'a' : type;
  $: props =
    (type === 'link' && { href: disabled || href }) || (type === 'button' && { type: 'button', disabled }) || {};

  let close = getContext<undefined | (() => void)>('close');
</script>

<svelte:element
  this={element}
  class={css(
    {
      paddingX: '14px',
      paddingY: '12px',
      width: 'full',
      fontSize: '13px',
      fontWeight: 'medium',
      textAlign: 'left',
      color: 'gray.600',
      borderBottomWidth: '1px',
      borderBottomColor: 'gray.200',
      _last: { borderBottomWidth: '0' },
    },
    disabled ? { cursor: 'not-allowed' } : { _hover: { backgroundColor: 'gray.100', color: 'gray.900' } },
    style,
  )}
  role="menuitem"
  tabindex="-1"
  on:click
  on:click={close}
  on:mouseenter
  {...external && {
    target: '_blank',
    rel: 'noopener noreferrer',
  }}
  {...props}
  {...$$restProps}
>
  <slot />
</svelte:element>
