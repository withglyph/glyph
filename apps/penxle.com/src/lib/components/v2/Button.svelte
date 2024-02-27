<script generics="T extends 'button' | 'submit' | 'link' = 'button'" lang="ts">
  import { RingSpinner } from '@penxle/ui/spinners';
  import { clsx } from 'clsx';
  import { getFormContext } from '$lib/form';
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

  type $$Props = {
    type?: T;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'secondary-outline';
    size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  } & (T extends 'link' ? HTMLAnchorAttributes & { external?: boolean } : Omit<HTMLButtonAttributes, 'type'>);

  type $$Events = T extends 'link' ? unknown : { click: MouseEvent };

  export let type: 'button' | 'submit' | 'link' = 'button';

  let _class: string | null | undefined = undefined;
  export { _class as class };

  export let loading = false;
  export let variant: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'secondary-outline' = 'primary';
  export let size: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';

  export let external = false;

  $: element = type === 'link' ? 'a' : 'button';

  const { isSubmitting } = getFormContext().form ?? {};

  $: showSpinner = !!(loading || (type === 'submit' && $isSubmitting));
  $: props =
    type === 'link'
      ? { href: showSpinner ? undefined : $$restProps.href }
      : { disabled: $$restProps.disabled || showSpinner };
</script>

<svelte:element
  this={element}
  class={clsx(
    'text-center outline-offset-0',
    showSpinner && 'relative',
    variant === 'primary' &&
      'color-white bg-gray-950 hover:bg-gray-800 focus-visible:bg-gray-800 active:shadow-[0_0_0_2px_#A1A1AA] aria-pressed:bg-gray-800 disabled:(bg-gray-200 shadow-none)',
    variant === 'secondary' &&
      'color-white bg-teal-500 hover:bg-teal-400 focus-visible:bg-teal-400 active:shadow-[0_0_0_2px_#99F6E4] aria-pressed:bg-teal-400 disabled:(bg-gray-200 shadow-none)',
    variant === 'tertiary' &&
      'color-gray-500 bg-gray-100 hover:bg-gray-50 focus-visible:bg-gray-50 active:shadow-[0_0_0_2px_#E4E4E7] aria-pressed:bg-gray-50 disabled:(color-gray-300 bg-gray-50 shadow-none)',
    variant === 'outline' &&
      'color-gray-500 bg-white border-(1px solid gray-200) hover:bg-gray-50 focus-visible:bg-gray-50 active:(border-gray-300 shadow-[0_0_0_2px_#E4E4E7]) aria-pressed:bg-gray-50 disabled:(color-gray-300 border-gray-100 bg-[initial] shadow-none)',
    variant === 'secondary-outline' &&
      'color-teal-500 border-(1px solid teal-500) hover:bg-teal-50 focus-visible:bg-teal-50 active:shadow-[0_0_0_2px_#99F6E4] aria-pressed:bg-teal-50 disabled:(color-gray-300 border-gray-100 bg-[initial] shadow-none)',
    size === '2xs' && 'p-x-0.88rem p-y-0.31rem text-11-sb rounded-1',
    size === 'xs' && 'p-x-0.88rem p-y-2 text-11-sb rounded-1',
    size === 'sm' && 'p-x-0.88rem p-y-2 text-12-sb rounded-1',
    size === 'md' && 'p-x-4 p-y-2 text-14-sb rounded-0.31rem',
    size === 'lg' && 'p-x-5 p-y-0.62rem text-15-sb rounded-0.38rem',
    size === 'xl' && 'p-x-6 p-y-3 text-17-sb rounded-0.44rem',
    _class,
  )}
  aria-busy={showSpinner}
  role="button"
  tabindex="0"
  on:click
  {...$$restProps}
  {...props}
  {...external && {
    target: '_blank',
    rel: 'noopener noreferrer',
  }}
>
  {#if showSpinner}
    <div class="absolute inset-0 flex center px-4 py-2">
      <RingSpinner
        class={clsx('h-full', (variant === 'outline' || variant === 'secondary-outline') && 'color-gray-300')}
      />
    </div>
  {/if}
  <div class={clsx('contents', showSpinner && 'invisible')}>
    <slot />
  </div>
</svelte:element>
