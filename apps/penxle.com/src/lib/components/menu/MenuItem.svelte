<script generics="T extends 'button' | 'submit' | 'link' = 'button'" lang="ts">
  import { clsx } from 'clsx';
  import { getContext } from 'svelte';

  type $$Props = {
    type?: T;
    class?: string;
    disabled?: boolean;
  } & (T extends 'link' ? { href: string; external?: boolean } : unknown);

  type $$Events = T extends 'link' ? unknown : { click: MouseEvent };

  export let type: 'button' | 'submit' | 'link' = 'button';

  let _class: string | undefined = undefined;
  export { _class as class };

  export let disabled = false;
  export let href: string | undefined = undefined;
  export let external = !href?.startsWith('/');

  let element: 'a' | 'button';
  $: element = type === 'link' ? 'a' : 'button';
  $: props = type === 'link' ? { href: disabled || href } : { type, disabled };

  let close = getContext<() => void>('close');
</script>

<svelte:element
  this={element}
  class={clsx('body-14-sb text-secondary px-4 py-3 w-full rounded-lg hover:(bg-primary text-primary)', _class)}
  role="button"
  tabindex="-1"
  type="button"
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
