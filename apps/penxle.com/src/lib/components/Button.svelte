<script lang="ts">
  import { RingSpinner } from '@penxle/ui/spinners';
  import { clsx } from 'clsx';
  import { getFormContext } from '$lib/form';

  export let type: 'button' | 'submit' = 'button';
  let _class: string | undefined = undefined;
  export { _class as class };
  export let disabled = false;
  export let loading = false;
  export let color: 'primary' | 'secondary' | 'tertiary' = 'secondary';
  export let variant: 'text' | 'outlined' | 'contained' = 'contained';
  export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  const { form } = getFormContext();
  const { isSubmitting } = form ?? {};

  $: showSpinner = !!(loading || (type === 'submit' && $isSubmitting));
</script>

<button
  class={clsx(
    'relative flex center rounded-2xl px-4 py-2 font-bold leading-none transition duration-300 text-center text-3.25',
    disabled && 'text-gray-40 bg-gray-30',
    disabled &&
      variant === 'outlined' &&
      'text-gray-40! border-gray-30! bg-transparent!',
    size === 'xs' && 'px-0! py-0! h-5.75',
    size === 'sm' && 'px-0! py-0! h-6.5',
    size === 'md' && 'text-sm h-9',
    size === 'lg' && 'text-base h-10',
    size === 'xl' && 'text-base h-12.5',
    !disabled &&
      variant === 'text' &&
      'text-gray-90 bg-transparent hover:text-gray-80',
    !disabled &&
      color === 'primary' &&
      variant === 'contained' &&
      'text-brand-90 bg-brand-50 hover:bg-brand-55 active:bg-brand-55',
    !disabled &&
      color === 'secondary' &&
      variant === 'contained' &&
      'text-red-5 bg-gray-90 hover:bg-gray-80 active:bg-black',
    !disabled &&
      color === 'tertiary' &&
      variant === 'contained' &&
      'text-gray-90 bg-gray-10 hover:bg-gray-20 active:bg-gray-20',
    !disabled &&
      color === 'tertiary' &&
      variant === 'outlined' &&
      'text-gray-90 bg-transparent border border-gray-30 hover:bg-gray-10 active:(bg-gray-10 border-gray-90)',
    _class,
  )}
  disabled={disabled || showSpinner}
  {type}
  on:click
>
  {#if showSpinner}
    <div class="absolute inset-0 flex center px-4 py-2">
      <RingSpinner class="h-full" />
    </div>
  {/if}
  <div class={clsx('contents', showSpinner && 'invisible')}>
    <slot />
  </div>
</button>
