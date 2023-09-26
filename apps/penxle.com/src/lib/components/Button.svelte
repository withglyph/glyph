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
  } & (T extends 'link' ? { href: string } : unknown);

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
    'flex center px-4 py-2 font-bold leading-none transition duration-300 text-center text-3.25',
    showSpinner && 'relative',
    disabled && 'text-gray-40 bg-gray-30',
    disabled && variant === 'outlined' && 'text-gray-40! border-gray-30! bg-transparent!',
    size === 'xs' && 'px-0! py-0! h-5.75 rounded-2xl',
    size === 'sm' && 'p-2! h-6.5 rounded-lg',
    size === 'md' && 'text-sm h-9 rounded-2.5',
    size === 'lg' && 'text-base h-10 rounded-xl',
    size === 'xl' && 'text-base h-12.5 rounded-2xl',
    !disabled && variant === 'text' && 'text-gray-90 bg-transparent hover:text-gray-80',
    !disabled &&
      color === 'primary' &&
      variant === 'contained' &&
      'text-red-5 bg-gray-90 border border-gray-90 hover:bg-gray-80 active:bg-black',
    !disabled &&
      color === 'secondary' &&
      variant === 'contained' &&
      'text-gray-90 bg-gray-10 border border-gray-10 hover:bg-gray-20 active:bg-gray-20',
    !disabled &&
      color === 'tertiary' &&
      variant === 'outlined' &&
      'text-gray-90 bg-transparent border border-gray-30 hover:bg-gray-10 active:(bg-gray-10 border-gray-90)',
    _class,
  )}
  role="button"
  tabindex="-1"
  on:click
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
