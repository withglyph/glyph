<script generics="T extends 'button' | 'div' | 'link' = 'button'" lang="ts">
  import { clsx } from 'clsx';
  import { getContext } from 'svelte';

  type $$Props = {
    type?: T;
    class?: string;
    disabled?: boolean;
  } & (T extends 'link' ? { href: string; external?: boolean } : unknown) &
    (T extends 'button' ? { 'aria-pressed'?: boolean } : unknown);

  type $$Events = T extends 'link' ? unknown : { click: MouseEvent };

  export let type: 'button' | 'div' | 'link' = 'button';

  let _class: string | undefined = undefined;
  export { _class as class };

  export let disabled = false;
  export let href: string | undefined = undefined;
  export let external = !href?.startsWith('/');

  let element: 'a' | 'button' | 'div';
  $: element = type === 'link' ? 'a' : type;
  $: props =
    (type === 'link' && { href: disabled || href }) || (type === 'button' && { type: 'button', disabled }) || {};

  let close = getContext<undefined | (() => void)>('close');
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<svelte:element
  this={element}
  class={clsx(
    'text-14-r px-3.5 py-3 w-full rounded-2',
    disabled ? 'cursor-not-allowed' : 'hover:(bg-teal-50 text-teal-600)',
    _class,
  )}
  on:click
  on:click={close}
  {...external && {
    target: '_blank',
    rel: 'noopener noreferrer',
  }}
  {...props}
>
  <slot />
</svelte:element>
