<script lang="ts">
  import { clsx } from 'clsx';
  import { RingSpinner } from '$lib/components/spinners';
  import { getFormContext } from '$lib/form';

  export let type: 'button' | 'submit' = 'button';
  let _class: string | undefined = undefined;
  export { _class as class };
  export let disabled = false;
  export let loading = false;
  export let color: 'brand' | 'black' = 'black';

  const { form } = getFormContext();
  const { isSubmitting } = form ?? {};

  $: showSpinner = !!(loading || (type === 'submit' && $isSubmitting));
</script>

<button
  class={clsx(
    'relative flex center rounded-lg px-5.5 py-2.5 font-bold leading-none transition duration-300 text-center',
    disabled && 'text-gray-50 bg-gray-30 opacity-50',
    !disabled &&
      color === 'brand' &&
      'text-brand-90 bg-brand-50 hover:bg-brand-55 active:bg-brand-55',
    !disabled &&
      color === 'black' &&
      'text-white bg-gray-80 hover:bg-gray-90 active:bg-black',
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
