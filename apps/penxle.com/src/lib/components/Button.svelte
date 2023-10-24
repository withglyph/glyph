<script generics="T extends 'button' | 'submit' | 'link' = 'button'" lang="ts">
  import { RingSpinner } from '@penxle/ui/spinners';
  import { clsx } from 'clsx';
  import { getFormContext } from '$lib/form';

  type $$Props = {
    type?: T;
    class?: string;
    disabled?: boolean;
    loading?: boolean;
    color?: 'primary' | 'secondary' | 'tertiary';
    variant?: 'text' | 'outlined' | 'contained';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  } & (T extends 'link' ? { href: string; external?: boolean } : unknown);

  type $$Events = T extends 'link' ? unknown : { click: MouseEvent };

  export let type: 'button' | 'submit' | 'link' = 'button';

  let _class: string | undefined = undefined;
  export { _class as class };

  export let disabled = false;
  export let loading = false;
  export let color: 'primary' | 'secondary' | 'tertiary' = 'primary';
  export let variant: 'text' | 'outlined' | 'contained' = 'contained';
  export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';

  export let href: string | undefined = undefined;
  export let external = !href?.startsWith('/');

  let element: 'a' | 'button';
  $: element = type === 'link' ? 'a' : 'button';
  $: props =
    type === 'link'
      ? { href: disabled || showSpinner ? undefined : href }
      : { type, disabled: disabled || showSpinner };

  const { form } = getFormContext();
  const { isSubmitting } = form ?? {};

  $: showSpinner = !!(loading || (type === 'submit' && $isSubmitting));
</script>

<svelte:element
  this={element}
  class={clsx(
    'flex center px-4 py-2 font-bold leading-none transition duration-300 text-center text-3.25 text-nowrap',
    showSpinner && 'relative',
    disabled && 'text-disabled! bg-gray-30!',
    disabled && variant === 'outlined' && 'text-disabled! border-gray-30! bg-transparent!',
    size === 'xs' && 'px-0! py-0! h-5.75 rounded-2xl',
    size === 'sm' && 'p-2! h-6.5 rounded-lg',
    size === 'md' && 'text-sm h-9 rounded-2.5',
    size === 'lg' && 'text-base h-10 rounded-xl',
    size === 'xl' && 'text-base h-12.5 rounded-2xl',
    !disabled && variant === 'text' && 'text-primary bg-transparent hover:text-gray-80',
    !disabled &&
      color === 'primary' &&
      variant === 'contained' &&
      'text-red-5 bg-gray-80 border border-gray-80 hover:(bg-gray-100 border-gray-100) active:bg-black',
    !disabled &&
      color === 'secondary' &&
      variant === 'contained' &&
      'text-primary bg-surface-primary border border-surface-primary hover:(bg-surface-secondary border-surface-secondary) active:(bg-surface-secondary border-surface-secondary)',
    !disabled &&
      color === 'tertiary' &&
      variant === 'outlined' &&
      'text-primary bg-transparent border border-secondary hover:border-primary active:(bg-primary border-tertiary)',
    _class,
  )}
  role="button"
  tabindex="-1"
  on:click
  {...external && {
    target: '_blank',
    rel: 'noopener noreferrer',
  }}
  {...props}
>
  {#if showSpinner}
    <div class="absolute inset-0 flex center px-4 py-2">
      <RingSpinner class="h-full" />
    </div>
  {/if}
  <div class={clsx('contents', showSpinner && 'invisible')}>
    <slot />
  </div>
</svelte:element>
